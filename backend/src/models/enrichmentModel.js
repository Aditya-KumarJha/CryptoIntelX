const mongoose = require('mongoose');

const enrichmentSchema = new mongoose.Schema({
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  tx_count: Number,
  balance: String,
  counterparty_count: Number,
  mixing_pattern_score: Number,
  category: String,
  source: String,
  raw: mongoose.Schema.Types.Mixed,
  last_refreshed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Enrichment', enrichmentSchema);
