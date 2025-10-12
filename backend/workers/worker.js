const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const Snapshot = require('../src/models/snapshotModel');
const Extraction = require('../src/models/extractionModel');
const Address = require('../src/models/addressModel');
const Feed = require('../src/models/feedsModel');
const { fetchRedditSubreddit, fetchRedditComments } = require('../src/connectors/redditConnector');
const { findCandidates, validateCandidate } = require('../src/workers/extractor');

// avoid reconnecting if already connected (scripts may require this file multiple times)
if (mongoose.connection.readyState !== 1) {
  connectDB();
}

async function processRedditJob({ subreddit, mode='new', limit=25, fetchComments=true, pageAfter=null }){
  const result = await fetchRedditSubreddit(subreddit, mode, limit || 25, pageAfter);
  const posts = result.json?.data?.children || [];
  let saved = 0;
  let extractionsCount = 0;
  let newAddresses = 0;
  // update feed after processing
  const afterToken = result.after || null;
  const now = new Date();
  for (const p of posts){
    const post = p.data;
    console.log('Processing post', post.id, 'title:', (post.title||'').slice(0,80));
    // skip if snapshot already exists (dedupe)
    const existing = await Snapshot.findOne({ post_id: post.id, source: 'reddit' });
    if (existing){
      continue;
    }
    const snap = await Snapshot.create({ source: 'reddit', subreddit, post_id: post.id, url: `https://reddit.com${post.permalink}`, raw: post, sha256: result.sha256 });
    saved++;
    const text = (post.title || '') + '\n' + (post.selftext || '');
    const candidates = findCandidates(text);
    for (const c of candidates){
      const v = validateCandidate(c);
      // avoid duplicate extraction for same snapshot & address
      const existsExt = await Extraction.findOne({ snapshot_id: snap._id, address: c.address });
      if (existsExt) continue;
      await Extraction.create({ snapshot_id: snap._id, address: c.address, coin_candidate: c.coin_candidate, validation_status: v.validation_status, context_snippet: text.substring(0,300), source_path: 'post' });
      extractionsCount++;
        if (v.validation_status === 'syntactic_ok'){
          const now2 = new Date();
          const canonical = (c.address && c.address.startsWith('0x')) ? c.address.toLowerCase() : c.address;
          if (canonical){
            try{
              const up = await Address.findOneAndUpdate({ canonical_address: canonical, coin: c.coin_candidate }, { $inc: { source_count: 1 }, $setOnInsert: { first_seen_ts: now2 }, $set: { last_seen_ts: now2 } }, { upsert: true, new: true });
              if (up && up.source_count === 1) newAddresses++;
            }catch(e){
              console.warn('Address upsert race/duplicate for', canonical, e.message);
            }
          }
        }
    }
    // fetch comments for this post and extract from comment bodies
    try{
      // small delay to avoid hammering Reddit
      await new Promise(r=>setTimeout(r, 1100));
      const commentsResp = await fetchRedditComments(subreddit, post.id);
      const commentsTree = commentsResp.json?.[1]?.data?.children || [];
      for (const cNode of commentsTree){
        const body = cNode?.data?.body || '';
        if (!body) continue;
        const commentCandidates = findCandidates(body);
        for (const cc of commentCandidates){
          const v2 = validateCandidate(cc);
          const existsExt2 = await Extraction.findOne({ snapshot_id: snap._id, address: cc.address });
          if (existsExt2) continue;
          await Extraction.create({ snapshot_id: snap._id, address: cc.address, coin_candidate: cc.coin_candidate, validation_status: v2.validation_status, context_snippet: body.substring(0,300), source_path: 'comment' });
          extractionsCount++;
            if (v2.validation_status === 'syntactic_ok'){
              const now3 = new Date();
              const canonical2 = (cc.address && cc.address.startsWith('0x')) ? cc.address.toLowerCase() : cc.address;
              if (canonical2){
                try{
                  const up2 = await Address.findOneAndUpdate({ canonical_address: canonical2, coin: cc.coin_candidate }, { $inc: { source_count: 1 }, $setOnInsert: { first_seen_ts: now3 }, $set: { last_seen_ts: now3 } }, { upsert: true, new: true });
                  if (up2 && up2.source_count === 1) newAddresses++;
                }catch(e){
                  console.warn('Address upsert race/duplicate for', canonical2, e.message);
                }
              }
            }
        }
      }
    }catch(e){
      console.error('Failed to fetch/process comments for', post.id, e.message);
    }
  }
  // persist feed cursor/state
  try{
    await Feed.findOneAndUpdate({ subreddit }, { $set: { after: afterToken, last_seen_ts: now, updated_at: now } }, { upsert: true });
  }catch(e){
    console.error('Failed to update feed state', e.message);
  }
  // return results and after token for pagination
  return { posts_saved: saved, extractions_found: extractionsCount, new_addresses_added: newAddresses, after: afterToken };
}

module.exports = { processRedditJob };
