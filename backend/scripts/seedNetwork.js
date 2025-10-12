const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { NetworkNode, NetworkEdge } = require('../src/models/networkModel');

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log('MONGODB_URI:', uri ? '[REDACTED]' : 'undefined');
  if (!uri) {
    console.error('Missing MONGODB_URI. Please ensure backend/.env exists and contains MONGODB_URI, or set the env var before running this script.');
    process.exit(1);
  }
  // As of MongoDB Node driver v4+, these options are ignored/deprecated.
  // Connect with the URI only and let the driver use modern defaults.
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing demo nodes/edges with a demo flag
  await NetworkEdge.deleteMany({ 'metadata.demo': true });
  await NetworkNode.deleteMany({ 'metadata.demo': true });

  // Create sample nodes
  const nA = await NetworkNode.create({ address: '0xAlpha123', label: 'Alpha', type: 'address', risk_score: 85, metadata: { demo: true } });
  const nB = await NetworkNode.create({ address: '0xBeta456', label: 'Beta', type: 'address', risk_score: 42, metadata: { demo: true } });
  const nC = await NetworkNode.create({ address: '0xGamma789', label: 'Gamma', type: 'address', risk_score: 10, metadata: { demo: true } });
  const nD = await NetworkNode.create({ address: '1A3Babc9', label: 'BTC-Holder', type: 'address', risk_score: 60, metadata: { demo: true } });

  // Create edges
  await NetworkEdge.create({ from: nA._id, to: nB._id, tx_count: 12, total_value: 3.5, relation: 'sent_to', metadata: { demo: true } });
  await NetworkEdge.create({ from: nB._id, to: nC._id, tx_count: 6, total_value: 1.1, relation: 'sent_to', metadata: { demo: true } });
  await NetworkEdge.create({ from: nA._id, to: nD._id, tx_count: 2, total_value: 0.2, relation: 'sent_to', metadata: { demo: true } });

  console.log('Seed data inserted');
  mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
