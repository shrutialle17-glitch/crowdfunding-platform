const mongoose = require("mongoose");

const kycSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    idDocument: {
      url: { type: String },
      publicId: { type: String },
    },

    selfie: {
      url: { type: String },
      publicId: { type: String },
    },

    addressProof: {
      url: { type: String },
      publicId: { type: String },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KYCSubmission", kycSubmissionSchema);