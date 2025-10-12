const { processRedditJob } = require('../workers/worker');
const Feed = require('../src/models/feedsModel');

async function testPagination() {
  const subreddit = 'CryptoCurrency';
  
  console.log('=== Testing Pagination Implementation ===\n');
  
  // Check current feed state
  const currentFeed = await Feed.findOne({ subreddit });
  console.log('Current feed state:', currentFeed);
  
  // Run first page
  console.log('\n1. Running first page...');
  const result1 = await processRedditJob({ 
    subreddit, 
    mode: 'new', 
    limit: 5,  // Small limit for testing
    fetchComments: false,  // Skip comments for faster testing
    pageAfter: currentFeed?.after || null
  });
  
  console.log('Result 1:', result1);
  
  // Check updated feed state
  const updatedFeed = await Feed.findOne({ subreddit });
  console.log('Updated feed state:', updatedFeed);
  
  // Run second page using the token
  console.log('\n2. Running second page with pagination token...');
  const result2 = await processRedditJob({ 
    subreddit, 
    mode: 'new', 
    limit: 5, 
    fetchComments: false,
    pageAfter: updatedFeed?.after
  });
  
  console.log('Result 2:', result2);
  
  // Check final feed state
  const finalFeed = await Feed.findOne({ subreddit });
  console.log('Final feed state:', finalFeed);
  
  console.log('\n=== Pagination Test Complete ===');
}

testPagination().catch(console.error);