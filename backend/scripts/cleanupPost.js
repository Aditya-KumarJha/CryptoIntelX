const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const Snapshot = require('../src/models/snapshotModel');
const Extraction = require('../src/models/extractionModel');
const Address = require('../src/models/addressModel');

async function cleanupPost() {
  await connectDB();
  
  const postId = '4c6yd0';
  
  console.log(`🧹 Cleaning up post ${postId}...`);
  
  // 1. Find the snapshot
  const snapshot = await Snapshot.findOne({ post_id: postId, source: 'reddit' });
  if (!snapshot) {
    console.log('❌ No snapshot found for this post');
    return;
  }
  
  console.log(`📸 Found snapshot: ${snapshot._id}`);
  
  // 2. Find and delete extractions
  const extractions = await Extraction.find({ snapshot_id: snapshot._id });
  console.log(`🔍 Found ${extractions.length} extractions to delete`);
  
  if (extractions.length > 0) {
    await Extraction.deleteMany({ snapshot_id: snapshot._id });
    console.log(`✅ Deleted ${extractions.length} extractions`);
  }
  
  // 3. Delete the snapshot
  await Snapshot.deleteOne({ _id: snapshot._id });
  console.log(`✅ Deleted snapshot ${snapshot._id}`);
  
  console.log(`🎉 Post ${postId} completely cleaned up and ready for reprocessing`);
  
  process.exit(0);
}

cleanupPost().catch(console.error);