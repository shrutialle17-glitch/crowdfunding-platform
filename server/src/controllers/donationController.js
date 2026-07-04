const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const receiptService = require('../services/receiptService');
const notificationService = require('../services/notificationService');
const crypto = require('crypto');

exports.createDonation = async (req, res, next) => {
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
};