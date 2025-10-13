const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address_ids: [{ type: String }],
  snapshot_ids: [{ type: String }],
  status: { type: String, default: 'open' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
