const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');
const { processRedditJob } = require('./worker');

async function startBullWorker(){
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  connection.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });
  try{
    await connection.ping();
  }catch(e){
    console.error('Redis not reachable, bull worker will not start:', e.message);
    process.exit(0);
  }

  const redditWorker = new Worker('reddit', async job => {
    return await processRedditJob(job.data);
  }, { connection });

  redditWorker.on('failed', (job, err) => console.error('Bull job failed', job.id, err));
  console.log('Bull worker started and connected to Redis');
}

startBullWorker();
