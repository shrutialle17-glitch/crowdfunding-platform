const Campaign = require('../models/Campaign');
const AdminLog = require('../models/AdminLog');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinaryService');
const notificationService = require('../services/notificationService');

exports.getCampaigns = async (req, res, next) => {
  try {
    const { search, category, status, sort } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      // Default to showing only approved and completed campaigns publicly
      query.status = { $in: ['approved', 'completed'] };
    }

    if (category) query.category = category;

    if (search) {
      query.$text = { $search: search };
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'most_funded') {
      sortQuery = { amountRaised: -1 };
    } else if (sort === 'ending_soon') {
      sortQuery = { deadline: 1 };
    }

    const campaigns = await Campaign.find(query)
      .sort(sortQuery)
      .populate('creator', 'name avatar isVerified');

    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

exports.getTrendingCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ status: 'approved' })
      .sort({ amountRaised: -1 })
      .limit(6)
      .populate('creator', 'name avatar isVerified');
      
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'name avatar bio isVerified');

    if (!campaign) {
      return res.status(404).json({ success: false, error: { message: 'Campaign not found', code: 'NOT_FOUND' } });
    }

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedCampaigns = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
       return res.status(404).json({ success: false, error: { message: 'Campaign not found', code: 'NOT_FOUND' } });
    }

    const related = await Campaign.find({ 
      category: campaign.category,
      _id: { $ne: campaign._id },
      status: 'approved'
    }).limit(4).populate('creator', 'name avatar');

    res.status(200).json({ success: true, data: related });
  } catch (error) {
    next(error);
  }
};

exports.createCampaign = async (req, res, next) => {
  try {
    // Basic field extraction
    const { title, shortDescription, fullStory, category, fundingGoal, deadline, location, rewardTiers, faqs, fundUtilization } = req.body;
    
    // We expect coverImage in req.files['coverImage']
    if (!req.files || !req.files['coverImage']) {
      return res.status(400).json({ success: false, error: { message: 'Cover image is required', code: 'BAD_REQUEST' } });
    }

    // Upload cover image
    const coverImageFile = req.files['coverImage'][0];
    const coverImageUpload = await cloudinaryService.uploadImageFromBuffer(coverImageFile.buffer, `kindfund/campaigns/covers`);
    
    let galleryImages = [];
    if (req.files['galleryImages']) {
      for (const file of req.files['galleryImages']) {
        const upload = await cloudinaryService.uploadImageFromBuffer(file.buffer, `kindfund/campaigns/gallery`);
        galleryImages.push(upload);
      }
    }

    // Parse JSON strings to objects if passed via form-data
    let parsedRewardTiers = rewardTiers ? JSON.parse(rewardTiers) : [];
    let parsedFaqs = faqs ? JSON.parse(faqs) : [];
    let parsedFundUtilization = fundUtilization ? JSON.parse(fundUtilization) : [];

    const campaign = await Campaign.create({
      title,
      shortDescription,
      fullStory,
      category,
      fundingGoal: Number(fundingGoal),
      deadline: new Date(deadline),
      location,
      creator: req.user.id,
      coverImage: coverImageUpload,
      galleryImages,
      rewardTiers: parsedRewardTiers,
      faqs: parsedFaqs,
      fundUtilization: parsedFundUtilization,
      status: 'pending', // Requires admin approval
    });

    /*const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin._id,
        type: 'campaign_update',
        title: 'New Campaign Pending Approval',
        message: `A new campaign "${campaign.title}" has been submitted for review.`,
        link: '/admin/approvals'
      });
    }*/

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: { message: 'Campaign not found', code: 'NOT_FOUND' } });
    }

    if (campaign.creator.toString() !== req.user.id) {
       return res.status(403).json({ success: false, error: { message: 'Not authorized', code: 'FORBIDDEN' } });
    }

    let updateData = { ...req.body };

    if (req.files && req.files['coverImage']) {
      const coverImageFile = req.files['coverImage'][0];
      const coverImageUpload = await cloudinaryService.uploadImageFromBuffer(coverImageFile.buffer, `kindfund/campaigns/covers`);
      updateData.coverImage = coverImageUpload;
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    res.status(200).json({ success: true, data: updatedCampaign });
  } catch (error) {
    next(error);
  }
};

exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: { message: 'Campaign not found', code: 'NOT_FOUND' } });
    }

    if (campaign.creator.toString() !== req.user.id) {
       return res.status(403).json({ success: false, error: { message: 'Not authorized', code: 'FORBIDDEN' } });
    }

    if (!['pending', 'rejected'].includes(campaign.status) || campaign.amountRaised > 0) {
       return res.status(400).json({ success: false, error: { message: 'Cannot delete campaign with donations or active status', code: 'BAD_REQUEST' } });
    }

    // Clean up images from Cloudinary
    await cloudinaryService.deleteImage(campaign.coverImage.publicId);
    for (const img of campaign.galleryImages) {
      await cloudinaryService.deleteImage(img.publicId);
    }

    await Campaign.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
exports.approveCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status: 'approved' }, { returnDocument: 'after' });
    
    await AdminLog.create({
      adminId: req.user.id,
      action: 'campaign_approved',
      targetId: campaign._id,
      targetModel: 'Campaign'
    });

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

exports.rejectCampaign = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
       return res.status(400).json({ success: false, error: { message: 'Rejection reason required', code: 'BAD_REQUEST' } });
    }
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: reason }, { returnDocument: 'after' });
    
    await AdminLog.create({
      adminId: req.user.id,
      action: 'campaign_rejected',
      targetId: campaign._id,
      targetModel: 'Campaign',
      details: `Reason: ${reason}`
    });

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

exports.featureCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: { message: 'Campaign not found', code: 'NOT_FOUND' } });
    }

    if (!campaign.featured) {
      const featuredCount = await Campaign.countDocuments({ featured: true });
      if (featuredCount >= 6) {
        return res.status(400).json({ success: false, error: { message: 'Maximum of 6 campaigns can be featured at once.', code: 'BAD_REQUEST' } });
      }
    }

    campaign.featured = !campaign.featured;
    await campaign.save();

    await AdminLog.create({
      adminId: req.user.id,
      action: campaign.featured ? 'campaign_featured' : 'campaign_unfeatured',
      targetId: campaign._id,
      targetModel: 'Campaign'
    });

    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};
