const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const Snapshot = require('../src/models/snapshotModel');
const { findCandidates, validateCandidate } = require('../src/workers/extractor');
const mongoose = require('mongoose');

async function run(){
  await connectDB();
  const postId = '4c6yd0'; // from the URL you provided
  const snap = await Snapshot.findOne({ post_id: postId });
  if (!snap){
    console.log('No snapshot found for post_id', postId, '\nTry running a live fetch or check that subreddit was in seeds.');
    await mongoose.disconnect();
    return;
  }
  console.log('Found snapshot:', snap._id.toString(), 'source:', snap.source, 'subreddit:', snap.subreddit);
  const post = snap.raw;
  const text = (post.title || '') + '\n' + (post.selftext || '');
  console.log('Post title:', (post.title||'').slice(0,200));
  const candidates = findCandidates(text);
  console.log('Candidates in post text:', candidates);
  for (const c of candidates){
    console.log('Validation for', c.address, c.coin_candidate, '->', validateCandidate(c));
  }
  await mongoose.disconnect();
}

run().catch(e=>{ console.error(e); process.exit(1); });
