const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');

async function manualCreateAddresses() {
  try {
    await connectDB();
    
    const Address = require('../src/models/addressModel');
    const Extraction = require('../src/models/extractionModel');
    
    console.log('=== Manual Address Creation ===\n');
    
    // Get the specific addresses that are failing
    const addresses = [
      '0x26a6dd9e44b1a095bf64f96dd1351c0b6ff37100',
      '0xdb579446097d33a809daf8acecfdd29a1c239935'
    ];
    
    for (const addr of addresses) {
      console.log(`Processing: ${addr}`);
      
      // Check if it already exists
      const existing = await Address.findOne({ canonical_address: addr, coin: 'ethereum' });
      if (existing) {
        console.log(`  Already exists with count: ${existing.source_count}`);
        continue;
      }
      
      try {
        const newAddr = await Address.create({
          canonical_address: addr,
          coin: 'ethereum',
          validation_status: 'syntactic_ok',
          first_seen_ts: new Date(),
          last_seen_ts: new Date(),
          source_count: 1
        });
        console.log(`  ✅ Created successfully`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    // Final stats
    const totalAddresses = await Address.countDocuments();
    console.log(`\n📊 Total addresses: ${totalAddresses}`);
    
    const allAddresses = await Address.find({});
    for (const addr of allAddresses) {
      console.log(`${addr.canonical_address} (${addr.coin}) - count: ${addr.source_count}, status: ${addr.validation_status}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

manualCreateAddresses();