const express = require('express');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const { processRedditJob } = require('../../workers/worker');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redditQueue = null;
let redisAvailable = false;
const connection = new IORedis(redisUrl);
connection.on('error', () => { redisAvailable = false; });
connection.ping().then(() => { redditQueue = new Queue('reddit', { connection }); redisAvailable = true; }).catch(() => { redisAvailable = false; });

const router = express.Router();

router.post('/scrape/reddit', async (req, res) => {
  const { subreddit, mode, limit } = req.body;
  if (!subreddit) return res.status(400).json({ error: 'subreddit required' });
  if (redisAvailable && redditQueue){
    const job = await redditQueue.add('scrape', { subreddit, mode: mode || 'new', limit: limit || 25 });
    return res.json({ queued: true, jobId: job.id });
  }
  // fallback: process synchronously
  try{
    const result = await processRedditJob({ subreddit, mode: mode || 'new', limit: limit || 25 });
    return res.json({ queued: false, result });
  }catch(e){
    console.error('Sync processing failed', e);
    return res.status(500).json({ error: 'processing failed', details: e.message });
  }
});

module.exports = router;
