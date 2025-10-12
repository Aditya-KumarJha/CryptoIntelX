const mongoose = require('mongoose');

const extractionSchema = new mongoose.Schema({
  snapshot_id: { type: String, required: true },
  address: { type: String, required: true },
  coin_candidate: String,
  validation_status: String,
  context_snippet: String,
  source_path: String,
  extracted_at: { type: Date, default: Date.now },
  evidence_score: Number
});

// normalize address (lowercase for hex-like addresses) before save
extractionSchema.pre('save', function(next){
  if (this.address && this.address.startsWith('0x')){
    this.address = this.address.toLowerCase();
  }
  next();
});

extractionSchema.index({ snapshot_id: 1, address: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Extraction', extractionSchema);
