const cron = require('node-cron');
const { processRedditJob } = require('../../workers/worker');

class Scheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    // Run paginated scrape every 5 minutes
    const job = cron.schedule('*/5 * * * *', async () => {
      console.log('Auto-scraper starting at', new Date().toISOString());
      try {
        await this.runPaginatedScrape();
      } catch (e) {
        console.error('Auto-scraper failed:', e.message);
      }
    }, { scheduled: false });

    this.jobs.set('reddit-scraper', job);
    job.start();
    this.isRunning = true;
    console.log('Scheduler started - will run every 5 minutes');
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs.clear();
    this.isRunning = false;
    console.log('Scheduler stopped');
  }

  async runPaginatedScrape(isManualScan = false) {
    console.log('🚀 Starting runPaginatedScrape...', isManualScan ? '(Manual scan - real data only)' : '(Scheduled run)');
    const seeds = ['CryptoCurrency', 'Bitcoin', 'ethtrader', 'Monero', 'Scams', 'cryptodevs'];
    const results = {};
    
    // Import Feed model for pagination tracking
    const Feed = require('../models/feedsModel');
    console.log('📊 Processing', seeds.length, 'subreddits:', seeds.join(', '));
    
    for (const sub of seeds) {
      try {
        // Load stored pagination state
        const feed = await Feed.findOne({ subreddit: sub });
        const pageAfter = feed?.after || null;
        
        console.log(`Scraping ${sub} with pagination token: ${pageAfter ? pageAfter.slice(0,10) + '...' : 'none (starting fresh)'}`);
        
        const result = await processRedditJob({ 
          subreddit: sub, 
          mode: 'new', 
          limit: 25, 
          fetchComments: true,
          pageAfter: pageAfter,  // Use stored pagination token
          isManualScan: isManualScan  // Pass manual scan flag
        });
        results[sub] = result;
        
        console.log(`${sub}: ${result.posts_saved} posts, ${result.extractions_found} extractions, next_token: ${result.after ? result.after.slice(0,10) + '...' : 'none'}`);
        
        // Small delay between subreddits
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Failed to scrape ${sub}:`, e.message);
        console.error(`Full error for ${sub}:`, e);
        results[sub] = { error: e.message };
      }
    }
    
    return results;
  }

  getStatus() {
    return {
      running: this.isRunning,
      jobs: Array.from(this.jobs.keys()),
      nextRun: this.isRunning ? 'Every 5 minutes' : 'Not scheduled'
    };
  }
}

module.exports = new Scheduler();