"use client";
import React, { useState, useRef } from 'react';
import api from '@/utils/axios';
import { Search, Network } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NetworkAnalysis() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [depth, setDepth] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address) return setError('Please enter an address');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.post('/api/network/expand', { address, limit: 200, depth }, { headers: { Authorization: `Bearer ${token}` } });
      setNodes(res.data.nodes || []);
      setEdges(res.data.edges || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch network');
    } finally {
      setLoading(false);
    }
  };

  const fgRef = useRef<any>(null);

  const handleNodeClick = async (node: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get(`/api/network/summary/${encodeURIComponent(node.address)}`, { headers: { Authorization: `Bearer ${token}` } });
      const info = res.data.data;
      toast.custom(() => (
        <div className="bg-gray-900/90 text-white p-3 rounded-md shadow-lg">
          <div className="font-semibold">{info.address}</div>
          <div className="text-sm text-gray-300">coin: {info.coin}</div>
          <div className="text-sm text-gray-300">tx_count: {info.tx_count}</div>
          <div className="text-sm text-gray-300">counterparties: {info.counterparties}</div>
        </div>
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to fetch node summary');
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address (e.g. 0xabc... or 1A3B...)"
              className="w-full bg-gray-900/60 border border-gray-700/40 rounded-full pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              aria-label="depth"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value, 10))}
              className="bg-gray-900/60 border border-gray-700/40 text-gray-200 rounded-full px-3 py-2 text-sm"
            >
              <option value={1}>1-hop</option>
              <option value={2}>2-hop</option>
              <option value={3}>3-hop</option>
            </select>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-300 hover:to-cyan-500 text-black font-semibold px-5 py-2 rounded-full shadow-lg transform transition duration-150 hover:scale-105"
              disabled={loading}
            >
              <Network className="h-4 w-4" />
              <span>{loading ? 'Exploring...' : 'Explore Network'}</span>
            </button>
          </div>
        </div>
      </form>

      {error && <div className="text-red-400 mb-3">{error}</div>}

      <div className="flex items-center space-x-3 mb-4">
        <div className="px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-700 text-sm">Nodes: <span className="font-semibold text-white">{nodes.length}</span></div>
        <div className="px-3 py-1 rounded-full bg-rose-900/40 border border-rose-700 text-sm">Edges: <span className="font-semibold text-white">{edges.length}</span></div>
        <div className="px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-700 text-sm">Depth: <span className="font-semibold text-white">{depth}-hop</span></div>
        <div className="ml-auto text-sm text-gray-400">Tip: deep graphs may be large — use 1-2 hops for exploration.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="h-96 rounded-xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5), rgba(58,12,141,0.25))', border: '1px solid rgba(255,255,255,0.03)' }}>
            {nodes.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-700/30 to-indigo-700/30 flex items-center justify-center mb-4 shadow-inner">
                  <Network className="h-12 w-12 text-teal-300" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No graph data</h4>
                <p className="text-sm text-gray-300">Run an exploration to load connected nodes and transaction edges. Use the depth selector for larger searches.</p>
              </div>
            ) : (
              <div className="w-full h-full overflow-auto text-sm text-gray-200">
                {/* Simple SVG visualization (circular layout) for small graphs */}
                <div className="w-full mb-4 flex items-center justify-center">
                  <svg className="w-full h-80 bg-transparent" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {
                      (() => {
                        const w = 800; const h = 380;
                        const cx = w / 2; const cy = h / 2;
                        const n = nodes.length || 1;
                        const radius = Math.min(w, h) / 3;
                        const nodePositions: Record<string, { x: number; y: number }> = {};
                        nodes.forEach((node: any, i: number) => {
                          const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                          const x = cx + Math.cos(angle) * radius;
                          const y = cy + Math.sin(angle) * radius;
                          nodePositions[node._id] = { x, y };
                        });

                        return (
                          <g>
                            {/* links */}
                            {edges.map((e: any, idx: number) => {
                              const fromPos = nodePositions[e.from] || { x: cx, y: cy };
                              const toPos = nodePositions[e.to] || { x: cx, y: cy };
                              return (
                                <line key={idx} x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
                              );
                            })}

                            {/* nodes */}
                            {nodes.map((node: any, i: number) => {
                              const pos = nodePositions[node._id];
                              const fill = node.risk_score >= 75 ? '#ff6b6b' : node.risk_score >= 40 ? '#f6c84c' : '#6ee7b7';
                              return (
                                <g key={node._id} transform={`translate(${pos.x}, ${pos.y})`} style={{ cursor: 'pointer' }} onClick={() => handleNodeClick(node)}>
                                  <circle r={26} fill={fill} stroke="rgba(0,0,0,0.4)" strokeWidth={2} filter="url(#glow)" />
                                  <text x={0} y={6} textAnchor="middle" fontSize={10} fill="#061024" style={{ fontWeight: 700 }}>{String(node.address).slice(0, 6)}</text>
                                </g>
                              );
                            })}
                          </g>
                        );
                      })()
                    }
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Nodes</h4>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {nodes.map((n: any) => (
                    <li key={n._id} onClick={() => handleNodeClick(n)} className="p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/20 border border-gray-700/30 rounded-lg flex justify-between items-center hover:scale-[1.01] cursor-pointer">
                      <div>
                        <div className="font-medium">{n.address}</div>
                        <div className="text-xs text-gray-400">{n.type || 'address'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{n.risk_score ?? 0}</div>
                        <div className="text-xs text-gray-400">risk</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <h4 className="font-semibold mt-4 mb-2">Edges</h4>
                <ul className="space-y-2 max-h-44 overflow-y-auto">
                  {edges.map((e: any) => (
                    <li key={e._id} className="p-3 bg-gradient-to-r from-gray-800/20 to-gray-900/10 border border-gray-700/20 rounded-lg flex justify-between items-center">
                      <div className="text-sm">{e.relation} <span className="text-xs text-gray-400">({e._id})</span></div>
                      <div className="text-xs text-gray-300">txs: {e.tx_count}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-gray-900/40 rounded-xl p-4">
            <h4 className="font-semibold mb-2">Summary</h4>
            <div className="text-sm text-gray-300">Nodes: <span className="font-semibold text-white">{nodes.length}</span></div>
            <div className="text-sm text-gray-300">Edges: <span className="font-semibold text-white">{edges.length}</span></div>
            <div className="text-sm text-gray-300 mt-3">Depth: <span className="font-semibold text-white">{depth}-hop</span></div>
            <div className="mt-4 space-y-2">
              <button className="w-full text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">Create Case from Selection</button>
              <button className="w-full text-sm px-4 py-2 rounded-lg border border-gray-700/40 text-gray-200">Export Snapshot</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
