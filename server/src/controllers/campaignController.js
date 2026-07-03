const Campaign = require('../models/Campaign');

exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().populate('creator', 'name email');
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

exports.getTrendingCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ status: "approved" })
      .sort({ amountRaised: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: "Campaign not found" },
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelatedCampaigns = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: "Campaign not found" },
      });
    }

    const related = await Campaign.find({
      category: campaign.category,
      _id: { $ne: campaign._id },
    }).limit(4);

    res.status(200).json({
      success: true,
      data: related,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      creator: req.user.id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: "Campaign not found" },
      });
    }

    if (campaign.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: "Not Authorized" },
      });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCampaign,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: "Campaign not found" },
      });
    }

    await Campaign.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.approveCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason: req.body.reason,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

exports.featureCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: "Campaign not found" },
      });
    }

    campaign.featured = !campaign.featured;
    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};