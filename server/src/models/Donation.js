const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null if anonymous, but wait: the prompt said "anonymous (hides name from public donor list, but admin can still see identity for fraud/audit purposes — donations are never fully anonymous at the database level)"
  // So donor should NOT be null if they are logged in. We will use a boolean `isAnonymous` to hide it.
  // We'll require donor for authenticated donors. If we allow guest donations, it might be null, but the prompt says "Donor: Register/Login -> Donate", implying login is required.
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  isAnonymous: { type: Boolean, default: false },
  rewardTier: { type: mongoose.Schema.Types.ObjectId, default: null }, // references a tier in the Campaign
  status: { type: String, enum: ['completed', 'refunded'], default: 'completed' },
  receiptId: { type: String, required: true, unique: true }
}, { timestamps: true });

// Make sure donor is required based on the schema
donationSchema.path('donor').required(true, 'Donor is required');

module.exports = mongoose.model('Donation', donationSchema);
