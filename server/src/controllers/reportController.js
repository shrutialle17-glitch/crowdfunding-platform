const Report = require('../models/Report');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const AdminLog = require('../models/AdminLog');

exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find({})
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const { action } = req.body; // e.g., 'dismiss', 'delete_content', 'suspend_user'
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, error: { message: 'Report not found' } });
    }

    if (action === 'suspend_campaign' && report.targetType === 'campaign') {
      await Campaign.findByIdAndUpdate(report.targetId, { status: 'rejected' });
    } else if (action === 'suspend_user' && report.targetType === 'user') {
      // For demo purposes, we change the user's role to 'suspended'
      await User.findByIdAndUpdate(report.targetId, { role: 'suspended' });
    } else if (action === 'delete_content' && report.targetType === 'comment') {
      const Comment = require('../models/Comment');
      await Comment.findByIdAndDelete(report.targetId);
    }

    report.status = 'resolved';
    await report.save();

    await AdminLog.create({
      adminId: req.user.id,
      action: `report_resolved_${action}`,
      targetId: report._id,
      targetModel: 'Report',
      details: `Action taken: ${action}`
    });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
