const fetch = require('node-fetch');

async function testSchedulerAPI() {
  try {
    console.log('Testing scheduler API endpoints...');
    
    // Test status endpoint
    console.log('\n1. Testing /api/scheduler/status');
    const statusRes = await fetch('http://localhost:4000/api/scheduler/status');
    console.log('Status code:', statusRes.status);
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      console.log('Status response:', JSON.stringify(statusData, null, 2));
    } else {
      console.log('Status error:', await statusRes.text());
    }

    // Test stats endpoint
    console.log('\n2. Testing /api/scheduler/stats');
    const statsRes = await fetch('http://localhost:4000/api/scheduler/stats');
    console.log('Stats code:', statsRes.status);
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      console.log('Stats response:', JSON.stringify(statsData, null, 2));
    } else {
      console.log('Stats error:', await statsRes.text());
    }

    // Test addresses endpoint
    console.log('\n3. Testing /api/scheduler/addresses');
    const addressesRes = await fetch('http://localhost:4000/api/scheduler/addresses');
    console.log('Addresses code:', addressesRes.status);
    if (addressesRes.ok) {
      const addressesData = await addressesRes.json();
      console.log('Addresses count:', addressesData.length);
    } else {
      console.log('Addresses error:', await addressesRes.text());
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSchedulerAPI();