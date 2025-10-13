const mongoose = require('mongoose');

const exportSchema = new mongoose.Schema({
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  case_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  snapshot_ids: [{ type: String }],
  file_path: { type: String },
  redaction: { type: Boolean, default: true },
  reason: { type: String },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Export', exportSchema);
