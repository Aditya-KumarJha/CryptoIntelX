const { NetworkNode, NetworkEdge } = require('../models/networkModel');
const Address = require('../models/addressModel');

/**
 * Expand neighbors using BFS up to `depth` hops. Returns nodes and edges with address fields.
 * - limit: max number of edges to return
 */
async function expandNeighbors({ address, limit = 500, minRisk = 0, depth = 1 }) {
  const center = await NetworkNode.findOne({ address }).lean();
  if (!center) return { nodes: [], edges: [] };

  // BFS
  const visitedNodeIds = new Set([center._id.toString()]);
  const queue = [center._id];
  let currentDepth = 0;
  const collectedEdgeIds = new Set();

  while (queue.length && currentDepth < depth) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const nodeId = queue.shift();
      const neighbors = await NetworkEdge.find({ $or: [{ from: nodeId }, { to: nodeId }] }).limit(limit).lean();
      for (const e of neighbors) {
        collectedEdgeIds.add(e._id.toString());
        const otherId = e.from.toString() === nodeId.toString() ? e.to : e.from;
        if (!visitedNodeIds.has(otherId.toString())) {
          visitedNodeIds.add(otherId.toString());
          queue.push(otherId);
        }
      }
    }
    currentDepth++;
  }

  const nodeIds = Array.from(visitedNodeIds);
  const nodes = await NetworkNode.find({ _id: { $in: nodeIds } }).lean();

  const edges = await NetworkEdge.find({ _id: { $in: Array.from(collectedEdgeIds) } }).lean();

  // Map edges to include from_address/to_address for frontend convenience
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n._id.toString()] = n.address; });

  const edgesWithAddresses = edges.map(e => ({
    _id: e._id,
    from: e.from.toString(),
    to: e.to.toString(),
    from_address: nodeMap[e.from.toString()] || null,
    to_address: nodeMap[e.to.toString()] || null,
    tx_count: e.tx_count,
    total_value: e.total_value,
    relation: e.relation,
  }));

  return { nodes, edges: edgesWithAddresses };
}

async function getSummary({ address }) {
  // try Address collection first
  const addr = await Address.findOne({ canonicalAddress: address }).lean();
  if (addr) {
    return {
      address: addr.canonicalAddress,
      coin: addr.coin,
      tx_count: addr.metadata?.tx_count || 0,
      counterparties: addr.metadata?.counterparty_count || 0,
      risk_score: addr.risk_score || 0,
      first_seen: addr.first_seen_ts,
      last_seen: addr.last_seen_ts,
      metadata: addr.metadata || {},
    };
  }

  // fallback to NetworkNode
  const node = await NetworkNode.findOne({ address }).lean();
  if (!node) return null;
  return {
    address: node.address,
    coin: 'unknown',
    tx_count: node.metadata?.tx_count || 0,
    counterparties: node.metadata?.counterparty_count || 0,
    risk_score: node.risk_score || 0,
    first_seen: node.createdAt,
    last_seen: node.updatedAt,
    metadata: node.metadata || {},
  };
}

module.exports = {
  expandNeighbors,
  getSummary,
};
