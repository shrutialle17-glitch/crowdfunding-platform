const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

exports.checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let newBadges = [];

    // Check "First Donation"
    if (!user.badges.includes('First Donation')) {
      const donationCount = await Donation.countDocuments({ donor: userId, status: 'completed' });
      if (donationCount >= 1) {
        newBadges.push('First Donation');
      }
    }

    // Check "Loyal Supporter" (>= 5 donations)
    if (!user.badges.includes('Loyal Supporter')) {
      const donationCount = await Donation.countDocuments({ donor: userId, status: 'completed' });
      if (donationCount >= 5) {
        newBadges.push('Loyal Supporter');
      }
    }

    // Check "Verified Creator" (Handled partially by KYC, but just in case)
    if (user.isVerified && !user.badges.includes('Verified Creator')) {
      newBadges.push('Verified Creator');
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
      await user.save();

      // Create notifications
      for (const badge of newBadges) {
        await Notification.create({
          user: userId,
          type: 'badge_earned',
          title: 'New Badge Unlocked!',
          message: `Congratulations! You've earned the "${badge}" badge.`
        });
      }
    }
  } catch (error) {
    console.error('Error awarding badges:', error);
  }
};
