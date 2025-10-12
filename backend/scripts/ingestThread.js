const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const Snapshot = require('../src/models/snapshotModel');
const Extraction = require('../src/models/extractionModel');
const Address = require('../src/models/addressModel');
const { fetchRedditComments } = require('../src/connectors/redditConnector');
const { findCandidates, validateCandidate } = require('../src/workers/extractor');
const mongoose = require('mongoose');

function parseRedditUrl(u){
  try{
    const url = new URL(u);
    const parts = url.pathname.split('/').filter(Boolean);
    // expected: r/<subreddit>/comments/<postId>/...
    const rIndex = parts.indexOf('r');
    if (rIndex === -1) return null;
    const subreddit = parts[rIndex+1];
    const commentsIndex = parts.indexOf('comments');
    if (commentsIndex === -1) return null;
    const postId = parts[commentsIndex+1];
    return { subreddit, postId };
  }catch(e){ return null; }
}

async function ingest(url){
  await connectDB();
  const parsed = parseRedditUrl(url);
  if (!parsed){
    console.error('Could not parse reddit URL:', url);
    process.exit(1);
  }
  const { subreddit, postId } = parsed;
  console.log('Ingesting', subreddit, postId);
  const resp = await fetchRedditComments(subreddit, postId);
  if (!resp || !resp.json) {
    console.error('Failed to fetch thread', resp && resp.status);
    process.exit(1);
  }
  const post = resp.json[0]?.data?.children?.[0]?.data;
  if (!post){
    console.error('No post data found in thread JSON');
    process.exit(1);
  }
  // check existing snapshot
  const existing = await Snapshot.findOne({ post_id: post.id, source: 'reddit' });
  if (existing){
    console.log('Snapshot already exists:', existing._id);
  } else {
    const snap = await Snapshot.create({ source: 'reddit', subreddit, post_id: post.id, url: `https://reddit.com${post.permalink}`, raw: post, sha256: resp.sha256 });
    console.log('Saved snapshot', snap._id.toString());
  }

  // ensure we operate on the snapshot doc for ids
  const snapDoc = await Snapshot.findOne({ post_id: post.id, source: 'reddit' });
  let savedExtractions = 0;
  let newAddresses = 0;

  // extract from post title + selftext
  const text = (post.title||'') + '\n' + (post.selftext||'');
  const candidates = findCandidates(text);
  for (const c of candidates){
    const v = validateCandidate(c);
    const existsExt = await Extraction.findOne({ snapshot_id: snapDoc._id, address: c.address });
    if (existsExt) continue;
    await Extraction.create({ snapshot_id: snapDoc._id, address: c.address, coin_candidate: c.coin_candidate, validation_status: v.validation_status, context_snippet: text.substring(0,300), source_path: 'post' });
    savedExtractions++;
    if (v.validation_status === 'syntactic_ok'){
      const canonical = (c.address && c.address.startsWith('0x')) ? c.address.toLowerCase() : c.address;
      if (canonical){
        try{
          const up = await Address.findOneAndUpdate({ canonical_address: canonical, coin: c.coin_candidate }, { $inc: { source_count: 1 }, $setOnInsert: { first_seen_ts: Date.now() }, $set: { last_seen_ts: Date.now() } }, { upsert: true, new: true });
          if (up && up.source_count === 1) newAddresses++;
        }catch(e){
          console.warn('Address upsert race/duplicate for', canonical, e.message);
        }
      }
    }
  }

  // comments
  const commentsTree = resp.json[1]?.data?.children || [];
  for (const cNode of commentsTree){
    const body = cNode?.data?.body || '';
    if (!body) continue;
    const cand = findCandidates(body);
    for (const cc of cand){
      const v2 = validateCandidate(cc);
      const existsExt2 = await Extraction.findOne({ snapshot_id: snapDoc._id, address: cc.address });
      if (existsExt2) continue;
      await Extraction.create({ snapshot_id: snapDoc._id, address: cc.address, coin_candidate: cc.coin_candidate, validation_status: v2.validation_status, context_snippet: body.substring(0,300), source_path: 'comment' });
      savedExtractions++;
      if (v2.validation_status === 'syntactic_ok'){
        const canonical2 = (cc.address && cc.address.startsWith('0x')) ? cc.address.toLowerCase() : cc.address;
        if (canonical2){
          try{
            const up2 = await Address.findOneAndUpdate({ canonical_address: canonical2, coin: cc.coin_candidate }, { $inc: { source_count: 1 }, $setOnInsert: { first_seen_ts: Date.now() }, $set: { last_seen_ts: Date.now() } }, { upsert: true, new: true });
            if (up2 && up2.source_count === 1) newAddresses++;
          }catch(e){
            console.warn('Address upsert race/duplicate for', canonical2, e.message);
          }
        }
      }
    }
  }

  console.log('Ingest result -> snapshots_saved: 1 (or existed), extractions_saved:', savedExtractions, 'new_addresses:', newAddresses);
  await mongoose.disconnect();
}

if (!process.argv[2]){
  console.error('Usage: node scripts/ingestThread.js <reddit-thread-url>');
  process.exit(1);
}

ingest(process.argv[2]).catch(e=>{ console.error(e); process.exit(1); });
