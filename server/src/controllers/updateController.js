const Update = require('../models/Update');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
//const notificationService = require('../services/notificationService');

exports.createUpdate = async (req, res, next) => {
  try {
    const campaignId = req.params.campaignId;
    //const { campaignId, title, content } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: { message: 'Campaign not found', code: 'NOT_FOUND' } });
    }

    if (campaign.creator.toString() !== req.user.id) {
       return res.status(403).json({ success: false, error: { message: 'Not authorized', code: 'FORBIDDEN' } });
    }

    const update = await Update.create({
      campaign: campaignId,
      title: req.body.title,
      content: req.body.content
    });

    /*const update = await Update.create({
      campaign: campaignId,
      title,
      content
    });*/

    // Notify all unique donors
    const donorIds = await Donation.find({ campaign: campaignId }).distinct('donor');
    // Remove nulls (anonymous donations might be null if not tracked properly, though schema requires donor or null)
    const validDonorIds = donorIds.filter(id => id);

    if (validDonorIds.length > 0) {
      /*await notificationService.notifyMultiple({
        userIds: validDonorIds,
        type: 'campaign_update',
        title: `New update: ${campaign.title}`,
        message: `The creator just posted an update: "${title}"`,
        link: `/campaigns/${campaign._id}`
      });*/
    }

    res.status(201).json({ success: true, data: update });
  } catch (error) {
    next(error);
  }
};

exports.getCampaignUpdates = async (req, res, next) => {
  try {
    const updates = await Update.find({ campaign: req.params.campaignId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    next(error);
  }
};
