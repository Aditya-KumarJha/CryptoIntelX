const express = require('express');
const router = express.Router();
const scheduler = require('../services/scheduler');
const Address = require('../models/addressModel');
const Snapshot = require('../models/snapshotModel');
const Extraction = require('../models/extractionModel');

// Start auto-scheduler
router.post('/start', (req, res) => {
  try {
    scheduler.start();
    res.json({ message: 'Auto-scheduler started', status: scheduler.getStatus() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Stop auto-scheduler
router.post('/stop', (req, res) => {
  try {
    scheduler.stop();
    res.json({ message: 'Auto-scheduler stopped', status: scheduler.getStatus() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get scheduler status
router.get('/status', (req, res) => {
  res.json(scheduler.getStatus());
});

// Manual trigger
router.post('/run-now', async (req, res) => {
  try {
    console.log('🔧 Manual scan triggered from API - using real data only');
    const results = await scheduler.runPaginatedScrape(true); // Pass true for manual scan
    console.log('🔧 Manual scan results:', results);
    res.json({ message: 'Manual scrape completed', results });
  } catch (e) {
    console.error('🔧 Manual scan error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Get found addresses
router.get('/addresses', async (req, res) => {
  try {
    const addresses = await Address.find({ validation_status: 'syntactic_ok' })
      .sort({ last_seen_ts: -1 })
      .limit(100);
    res.json(addresses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Scan single URL
router.post('/scan-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log('🔗 Single URL scan triggered:', url);
    
    // For Reddit URLs, extract post ID and process single post
    if (url.includes('reddit.com')) {
      const postIdMatch = url.match(/\/comments\/([a-z0-9]+)/i);
      if (!postIdMatch) {
        return res.status(400).json({ error: 'Invalid Reddit URL format' });
      }
      
      const postId = postIdMatch[1];
      const subredditMatch = url.match(/\/r\/([^\/]+)/i);
      const subreddit = subredditMatch ? subredditMatch[1] : 'unknown';
      
      console.log(`🔗 Processing single Reddit post: ${postId} from r/${subreddit}`);
      
      // Import and use the single post processor
      const { processSingleRedditPost } = require('../../workers/worker');
      const result = await processSingleRedditPost(postId, subreddit);
      
      res.json({ 
        message: 'URL scan completed', 
        result,
        url: url 
      });
    } else {
      res.status(400).json({ error: 'Only Reddit URLs are currently supported' });
    }
  } catch (e) {
    console.error('🔗 URL scan error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Get recent snapshots
router.get('/snapshots', async (req, res) => {
  try {
    const snapshots = await Snapshot.find({})
      .sort({ fetched_at: -1 })
      .limit(50)
      .select('post_id subreddit url fetched_at');
    res.json(snapshots);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const lastSnapshot = await Snapshot.findOne({}).sort({ fetched_at: -1 }).select('fetched_at');
    const stats = {
      totalSnapshots: await Snapshot.countDocuments({}),
      totalExtractions: await Extraction.countDocuments({}),
      totalAddresses: await Address.countDocuments({ validation_status: 'syntactic_ok' }),
      lastScrape: lastSnapshot ? lastSnapshot.fetched_at : null
    };
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;