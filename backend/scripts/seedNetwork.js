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

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing demo nodes/edges with a demo flag so seeding is idempotent
  await NetworkEdge.deleteMany({ 'metadata.demo': true });
  await NetworkNode.deleteMany({ 'metadata.demo': true });

  const now = Date.now();
  const fiveMin = 5 * 60 * 1000;

  const mkMeta = (extra = {}) => ({
    demo: true,
    last_tx_ts: new Date(now - Math.floor(Math.random() * 36) * fiveMin),
    ...extra,
  });

  // ——— Realistic, public Ethereum addresses (labels are widely known) ———
  const nodes = {};

  // Exchanges / Services
  nodes.binance8 = await NetworkNode.create({
    address: '0xf977814e90da44bfa03b6295a0616a897441acec',
    label: 'Binance 8 (Exchange Hot Wallet)',
    type: 'exchange',
    risk_score: 25,
    metadata: mkMeta({ chain: 'ETH', tags: ['exchange', 'binance'] })
  });

  nodes.uniswapV3Router = await NetworkNode.create({
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    label: 'Uniswap V3 Router',
    type: 'contract',
    risk_score: 5,
    metadata: mkMeta({ chain: 'ETH', tags: ['defi', 'router'] })
  });

  nodes.tornado10Eth = await NetworkNode.create({
    address: '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b',
    label: 'Tornado Cash (10 ETH Pool)',
    type: 'contract',
    risk_score: 95,
    metadata: mkMeta({ chain: 'ETH', tags: ['mixer', 'sanctioned'], risk_reasons: ['mixer'] })
  });

  // High-profile address (public)
  nodes.vitalik = await NetworkNode.create({
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    label: 'Vitalik Buterin (vitalik.eth)',
    type: 'address',
    risk_score: 0,
    metadata: mkMeta({ chain: 'ETH', tags: ['public-figure'] })
  });

  // Token contracts
  nodes.usdt = await NetworkNode.create({
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    label: 'Tether USD (USDT) — ERC20',
    type: 'token',
    risk_score: 10,
    metadata: mkMeta({ chain: 'ETH', symbol: 'USDT' })
  });
  nodes.usdc = await NetworkNode.create({
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48',
    label: 'USD Coin (USDC) — ERC20',
    type: 'token',
    risk_score: 5,
    metadata: mkMeta({ chain: 'ETH', symbol: 'USDC' })
  });
  nodes.weth = await NetworkNode.create({
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    label: 'Wrapped Ether (WETH)',
    type: 'token',
    risk_score: 5,
    metadata: mkMeta({ chain: 'ETH', symbol: 'WETH' })
  });

  // A couple of generic user wallets to make the graph feel real
  nodes.retail1 = await NetworkNode.create({
    address: '0x9fB0d9E4aF6Ff6b0BfDd9c0A1f4a8B8b9b9b9b90',
    label: 'Retail Wallet A',
    type: 'address',
    risk_score: 12,
    metadata: mkMeta({ chain: 'ETH', tags: ['retail'] })
  });
  nodes.retail2 = await NetworkNode.create({
    address: '0xA3cEf0B3C8c2b0A3D3f2C6f9e3f3c6B2E1d4A2b1',
    label: 'Retail Wallet B',
    type: 'address',
    risk_score: 18,
    metadata: mkMeta({ chain: 'ETH', tags: ['retail'] })
  });

  // Include a known BTC example address for cross-chain illustration
  nodes.btcExample = await NetworkNode.create({
    address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
    label: 'BTC Example Wallet',
    type: 'address',
    risk_score: 8,
    metadata: mkMeta({ chain: 'BTC', tags: ['example'] })
  });

  // ——— Edges (simplified, illustrative flows) ———
  const edges = [
    // Tornado -> Binance (typical laundering flow)
    { from: 'tornado10Eth', to: 'binance8', tx_count: 5, total_value: 50, relation: 'eth_transfer', meta: { asset: 'ETH', notes: 'Post-mix deposits to exchange' } },
    // Binance -> Retail wallets (withdrawals)
    { from: 'binance8', to: 'retail1', tx_count: 3, total_value: 8.4, relation: 'eth_withdraw', meta: { asset: 'ETH' } },
    { from: 'binance8', to: 'retail2', tx_count: 2, total_value: 3.2, relation: 'eth_withdraw', meta: { asset: 'ETH' } },
    // Retail wallet swaps on Uniswap
    { from: 'retail1', to: 'uniswapV3Router', tx_count: 4, total_value: 2.1, relation: 'swap', meta: { pair: 'ETH->USDC' } },
    { from: 'retail2', to: 'uniswapV3Router', tx_count: 1, total_value: 0.5, relation: 'swap', meta: { pair: 'ETH->USDT' } },
    // Token transfers to wallets (simulated receipts)
    { from: 'usdc', to: 'retail1', tx_count: 6, total_value: 21000, relation: 'token_transfer', meta: { asset: 'USDC' } },
    { from: 'usdt', to: 'retail2', tx_count: 2, total_value: 5000, relation: 'token_transfer', meta: { asset: 'USDT' } },
    // Vitalik interacting with Uniswap router (historic pattern)
    { from: 'vitalik', to: 'uniswapV3Router', tx_count: 1, total_value: 200, relation: 'swap', meta: { asset: 'ETH', notes: 'historic swap' } },
  ];

  for (const e of edges) {
    await NetworkEdge.create({
      from: nodes[e.from]._id,
      to: nodes[e.to]._id,
      tx_count: e.tx_count,
      total_value: e.total_value,
      relation: e.relation,
      metadata: mkMeta({ chain: 'ETH', ...e.meta })
    });
  }

  console.log('Seed data inserted (realistic Ethereum/crypto sample graph)');
  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
