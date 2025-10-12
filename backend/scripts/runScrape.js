const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { processRedditJob } = require('../workers/worker');

(async () => {
  try{
    console.log('Starting sync scrape for r/CryptoCurrency (limit=5)');
    const res = await processRedditJob({ subreddit: 'CryptoCurrency', mode: 'new', limit: 5 });
    console.log('RESULT_JSON_START');
    console.log(JSON.stringify(res, null, 2));
    console.log('RESULT_JSON_END');
    process.exit(0);
  }catch(e){
    console.error('Error running scrape:', e);
    process.exit(1);
  }
})();
