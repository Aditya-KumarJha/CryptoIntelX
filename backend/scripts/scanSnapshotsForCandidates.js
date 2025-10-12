const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const Snapshot = require('../src/models/snapshotModel');
const { findCandidates } = require('../src/workers/extractor');
const mongoose = require('mongoose');

async function run(){
  await connectDB();
  // scan recent snapshots (change limit as needed)
  const snaps = await Snapshot.find({}).sort({ fetched_at: -1 }).limit(500);
  console.log('Scanning', snaps.length, 'snapshots for address-like candidates...');
  let hits = 0;
  for (const s of snaps){
    const post = s.raw || {};
    const text = (post.title || '') + '\n' + (post.selftext || '');
    const cands = findCandidates(text);
    if (cands.length > 0){
      hits++;
      console.log('\nSNAPSHOT', s.post_id, s.url, '\n  candidates:', cands.map(c=>c.address + ' ('+c.coin_candidate+')').join(', '));
    }
  }
  console.log('\nDone. Snapshots with candidates:', hits);
  await mongoose.disconnect();
}

run().catch(e=>{ console.error(e); process.exit(1); });
