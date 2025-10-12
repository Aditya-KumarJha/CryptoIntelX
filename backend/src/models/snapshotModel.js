const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const snapshotSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  source: String,
  subreddit: String,
  post_id: String,
  url: String,
  raw: mongoose.Schema.Types.Mixed,
  sha256: String,
  fetched_at: { type: Date, default: Date.now },
  status: { type: String, default: 'new' }
}, { timestamps: true });

// ensure we don't store the same reddit post twice
snapshotSchema.index({ post_id: 1, source: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Snapshot', snapshotSchema);
