const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  address: { type: String, required: true, index: true },
  label: { type: String },
  type: { type: String, default: 'address' },
  risk_score: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const edgeSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'NetworkNode', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'NetworkNode', required: true },
  tx_count: { type: Number, default: 0 },
  total_value: { type: Number, default: 0 },
  relation: { type: String, default: 'transferred' },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const NetworkNode = mongoose.model('NetworkNode', nodeSchema);
const NetworkEdge = mongoose.model('NetworkEdge', edgeSchema);

module.exports = { NetworkNode, NetworkEdge };
