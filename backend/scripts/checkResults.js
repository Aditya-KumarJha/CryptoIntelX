require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Snapshot = require('../src/models/snapshotModel');
const Extraction = require('../src/models/extractionModel');

async function run(){
  await mongoose.connect(process.env.MONGODB_URI);
  const snaps = await Snapshot.countDocuments();
  const exts = await Extraction.countDocuments();
  console.log({ snapshots: snaps, extractions: exts });
  process.exit(0);
}
run().catch(e=>{console.error(e); process.exit(1)});
