const fetch = require('node-fetch');

async function testScheduler() {
  try {
    // Test status
    console.log('Testing scheduler status...');
    const statusResp = await fetch('http://localhost:4000/api/scheduler/status');
    const status = await statusResp.json();
    console.log('Status:', status);

    // Start scheduler
    console.log('\nStarting scheduler...');
    const startResp = await fetch('http://localhost:4000/api/scheduler/start', { method: 'POST' });
    const startResult = await startResp.json();
    console.log('Start result:', startResult);

    // Check stats
    console.log('\nChecking stats...');
    const statsResp = await fetch('http://localhost:4000/api/scheduler/stats');
    const stats = await statsResp.json();
    console.log('Stats:', stats);

  } catch (e) {
    console.error('Test failed:', e.message);
  }
}

testScheduler();