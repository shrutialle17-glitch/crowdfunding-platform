const KYCSubmission = require("../models/KYCSubmission");
const User = require("../models/User");

exports.submitKYC = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const existing = await KYCSubmission.findOne({ user: userId });

    if (existing && existing.status === "pending") {
      return res.status(400).json({
        success: false,
        error: {
          message: "KYC already submitted and pending.",
        },
      });
    }

    const submission = await KYCSubmission.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        status: "pending",
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewKYC = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    const submission = await KYCSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: {
          message: "KYC Submission not found",
        },
      });
    }

    submission.status = status;

    if (status === "rejected") {
      submission.rejectionReason = reason;
    }

    submission.reviewedBy = req.user.id;

    await submission.save();

    if (status === "approved") {
      await User.findByIdAndUpdate(submission.user, {
        isVerified: true,
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};