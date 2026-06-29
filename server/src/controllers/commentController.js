const Comment = require('../models/Comment');
const Campaign = require('../models/Campaign');
/* const { calculateTrustScore } = require('../services/trustScoreService');
const Notification = require('../models/Notification');*/

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ campaign: req.params.id, isDeleted: false })
      .populate('author', 'name avatar isVerified trustScore')
      .populate({
        path: 'parentComment',
        select: 'author',
        populate: { path: 'author', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

exports.postComment = async (req, res, next) => {
  try {
    const { content, parentComment } = req.body;
    const campaignId = req.params.id;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: { message: 'Campaign not found' } });
    }

    const comment = await Comment.create({
      author: req.user.id,
      campaign: campaignId,
      content,
      parentComment: parentComment || null
    });

    // Notify creator
   /* if (campaign.creator.toString() !== req.user.id) {
      await Notification.create({
        user: campaign.creator,
        type: 'system',
        title: 'New Comment',
        message: `Someone commented on your campaign "${campaign.title}"`,
        link: `/campaigns/${campaignId}`
      });
    }

    // Recalculate trust score for engagement
    await calculateTrustScore(req.user.id); */

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name avatar isVerified trustScore');

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    next(error);
  }
};
