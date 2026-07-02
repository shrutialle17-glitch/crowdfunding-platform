const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Update', updateSchema);
