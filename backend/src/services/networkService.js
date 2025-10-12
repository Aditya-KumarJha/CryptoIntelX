const { NetworkNode, NetworkEdge } = require('../models/networkModel');
const Address = require('../models/addressModel');

/**
 * Fetch neighbors for a given address (by canonical address string).
 * Returns nodes and edges limited by `limit` and optional `minRisk` filter.
 */
async function expandNeighbors({ address, limit = 100, minRisk = 0 }) {
  // Find the node matching the address
  const center = await NetworkNode.findOne({ address }).lean();
  if (!center) return { nodes: [], edges: [] };

  // Find outgoing and incoming edges
  const edges = await NetworkEdge.find({ $or: [{ from: center._id }, { to: center._id }] })
    .limit(limit)
    .lean();

  const nodeIds = new Set();
  nodeIds.add(center._id.toString());
  edges.forEach(e => { nodeIds.add(e.from.toString()); nodeIds.add(e.to.toString()); });

  const nodes = await NetworkNode.find({ _id: { $in: Array.from(nodeIds) } })
    .where('risk_score').gte(minRisk)
    .lean();

  return { nodes, edges };
}

async function getSummary({ address }) {
  const addr = await Address.findOne({ canonicalAddress: address }).lean();
  if (!addr) return null;

  // Basic enrichment summary
  return {
    address: addr.canonicalAddress,
    coin: addr.coin,
    tx_count: addr.metadata?.tx_count || 0,
    counterparties: addr.metadata?.counterparty_count || 0,
    risk_score: addr.risk_score || 0,
    first_seen: addr.first_seen_ts,
    last_seen: addr.last_seen_ts,
  };
}

module.exports = {
  expandNeighbors,
  getSummary,
};
