const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  canonical_address: { type: String, required: true, index: true },
  coin: { type: String, required: true, default: 'ethereum' },
  validation_status: { type: String, enum: ['unknown','syntactic_ok','invalid'], default: 'unknown' },
  first_seen_ts: { type: Date, default: Date.now, index: true },
  last_seen_ts: { type: Date, default: Date.now },
  source_count: { type: Number, default: 0 },
  risk_score: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed },
  latest_enrichment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrichment' }
}, { timestamps: true });

addressSchema.index({ canonical_address: 1, coin: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Address', addressSchema);
