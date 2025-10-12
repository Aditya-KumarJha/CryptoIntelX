const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const Feed = require('../src/models/feedsModel');
const { processRedditJob } = require('../workers/worker');

connectDB();

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

// configure seeds and targets
const SEEDS = [ 'CryptoCurrency', 'Bitcoin', 'ethtrader', 'Monero', 'Scams', 'cryptodevs' ];
const TARGET_PER_SUB = 200; // aim to collect this many new posts per subreddit
const PAGE_LIMIT = 100; // Reddit max per page

async function getFeedAfter(subreddit){
  const f = await Feed.findOne({ subreddit });
  return f?.after || null;
}

async function run(){
  const summary = {};
  for (const sub of SEEDS){
    console.log('\n=== Subreddit:', sub, '===');
    let collected = 0;
    let pageAfter = await getFeedAfter(sub);
    let safetyPages = 0;
    summary[sub] = { posts_saved:0, extractions_found:0, new_addresses_added:0 };
    while(collected < TARGET_PER_SUB && safetyPages < 50){
      console.log(`Fetching page for ${sub} after=${pageAfter} (collected ${collected}/${TARGET_PER_SUB})`);
      try{
        const res = await processRedditJob({ subreddit: sub, mode: 'new', limit: PAGE_LIMIT, fetchComments: true, pageAfter });
        const saved = res.posts_saved || 0;
        const ext = res.extractions_found || 0;
        const na = res.new_addresses_added || 0;
        const after = res.after || null;
        summary[sub].posts_saved += saved;
        summary[sub].extractions_found += ext;
        summary[sub].new_addresses_added += na;
        collected += saved;
        pageAfter = after;
        // if Reddit returned no after token or no posts saved and no after, break to avoid loops
        if(!after) break;
        // Rate limit between pages
        await sleep(1200);
      }catch(e){
        console.error('error paginating', e.message);
        // exponential backoff small
        await sleep(2000);
      }
      safetyPages++;
    }
    console.log('Finished', sub, '->', summary[sub]);
  }
  console.log('\nOverall summary:');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

run().catch(e=>{ console.error(e); process.exit(1); });
