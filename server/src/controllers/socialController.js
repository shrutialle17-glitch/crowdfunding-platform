const User = require('../models/User');

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
