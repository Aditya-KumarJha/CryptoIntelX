const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  canonicalAddress: { type: String, required: true, index: true },
  coin: { type: String, required: true, default: 'ethereum' },
  validationStatus: { type: String, enum: ['unknown','valid','invalid'], default: 'unknown' },
  first_seen_ts: { type: Date, default: Date.now, index: true },
  last_seen_ts: { type: Date, default: Date.now },
  source_count: { type: Number, default: 0 },
  risk_score: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

addressSchema.index({ canonicalAddress: 1, coin: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Address', addressSchema);
