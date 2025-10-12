const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  subreddit: { type: String, unique: true },
  last_seen_ts: Date,
  after: String,
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feed', feedSchema);
