const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name email role isVerified trustScore kycStatus status createdAt avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateTrustScore = async (req, res, next) => {
  try {
    const { trustScore } = req.body;
    if (typeof trustScore !== 'number') {
      return res.status(400).json({ success: false, error: { message: 'Trust score must be a number' } });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { trustScore },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, isAnonymous } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (typeof isAnonymous !== 'undefined') updateFields.isAnonymous = Boolean(isAnonymous);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    const user = await User.findById(req.user.id);
    
    const index = user.bookmarkedCampaigns.indexOf(campaignId);
    let isBookmarked = false;
    
    if (index === -1) {
      user.bookmarkedCampaigns.push(campaignId);
      isBookmarked = true;
    } else {
      user.bookmarkedCampaigns.splice(index, 1);
    }
    
    await user.save();
    res.status(200).json({ success: true, data: { isBookmarked, bookmarkedCampaigns: user.bookmarkedCampaigns } });
  } catch (error) {
    next(error);
  }
};



exports.getSavedCampaigns = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarkedCampaigns');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.status(200).json({ success: true, data: user.bookmarkedCampaigns });
  } catch (error) {
    next(error);
  }
};
