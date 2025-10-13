const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');

async function backfillMissingAddresses() {
  try {
    await connectDB();
    
    const Address = require('../src/models/addressModel');
    const Extraction = require('../src/models/extractionModel');
    
    console.log('=== Backfilling Missing Addresses ===\n');
    
    // Find all valid extractions that should have addresses
    const validExtractions = await Extraction.find({ validation_status: 'syntactic_ok' });
    console.log(`Found ${validExtractions.length} valid extractions to process...`);
    
    let created = 0;
    let updated = 0;
    
    for (const ext of validExtractions) {
      const canonical = ext.address.startsWith('0x') ? ext.address.toLowerCase() : ext.address;
      
      try {
        const result = await Address.findOneAndUpdate(
          { canonical_address: canonical, coin: ext.coin_candidate },
          {
            $inc: { source_count: 1 },
            $setOnInsert: { 
              first_seen_ts: new Date(), 
              validation_status: 'syntactic_ok' 
            },
            $set: { last_seen_ts: new Date() }
          },
          { upsert: true, new: true }
        );
        
        if (result.source_count === 1) {
          console.log(`✅ Created: ${canonical} (${ext.coin_candidate})`);
          created++;
        } else {
          console.log(`📈 Updated: ${canonical} (count: ${result.source_count})`);
          updated++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${canonical}:`, error.message);
      }
    }
    
    console.log(`\n🎯 Summary:`);
    console.log(`Created: ${created} new addresses`);
    console.log(`Updated: ${updated} existing addresses`);
    
    // Final count
    const totalAddresses = await Address.countDocuments();
    console.log(`Total addresses in DB: ${totalAddresses}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

backfillMissingAddresses();