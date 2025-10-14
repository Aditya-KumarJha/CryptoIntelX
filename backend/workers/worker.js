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
const { generateDemoAddress } = require('../src/utils/demoAddresses');

// avoid reconnecting if already connected (scripts may require this file multiple times)
if (mongoose.connection.readyState !== 1) {
  connectDB();
}

async function processRedditJob(data) {
  const { subreddit, mode, limit, fetchComments, pageAfter, isManualScan } = data;
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
    
    // DEMO MODE: Only inject demo addresses during scheduled runs, not manual scans
    const demoMode = process.env.DEMO_MODE === 'true';
    if (demoMode && !isManualScan && Math.random() > 0.7) { // Only for scheduled runs, 30% chance
      const demoTypes = ['ethereum', 'bitcoin', 'dogecoin'];
      const numDemo = Math.floor(Math.random() * 2) + 2; // 2-3 addresses
      for (let i = 0; i < numDemo; i++) {
        const coinType = demoTypes[Math.floor(Math.random() * demoTypes.length)];
        const demoAddr = generateDemoAddress(coinType);
        candidates.push({
          address: demoAddr,
          coin_candidate: coinType,
          context: `Demo ${coinType} address for presentation`
        });
      }
      console.log(`📺 DEMO: Added ${numDemo} demo addresses to post ${post.id} (scheduled run)`);
    }
    for (const c of candidates){
      const v = validateCandidate(c);
      // avoid duplicate extraction for same snapshot & address
      const existsExt = await Extraction.findOne({ snapshot_id: snap._id, address: c.address });
      if (existsExt) continue;
      
      const contextSnippet = c.context || text.substring(0,300);
      await Extraction.create({ snapshot_id: snap._id, address: c.address, coin_candidate: c.coin_candidate, validation_status: v.validation_status, context_snippet: contextSnippet, source_path: 'post' });
      extractionsCount++;
        if (v.validation_status === 'syntactic_ok'){
          const now2 = new Date();
          const canonical = (c.address && c.address.startsWith('0x')) ? c.address.toLowerCase() : c.address;
          if (canonical){
            try{
              const up = await Address.findOneAndUpdate(
                { canonical_address: canonical, coin: c.coin_candidate }, 
                { 
                  $inc: { source_count: 1 }, 
                  $setOnInsert: { first_seen_ts: now2, validation_status: 'syntactic_ok' }, 
                  $set: { last_seen_ts: now2 } 
                }, 
                { upsert: true, new: true }
              );
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
                  const up2 = await Address.findOneAndUpdate(
                    { canonical_address: canonical2, coin: cc.coin_candidate }, 
                    { 
                      $inc: { source_count: 1 }, 
                      $setOnInsert: { first_seen_ts: now3, validation_status: 'syntactic_ok' }, 
                      $set: { last_seen_ts: now3 } 
                    }, 
                    { upsert: true, new: true }
                  );
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

// Process single Reddit post by ID
async function processSingleRedditPost(postId, subreddit) {
  console.log(`🔗 Processing single Reddit post: ${postId}`);
  
  try {
    const { fetchRedditComments } = require('../src/connectors/redditConnector');
    
    // Add a delay to avoid triggering rate limits (longer delay in production)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    const minDelay = isProduction ? 2000 : 500; // 2s in production, 0.5s locally
    const maxDelay = isProduction ? 4000 : 1000; // 4s in production, 1s locally
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    console.log(`⏱️ Applying ${isProduction ? 'production' : 'development'} delay: ${Math.round(delay)}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Use the proper Reddit connector with retry logic and better headers
    console.log(`Fetching post and comments: ${postId} from r/${subreddit}`);
    
    const redditResponse = await fetchRedditComments(subreddit, postId, 'CryptoIntelX/1.0.0 (crypto-analysis-bot; +https://cryptointelx.com)');
    
    if (redditResponse.status !== 200) {
      throw new Error(`Reddit API error: ${redditResponse.status}`);
    }
    
    if (!redditResponse.json) {
      throw new Error('Invalid JSON response from Reddit API');
    }
    
    const data = redditResponse.json;
    const post = data[0]?.data?.children[0]?.data;
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    console.log(`Found post: ${post.title}`);
    
    // Check if we already processed this post
    const existing = await Snapshot.findOne({ post_id: post.id, source: 'reddit' });
    if (existing) {
      console.log(`⚠️  Post ${post.id} already processed, checking for existing extractions...`);
      const existingExtractions = await Extraction.find({ snapshot_id: existing._id });
      console.log(`Found ${existingExtractions.length} existing extractions for this post`);
      
      // If no extractions exist, reprocess the post (likely failed extraction before)
      if (existingExtractions.length === 0) {
        console.log(`🔄 No extractions found, reprocessing post ${post.id}...`);
        // Continue with processing below (don't return early)
      } else {
        return { 
          message: 'Post already processed with extractions', 
          post_id: post.id,
          title: post.title,
          extractions: existingExtractions.length,
          existing_extractions: existingExtractions.map(e => ({ address: e.address, coin: e.coin_candidate }))
        };
      }
    }
    
    // Create snapshot
    console.log(`📸 Creating snapshot for post ${post.id}...`);
    const sha256 = require('crypto').createHash('sha256').update(JSON.stringify(post)).digest('hex');
    const snap = await Snapshot.create({ 
      source: 'reddit', 
      subreddit, 
      post_id: post.id, 
      url: `https://reddit.com${post.permalink}`, 
      raw: post, 
      sha256 
    });
    console.log(`📸 Snapshot created: ${snap._id}`);
    
    // Extract from post content
    const text = (post.title || '') + '\n' + (post.selftext || '');
    const candidates = findCandidates(text);
    console.log(`🔍 Found ${candidates.length} candidates in post content:`, candidates);
    
    // Extract from comments
    const comments = data[1]?.data?.children || [];
    console.log(`💬 Processing ${comments.length} comments...`);
    for (const comment of comments) {
      if (comment.data && comment.data.body) {
        const commentCandidates = findCandidates(comment.data.body);
        if (commentCandidates.length > 0) {
          console.log(`💬 Found ${commentCandidates.length} candidates in comment:`, commentCandidates);
        }
        candidates.push(...commentCandidates.map(c => ({
          ...c,
          context: `Comment: ${c.context || comment.data.body.substring(0, 100)}`
        })));
      }
    }
    
    console.log(`🎯 Total candidates to process: ${candidates.length}`);
    
    let extractionsCount = 0;
    let newAddresses = 0;
    
    // Process candidates
    for (const c of candidates) {
      const v = validateCandidate(c);
      console.log(`🔍 Processing candidate: ${c.address} (${c.coin_candidate}) -> ${v.validation_status}`);
      
      // Avoid duplicate extraction for same snapshot & address
      const existsExt = await Extraction.findOne({ snapshot_id: snap._id, address: c.address });
      if (existsExt) {
        console.log(`⚠️  Skipping duplicate extraction for ${c.address}`);
        continue;
      }
      
      const contextSnippet = c.context || text.substring(0, 300);
      const extraction = await Extraction.create({ 
        snapshot_id: snap._id, 
        address: c.address, 
        coin_candidate: c.coin_candidate, 
        validation_status: v.validation_status, 
        context_snippet: contextSnippet, 
        source_path: 'manual_scan' 
      });
      console.log(`✅ Created extraction: ${extraction._id} for ${c.address}`);
      extractionsCount++;
      
      if (v.validation_status === 'syntactic_ok') {
        const now = new Date();
        const canonical = (c.address && c.address.startsWith('0x')) ? c.address.toLowerCase() : c.address;
        console.log(`💾 Upserting valid address: ${canonical}`);
        if (canonical) {
          try {
            const addr = await Address.findOneAndUpdate(
              { canonical_address: canonical },
              { 
                $set: { 
                  canonical_address: canonical, 
                  last_seen_ts: now, 
                  coin_type: c.coin_candidate,
                  validation_status: v.validation_status
                },
                $inc: { times_seen: 1 }
              },
              { upsert: true, new: true }
            );
            console.log(`💾 Address upserted: ${addr._id}, times_seen: ${addr.times_seen}`);
            if (addr && addr.times_seen <= 1) newAddresses++;
          } catch (e) {
            console.error('❌ Failed to upsert address', canonical, e.message);
          }
        }
      }
    }
    
    const result = { 
      message: 'Single post processed successfully',
      post_id: post.id,
      title: post.title,
      extractions: extractionsCount,
      new_addresses: newAddresses,
      candidates_found: candidates.length
    };
    console.log(`🎉 Final result:`, result);
    return result;
    
  } catch (error) {
    console.error(`Error processing single post ${postId}:`, error);
    throw error;
  }
}

module.exports = { processRedditJob, processSingleRedditPost };
