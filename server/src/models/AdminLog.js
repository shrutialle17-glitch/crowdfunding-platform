const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'campaign_approved', 'kyc_rejected', 'report_resolved'
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true }, // e.g., 'Campaign', 'KYCSubmission', 'Report'
  details: { type: String } // optional extra context, like rejection reason
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);
