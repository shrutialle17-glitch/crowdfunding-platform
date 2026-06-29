const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }
}, { _id: false });

const rewardTierSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  claimedCount: { type: Number, default: 0 }
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const fundUtilizationSchema = new mongoose.Schema({
  category: { type: String, required: true },
  percentage: { type: Number, required: true }
});

const timelineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true }
});

const milestoneSchema = new mongoose.Schema({
  percentage: { type: Number, required: true },
  label: { type: String, required: true },
  reachedAt: { type: Date, default: null }
});

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullStory: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Education', 'Health & Medical', 'Disaster Relief', 'Animal Welfare', 'Environment', 'Community Development', 'Arts & Culture', 'Children & Youth', 'Elderly Care', 'Sports'],
    required: true
  },
  coverImage: { type: imageSchema, required: true },
  galleryImages: [{ type: imageSchema }],
  fundingGoal: { type: Number, required: true },
  amountRaised: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  location: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed', 'expired'],
    default: 'pending'
  },
  rejectionReason: { type: String, default: null },
  rewardTiers: [rewardTierSchema],
  faqs: [faqSchema],
  fundUtilization: [fundUtilizationSchema],
  timeline: [timelineSchema],
  milestones: [milestoneSchema],
  featured: { type: Boolean, default: false },
  likeCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 }
}, { timestamps: true });

// Create text index for search
campaignSchema.index({ title: 'text', shortDescription: 'text' });
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ creator: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
