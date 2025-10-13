const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');

async function fixNullAddresses() {
  try {
    await connectDB();
    
    const Address = require('../src/models/addressModel');
    
    console.log('=== Fixing Null Address Issues ===\n');
    
    // Find addresses with null canonical_address
    const nullAddresses = await Address.find({ canonical_address: null });
    console.log(`Found ${nullAddresses.length} addresses with null canonical_address`);
    
    // Delete them
    if (nullAddresses.length > 0) {
      await Address.deleteMany({ canonical_address: null });
      console.log('✅ Deleted null addresses');
    }
    
    // Show all remaining addresses
    const allAddresses = await Address.find({});
    console.log(`\n📍 Remaining addresses (${allAddresses.length}):`);
    for (const addr of allAddresses) {
      console.log(`${addr.canonical_address || 'NULL'} (${addr.coin}) - count: ${addr.source_count}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixNullAddresses();