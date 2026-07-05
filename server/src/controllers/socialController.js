const User = require('../models/User');
const Campaign = require('../models/Campaign');

exports.bookmarkCampaign = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const campaignId = req.params.id;

    if (user.bookmarkedCampaigns.includes(campaignId)) {
      user.bookmarkedCampaigns = user.bookmarkedCampaigns.filter(id => id.toString() !== campaignId);
    } else {
      user.bookmarkedCampaigns.push(campaignId);
    }

    await user.save();
    res.status(200).json({ success: true, data: user.bookmarkedCampaigns });
  } catch (error) {
    next(error);
  }
};

exports.likeCampaign = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, error: { message: 'Campaign not found' } });
    }

    const index = user.likedCampaigns.indexOf(campaignId);
    let isLiked = false;

    if (index === -1) {
      user.likedCampaigns.push(campaignId);
      campaign.likes = (campaign.likes || 0) + 1;
      isLiked = true;
    } else {
      user.likedCampaigns.splice(index, 1);
      campaign.likes = Math.max(0, (campaign.likes || 0) - 1);
    }

    await user.save();
    await campaign.save();
    res.status(200).json({ success: true, data: { isLiked, likes: campaign.likes, likedCampaigns: user.likedCampaigns } });
  } catch (error) {
    next(error);
  }
};

exports.followCreator = async (req, res, next) => {
  try {
    const creatorId = req.params.id;
    const user = await User.findById(req.user.id);
    const creator = await User.findById(creatorId);
    
    if (!creator) {
      return res.status(404).json({ success: false, error: { message: 'Creator not found' } });
    }

    if (req.user.id === creatorId) {
      return res.status(400).json({ success: false, error: { message: 'Cannot follow yourself' } });
    }

    const index = user.followedCreators.indexOf(creatorId);
    let isFollowing = false;
    
    if (index === -1) {
      user.followedCreators.push(creatorId);
      if (!creator.followers.includes(req.user.id)) {
        creator.followers.push(req.user.id);
      }
      isFollowing = true;
    } else {
      user.followedCreators.splice(index, 1);
      const followerIndex = creator.followers.indexOf(req.user.id);
      if (followerIndex !== -1) {
        creator.followers.splice(followerIndex, 1);
      }
    }
    
    await user.save();
    await creator.save();
    res.status(200).json({ success: true, data: { isFollowing, followedCreators: user.followedCreators } });
  } catch (error) {
    next(error);
  }
};
