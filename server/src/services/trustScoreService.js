const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Update = require('../models/Update');
const Comment = require('../models/Comment');

/**
 * Trust Score Formula (Max 100):
 * Profile Completion: 15%
 * KYC Verification: 25%
 * Successful Campaigns: 30%
 * Campaign Updates: 15%
 * Community Engagement (comments): 15%
 */
exports.calculateTrustScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    let score = 0;

    // 1. Profile Completion (15)
    if (user.name) score += 5;
    if (user.bio) score += 5;
    if (user.avatar && user.avatar.url) score += 5;

    // 2. KYC Verification (25)
    if (user.isVerified) {
      score += 25;
    }

    // 3. Successful Campaigns (30) - max 3 campaigns (10 points each)
    const completedCampaigns = await Campaign.countDocuments({ creator: userId, status: 'completed' });
    score += Math.min(30, completedCampaigns * 10);

    // 4. Campaign Updates (15) - max 3 updates (5 points each)
    const userCampaigns = await Campaign.find({ creator: userId }).select('_id');
    const campaignIds = userCampaigns.map(c => c._id);
    const updateCount = await Update.countDocuments({ campaign: { $in: campaignIds } });
    score += Math.min(15, updateCount * 5);

    // 5. Community Engagement (15) - max 3 comments (5 points each)
    const commentCount = await Comment.countDocuments({ author: userId });
    score += Math.min(15, commentCount * 5);

    // Ensure within bounds
    score = Math.max(0, Math.min(100, score));

    // Update user
    user.trustScore = score;
    await user.save();

    return score;
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return 0;
  }
};
