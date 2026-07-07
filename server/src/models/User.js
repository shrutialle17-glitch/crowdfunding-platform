const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["donor", "creator", "admin"],
      default: "donor",
    },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    avatar: { type: imageSchema },
    bio: { type: String },
    isVerified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 0 },
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
    },
    followedCreators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarkedCampaigns: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    ],
    likedCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
    badges: [{ type: String }],
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
