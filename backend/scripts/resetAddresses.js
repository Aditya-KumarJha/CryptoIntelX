const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');

async function resetAddressCollection() {
  try {
    await connectDB();
    
    const Address = require('../src/models/addressModel');
    
    console.log('=== Resetting Address Collection ===\n');
    
    // Get current addresses
    const currentAddresses = await Address.find({});
    console.log('Current addresses:');
    for (const addr of currentAddresses) {
      console.log(`${addr.canonical_address || 'NULL'} (${addr.coin}) - count: ${addr.source_count}`);
    }
    
    // Drop the collection
    console.log('\nDropping addresses collection...');
    await Address.collection.drop();
    
    // Recreate the valid address
    console.log('Recreating valid addresses...');
    const validAddresses = [
      {
        canonical_address: '0x2a45aca2d5fc5b5c859090a6c34d164145398226',
        coin: 'ethereum',
        validation_status: 'syntactic_ok',
        source_count: 1
      },
      {
        canonical_address: '0x26a6dd9e44b1a095bf64f96dd1351c0b6ff37100',
        coin: 'ethereum', 
        validation_status: 'syntactic_ok',
        source_count: 1
      },
      {
        canonical_address: '0xdb579446097d33a809daf8acecfdd29a1c239935',
        coin: 'ethereum',
        validation_status: 'syntactic_ok', 
        source_count: 1
      }
    ];
    
    for (const addrData of validAddresses) {
      const created = await Address.create(addrData);
      console.log(`✅ Created: ${created.canonical_address}`);
    }
    
    console.log(`\n📊 Final count: ${await Address.countDocuments()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAddressCollection();