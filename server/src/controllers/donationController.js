const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const receiptService = require('../services/receiptService');
const notificationService = require('../services/notificationService');
const crypto = require('crypto');
const User = require('../models/User');

/*exports.createDonation = async (req, res, next) => {
  try {
    const { amount, isAnonymous } = req.body;
    
    const campaignId = req.params.id;

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }
    
    const receiptId = 'REC-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const donation = await Donation.create({
      donor: req.user.id,
      campaign: campaignId,
      amount,
      isAnonymous,
      receiptId
    });

    // Mock Payment
    campaign.amountRaised += Number(amount);
    await campaign.save();
  
    await notificationService.createNotification({
      userId: campaign.creator,
      type: 'donation',
      title: 'New Donation Received!',
      message: `Someone just donated ₹${donation.amount.toLocaleString()} to your campaign: ${campaign.title}.`,
      link: `/campaigns/${campaign._id}`
    });

    res.status(201).json({
      success: true,
      message: "Donation Successful",
      data: donation
    });

  } catch (error) {
    next(error);
  }
};

exports.downloadReceipt = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('campaign', 'title')
      .populate('donor', 'name');

    if (!donation) {
      return res.status(404).json({ success: false, error: { message: 'Donation not found', code: 'NOT_FOUND' } });
    }

    // Verify ownership or admin
    if (donation.donor._id.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, error: { message: 'Not authorized', code: 'FORBIDDEN' } });
    }

    receiptService.generateReceiptPDF(donation, res);
  } catch (error) {
    next(error);
  }
};*/
exports.createDonation = async (req, res, next) => {
  try {
    const { amount, isAnonymous, rewardTierId } = req.body;
    const campaignId = req.params.id;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== 'approved') {
       return res.status(400).json({ success: false, error: { message: 'Invalid or unapproved campaign', code: 'BAD_REQUEST' } });
    }

    // Generate a receipt ID
    const receiptId = 'REC-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const donation = await Donation.create({
      donor: req.user ? req.user.id : null,
      campaign: campaignId,
      amount: Number(amount),
      isAnonymous: Boolean(isAnonymous),
      rewardTier: rewardTierId || null,
      receiptId
    });

    // Update campaign amount
    campaign.amountRaised += Number(amount);

    // Update reward tier count if applicable
    if (rewardTierId) {
      const tier = campaign.rewardTiers.id(rewardTierId);
      if (tier) tier.claimedCount += 1;
    }

    // Check milestones
    const percentageFunded = (campaign.amountRaised / campaign.fundingGoal) * 100;
    campaign.milestones.forEach(milestone => {
      if (percentageFunded >= milestone.percentage && !milestone.reachedAt) {
        milestone.reachedAt = new Date();
      }
    });

    if (percentageFunded >= 100 && campaign.status !== 'completed') {
      campaign.status = 'completed';
    }

    await campaign.save();

    // Send notification to the creator
    await notificationService.createNotification({
      userId: campaign.creator,
      type: 'donation',
      title: 'New Donation Received!',
      message: `Someone just donated ₹${donation.amount.toLocaleString()} to your campaign: ${campaign.title}.`,
      link: `/campaigns/${campaign._id}`
    });

    // --- FRAUD DETECTION LOGIC ---
    let systemUser = await User.findOne({ email: 'admin@kindfund.local' });
    if (!systemUser) {
      systemUser = { _id: req.user ? req.user.id : campaign.creator }; 
    }

    // 1. Large Donation
    if (amount > 100000) {
      await Report.create({
        reporter: systemUser._id,
        targetType: 'campaign',
        targetId: campaignId,
        reason: `SYSTEM_FRAUD_FLAG: Large single donation of ₹${amount.toLocaleString()}`,
      });
    }

    // 2. High Velocity
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCampaignDonations = await Donation.countDocuments({
      campaign: campaignId,
      createdAt: { $gte: oneHourAgo }
    });
    
    if (recentCampaignDonations > 10) {
      // Check if one already exists recently to avoid spamming
      const existingReport = await Report.findOne({ targetId: campaignId, reason: { $regex: 'HIGH_VELOCITY' }, createdAt: { $gte: oneHourAgo } });
      if (!existingReport) {
        await Report.create({
          reporter: systemUser._id,
          targetType: 'campaign',
          targetId: campaignId,
          reason: `HIGH_VELOCITY: Campaign received ${recentCampaignDonations} donations in the last hour.`,
        });
      }
    }

    if (req.user && req.user.id) {
      // 3. Abuse Pattern
      const recentUserDonations = await Donation.countDocuments({
        donor: req.user.id,
        campaign: campaignId,
        createdAt: { $gte: oneHourAgo }
      });

      if (recentUserDonations >= 5) {
        const existingAbuseReport = await Report.findOne({ targetId: req.user.id, reason: { $regex: 'ABUSE_PATTERN' }, createdAt: { $gte: oneHourAgo } });
        if (!existingAbuseReport) {
          await Report.create({
            reporter: systemUser._id,
            targetType: 'user',
            targetId: req.user.id,
            reason: `ABUSE_PATTERN: User made ${recentUserDonations} donations to the same campaign in the last hour.`,
          });
        }
      }

      // Check and award badges for the donor
      //await badgeService.checkAndAwardBadges(req.user.id);
    }

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ campaign: req.params.id })
      .populate('donor', 'name avatar')
      .sort({ createdAt: -1 });

    // Format output to hide anonymous donors
    const formatted = donations.map(d => {
      const doc = d.toObject();
      if (doc.isAnonymous && (!req.user || req.user.role !== 'admin')) {
        doc.donor = { name: 'Anonymous', avatar: null };
      }
      return doc;
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.getUserDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('campaign', 'title coverImage category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    next(error);
  }
};

exports.downloadReceipt = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('campaign', 'title')
      .populate('donor', 'name');

    if (!donation) {
      return res.status(404).json({ success: false, error: { message: 'Donation not found', code: 'NOT_FOUND' } });
    }

    // Verify ownership or admin
    if (donation.donor._id.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, error: { message: 'Not authorized', code: 'FORBIDDEN' } });
    }

    receiptService.generateReceiptPDF(donation, res);
  } catch (error) {
    next(error);
  }
};

exports.getRecentDonations = async (req, res, next) => {
  try {
    const recent = await Donation.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('campaign', 'title coverImage category')
      .populate('donor', 'name avatar');
      
    // Format output to hide anonymous donors
    const formatted = recent.map(d => {
      const doc = d.toObject();
      if (doc.isAnonymous) {
        doc.donor = { name: 'Anonymous', avatar: null };
      }
      return doc;
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};
