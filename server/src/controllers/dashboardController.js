const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
const AdminLog = require('../models/AdminLog');

exports.getDonorDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Aggregations for total donated and unique campaigns supported
    const stats = await Donation.aggregate([
      { $match: { donor: new mongoose.Types.ObjectId(userId), paymentStatus: 'completed' } },
      { 
        $group: { 
          _id: null, 
          totalDonated: { $sum: '$amount' },
          uniqueCampaigns: { $addToSet: '$campaign' }
        } 
      }
    ]);

    const totalDonated = stats.length > 0 ? stats[0].totalDonated : 0;
    const campaignsSupported = stats.length > 0 ? stats[0].uniqueCampaigns.length : 0;

    // Community impact score (simple derived metric: totalDonated / 100 + campaignsSupported * 5)
    let impactScore = Math.min(100, Math.round((totalDonated / 100) + (campaignsSupported * 5)));

    // Fetch user details for bookmarks/badges/recently viewed
    const user = await User.findById(userId).populate({
      path: 'bookmarkedCampaigns',
      select: 'title coverImage category amountRaised fundingGoal deadline status'
    });

    const recentDonations = await Donation.find({ donor: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('campaign', 'title coverImage');

    res.status(200).json({
      success: true,
      data: {
        totalDonated,
        campaignsSupported,
        impactScore,
        badges: user.badges || [],
        bookmarkedCampaigns: user.bookmarkedCampaigns || [],
        recentDonations
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCreatorDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all campaigns for this creator
    const campaigns = await Campaign.find({ creator: userId });
    const campaignIds = campaigns.map(c => c._id);

    // Total funds raised across all campaigns
    const totalRaised = campaigns.reduce((sum, c) => sum + c.amountRaised, 0);
    const activeCampaignsCount = campaigns.filter(c => c.status === 'approved').length;

    // Funding over time (daily donations)
    const dailyDonations = await Donation.aggregate([
      { $match: { campaign: { $in: campaignIds }, paymentStatus: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for Recharts
    let cumulative = 0;
    const chartData = dailyDonations.map(day => {
      cumulative += day.amount;
      return {
        date: day._id,
        daily: day.amount,
        cumulative
      };
    });

    // Recent supporters
    const recentSupporters = await Donation.find({ campaign: { $in: campaignIds }, paymentStatus: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'name avatar')
      .populate('campaign', 'title');

    // Hide anonymous
    const formattedSupporters = recentSupporters.map(d => {
      const doc = d.toObject();
      if (doc.isAnonymous) {
        doc.donor = { name: 'Anonymous', avatar: null };
      }
      return doc;
    });

    const uniqueSupporters = await Donation.distinct('donor', { campaign: { $in: campaignIds }, paymentStatus: 'completed' });
    const totalSupporters = uniqueSupporters.length;

    res.status(200).json({
      success: true,
      data: {
        totalRaised,
        activeCampaignsCount,
        campaigns,
        chartData,
        recentSupporters: formattedSupporters,
        totalSupporters
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Platform stats
    const totalUsers = await User.countDocuments();
    const totalDonationsAgg = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalVolume = totalDonationsAgg.length > 0 ? totalDonationsAgg[0].total : 0;

    // Campaign stats by status
    const campaignsByStatus = await Campaign.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryDistribution = await Campaign.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Donation volume over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const volumeChart = await Donation.aggregate([
      { $match: { paymentStatus: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%m-%d", date: "$createdAt" } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Pending queues
    const pendingCampaigns = await Campaign.find({ status: 'pending' })
      .populate('creator', 'name email')
      .limit(10);
      
    const approvedCampaigns = await Campaign.find({ status: 'approved' })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);
      
    const pendingKYC = await mongoose.model('KYCSubmission').find({ status: 'pending' })
      .populate('user', 'name email avatar')
      .limit(10);

    // Leaderboards
    const topDonors = await Donation.aggregate([
      { $match: { paymentStatus: 'completed', isAnonymous: false } },
      { $group: { _id: '$donor', totalDonated: { $sum: '$amount' } } },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', totalDonated: 1 } }
    ]);

    // Admin Logs
    const adminLogs = await AdminLog.find()
      .populate('adminId', 'name avatar email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalVolume,
        campaignsByStatus,
        categoryDistribution,
        volumeChart: volumeChart.map(v => ({ date: v._id, amount: v.amount })),
        pendingCampaigns,
        approvedCampaigns,
        pendingKYC,
        topDonors,
        adminLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCreatorSupporters = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all campaigns for this creator
    const campaigns = await Campaign.find({ creator: userId });
    const campaignIds = campaigns.map(c => c._id);

    // Aggregate supporters
    const supporters = await Donation.aggregate([
      { $match: { campaign: { $in: campaignIds }, paymentStatus: 'completed' } },
      { 
        $group: { 
          _id: '$donor',
          totalDonated: { $sum: '$amount' },
          contributionsCount: { $sum: 1 },
          isAnonymous: { $first: '$isAnonymous' },
          lastDonated: { $max: '$createdAt' }
        }
      },
      { $sort: { totalDonated: -1 } }
    ]);

    // Populate donor details (since aggregate doesn't run Mongoose middleware for refs directly)
    const populatedSupporters = await User.populate(supporters, { 
      path: '_id', 
      select: 'name email avatar' 
    });

    const formattedSupporters = populatedSupporters.map(supp => {
      // If anonymous, mask details
      const isAnon = supp.isAnonymous;
      return {
        id: supp._id?._id || 'unknown',
        name: isAnon ? 'Anonymous Supporter' : (supp._id?.name || 'Unknown User'),
        email: isAnon ? 'Hidden' : (supp._id?.email || 'N/A'),
        avatar: isAnon ? null : (supp._id?.avatar || null),
        totalDonated: supp.totalDonated,
        contributionsCount: supp.contributionsCount,
        lastDonated: supp.lastDonated,
        isAnonymous: isAnon
      };
    });

    res.status(200).json({ success: true, data: formattedSupporters });
  } catch (error) {
    next(error);
  }
};
