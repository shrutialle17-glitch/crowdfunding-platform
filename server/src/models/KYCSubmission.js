const mongoose = require('mongoose');

const kycSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  idDocument: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  },
  selfie: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  },
  addressProof: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('KYCSubmission', kycSubmissionSchema);
