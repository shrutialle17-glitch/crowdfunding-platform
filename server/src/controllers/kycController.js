const KYCSubmission = require('../models/KYCSubmission');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinaryService');
const { calculateTrustScore } = require('../services/trustScoreService');
const notificationService = require('../services/notificationService');
const AdminLog = require('../models/AdminLog');

exports.submitKYC = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check existing
    const existing = await KYCSubmission.findOne({ user: userId });
    if (existing && existing.status === 'pending') {
      return res.status(400).json({ success: false, error: { message: 'KYC already pending review' } });
    }

    if (!req.files || !req.files['idDocument'] || !req.files['selfie'] || !req.files['addressProof']) {
      return res.status(400).json({ success: false, error: { message: 'All 3 documents are required' } });
    }

    // Upload to cloudinary
    const idUpload = await cloudinaryService.uploadImageFromBuffer(req.files['idDocument'][0].buffer, `kindfund/kyc/${userId}`);
    const selfieUpload = await cloudinaryService.uploadImageFromBuffer(req.files['selfie'][0].buffer, `kindfund/kyc/${userId}`);
    const addressUpload = await cloudinaryService.uploadImageFromBuffer(req.files['addressProof'][0].buffer, `kindfund/kyc/${userId}`);

    const submission = await KYCSubmission.findOneAndUpdate(
      { user: userId },
      {
        idDocument: idUpload,
        selfie: selfieUpload,
        addressProof: addressUpload,
        status: 'pending'
      },
      { new: true, upsert: true }
    );

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notificationService.createNotification({
        userId: admin._id,
        type: 'system',
        title: 'New KYC Submission',
        message: `A new KYC submission requires your review.`,
        link: '/admin/kyc'
      });
    }

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

exports.reviewKYC = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const submissionId = req.params.id;

    const submission = await KYCSubmission.findById(submissionId).populate('user');
    if (!submission) return res.status(404).json({ success: false, error: { message: 'Not found' } });

    submission.status = status;
    submission.reviewedBy = req.user.id;
    if (status === 'rejected') submission.rejectionReason = reason;

    await submission.save();

    const user = submission.user;
    if (status === 'approved') {
      user.isVerified = true;
      await user.save();
      await calculateTrustScore(user._id);
    }

    // Notify user
    await notificationService.createNotification({
      userId: user._id,
      type: 'kyc_status',
      title: `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved' ? 'Your profile is now verified!' : `KYC Rejected: ${reason}`
    });

    await AdminLog.create({
      adminId: req.user.id,
      action: `kyc_${status}`,
      targetId: submission._id,
      targetModel: 'KYCSubmission',
      details: status === 'rejected' ? `Reason: ${reason}` : ''
    });

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};
