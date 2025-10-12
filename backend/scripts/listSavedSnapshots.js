const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const Snapshot = require('../src/models/snapshotModel');
const mongoose = require('mongoose');

async function run(){
  await connectDB();
  const seeds = ['CryptoCurrency','Bitcoin','ethtrader','Monero','Scams','cryptodevs'];
  for (const s of seeds){
    const snaps = await Snapshot.find({ subreddit: s }).sort({ fetched_at: -1 }).limit(10);
    console.log('\n===', s, 'recent snapshots (count:', snaps.length, ') ===');
    for (const sn of snaps){
      console.log(sn.post_id, '-', sn.url);
    }
  }
  await mongoose.disconnect();
}

run().catch(e=>{ console.error(e); process.exit(1); });
