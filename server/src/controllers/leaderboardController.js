const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const mongoose = require('mongoose');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const { type = 'donors', period = 'all' } = req.query;
    
    // Time filtering
    let dateFilter = {};
    if (period === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    }

    if (type === 'donors') {
      const topDonors = await Donation.aggregate([
        { $match: { paymentStatus: 'completed', isAnonymous: false, ...dateFilter } },
        { $group: { _id: '$donor', totalAmount: { $sum: '$amount' } } },
        { $sort: { totalAmount: -1 } },
        { $limit: 50 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: '$user._id', name: '$user.name', avatar: '$user.avatar', trustScore: '$user.trustScore', badges: '$user.badges', totalAmount: 1 } }
      ]);
      return res.status(200).json({ success: true, data: topDonors });
    } else if (type === 'creators') {
      const topCreators = await Campaign.aggregate([
        { $match: { status: { $in: ['approved', 'completed'] }, ...dateFilter } },
        { $group: { _id: '$creator', totalAmount: { $sum: '$amountRaised' } } },
        { $sort: { totalAmount: -1 } },
        { $limit: 50 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { _id: '$user._id', name: '$user.name', avatar: '$user.avatar', trustScore: '$user.trustScore', badges: '$user.badges', isVerified: '$user.isVerified', totalAmount: 1 } }
      ]);
      return res.status(200).json({ success: true, data: topCreators });
    }

    res.status(400).json({ success: false, error: { message: 'Invalid leaderboard type' } });
  } catch (error) {
    next(error);
  }
};
