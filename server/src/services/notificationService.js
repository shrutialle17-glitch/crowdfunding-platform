const Notification = require('../models/Notification');

exports.createNotification = async ({ userId, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

exports.notifyMultiple = async ({ userIds, type, title, message, link }) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      title,
      message,
      link
    }));
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Failed to create multiple notifications:', error);
  }
};
