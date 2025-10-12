require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { processRedditJob } = require('../workers/worker');

const subs = [
  'CryptoCurrency',
  'Bitcoin',
  'ethtrader',
  'Monero',
  'Scams',
  'cryptodevs'
];

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

(async ()=>{
  const summary = {};
  for (const s of subs){
    console.log(`Processing /r/${s} (limit=50)`);
    try{
      const res = await processRedditJob({ subreddit: s, mode: 'new', limit: 50 });
      summary[s] = res;
      console.log(' ->', res);
    }catch(e){
      console.error('Error processing', s, e.message || e);
      summary[s] = { error: e.message };
    }
    // wait 1100ms between subreddit fetches
    await sleep(1100);
  }
  console.log('\nFINAL_SUMMARY_START');
  console.log(JSON.stringify(summary, null, 2));
  console.log('FINAL_SUMMARY_END');
  process.exit(0);
})();
