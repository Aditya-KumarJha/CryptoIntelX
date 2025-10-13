"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '@/utils/axios';
import { Search, Network, Maximize } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ForceGraph2D from 'react-force-graph-2d';

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

export default function NetworkAnalysis() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [depth, setDepth] = useState(1);
  const fgRef = useRef<any>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 });

  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [exporting, setExporting] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any | null>(null);

  const updateGraphDimensions = useCallback(() => {
    if (graphContainerRef.current) {
      setGraphDimensions({
        width: graphContainerRef.current.clientWidth,
        height: graphContainerRef.current.clientHeight, 
      });
    }
  }, []);

  useEffect(() => {
    updateGraphDimensions();
    window.addEventListener('resize', updateGraphDimensions);
    return () => window.removeEventListener('resize', updateGraphDimensions);
  }, [updateGraphDimensions]);
  
  // FIX: Apply D3 forces and zoom using only d3Force and d3ReheatSimulation
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      
      // Configure D3 Forces using the ref object's d3Force method
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) {
        linkForce
          .distance((link: any) => 60)
          .strength((link: any) => 0.9);
      }

      const chargeForce = fgRef.current.d3Force('charge');
      if (chargeForce) {
        chargeForce
          .strength(-250)
          .distanceMax(300);
      }

      const centerForce = fgRef.current.d3Force('center');
      if (centerForce) {
        centerForce.strength(0.1); 
      }
      
      // Reheat the simulation to apply forces immediately
      fgRef.current.d3ReheatSimulation();

      // Zoom to Fit after forces are set (waits for a tick)
      setTimeout(() => {
        fgRef.current.zoomToFit(400);
      }, 50); 
    }
  }, [graphData]);

  const handleZoomToFit = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address) return setError('Please enter an address');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await new Promise(resolve => setTimeout(resolve, 300)); 
      const res = await api.post('/api/network/expand', { address, limit: 200, depth }, { headers: { Authorization: `Bearer ${token}` } });
      const gotNodes = res.data.nodes || [];
      const gotEdges = res.data.edges || [];
      setNodes(gotNodes);
      setEdges(gotEdges);
      const gfNodes = gotNodes.map((n: any) => ({ id: String(n._id), address: n.address, risk_score: n.risk_score ?? 0, type: n.type || 'address' }));
      const gfLinks = gotEdges.map((l: any) => ({ source: String(l.from), target: String(l.to), relation: l.relation, tx_count: l.tx_count }));
      setGraphData({ nodes: gfNodes, links: gfLinks });
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch network');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (node: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get(`/api/network/summary/${encodeURIComponent(node.address)}`, { headers: { Authorization: `Bearer ${token}` } });
      const info = res.data.data;
      toast.custom((t) => (
        <div 
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
            bg-gray-900/95 text-white p-4 rounded-xl shadow-2xl border border-cyan-500/50 max-w-sm`}
          onClick={() => toast.dismiss(t.id)}
        >
          <div className="font-bold text-lg mb-1">{info.address.slice(0, 10)}...{info.address.slice(-8)}</div>
          <div className="text-sm text-gray-300">Coin: <span className="font-semibold text-teal-300">{info.coin}</span></div>
          <div className="text-sm text-gray-300">TX Count: <span className="font-semibold">{info.tx_count}</span></div>
          <div className="text-sm text-gray-300">Counterparties: <span className="font-semibold">{info.counterparties}</span></div>
        </div>
      ), { duration: 5000 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch node summary');
    }
  };

  const handleCreateCase = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const title = `Case for ${address || 'search'}`;
      const address_ids = nodes.map(n => n.address);
      await api.post('/api/cases', { title, address_ids }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Case created successfully! 🕵️‍♂️');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create case');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      setExporting(true);
      const snapshot_ids: string[] = nodes.map(n => n.address);
      if (snapshot_ids.length === 0) {
        setExporting(false);
        return toast.error('No nodes to export');
      }
      const loadingToastId = toast.loading('Preparing export...');
      const res = await api.post('/api/cases/export', { snapshot_ids, redaction: true, reason: 'Investigation export' }, { headers: { Authorization: `Bearer ${token}` } });
      toast.dismiss(loadingToastId);
      setExporting(false);
      const filePath = res?.data?.data?.file_path;
      if (filePath) {
        // Try to fetch the file and trigger an automatic download with a sensible filename.
        toast.success('Export ready! Downloading file. 💾');
        try {
          let url: string;
          if (filePath.startsWith('http')) {
            url = filePath;
          } else {
            // Prefer axios baseURL (backend URL) when the server returns a relative path like '/exports/...'
            const apiBase = (api && (api.defaults && api.defaults.baseURL)) || process.env.NEXT_PUBLIC_API_URL || window.location.origin;
            try {
              // new URL(relative, base) will handle joining even if base has a trailing slash
              url = new URL(filePath, apiBase).toString();
            } catch (e) {
              // Fallback to front-end origin if something unexpected occurs
              url = `${window.location.origin}${filePath}`;
            }
          }
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
          const blob = await response.blob();

          // Try to parse a filename from Content-Disposition header, otherwise fall back to the URL path
          let filename = 'export.pdf';
          const cd = response.headers.get('content-disposition');
          if (cd) {
            const match = cd.match(/filename\*=UTF-8''([^;\n]+)|filename="?([^";]+)"?/);
            if (match) filename = decodeURIComponent(match[1] || match[2] || filename);
          } else {
            const parts = url.split('/');
            if (parts.length > 0) filename = parts[parts.length - 1] || filename;
          }

          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          // Append for Firefox
          document.body.appendChild(a);
          a.click();
          a.remove();
          // Release memory
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (downloadErr) {
          console.error('Automatic download failed, falling back to opening the file:', downloadErr);
          // Fallback: open the file in a new tab so the user can manually save it
          const openUrl = filePath.startsWith('http') ? filePath : `${window.location.origin}${filePath}`;
          window.open(openUrl, '_blank');
          toast('Could not download automatically; opened file in a new tab.', { icon: '📄' });
        }
      } else {
        toast.success('Export ready (server returned no file path)');
      }
    } catch (err) {
      console.error(err);
      setExporting(false);
      toast.error('Failed to export');
    }
  };

  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const full = String(node.address || '');
    const label = full.length > 10 ? full.slice(0, 4) + '…' + full.slice(-4) : full;
    const fontSize = Math.max(8, 10 / globalScale);
    
    const radius = 8 + (node.risk_score || 0) / 10;
    
    ctx.beginPath();
    ctx.fillStyle = node.risk_score >= 75 ? '#ef4444' : node.risk_score >= 40 ? '#fbbf24' : '#34d399';
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    ctx.font = `${fontSize}px Inter, Sans-Serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, node.x, node.y + radius + 7 + (fontSize / 2));
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
              className="w-full bg-gray-900/60 border border-gray-700/40 rounded-full pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-150"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              aria-label="depth"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value, 10))}
              className="bg-gray-900/60 border border-gray-700/40 text-gray-200 rounded-full px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500 transition duration-150"
            >
              <option value={1}>1-hop</option>
              <option value={2}>2-hop</option>
              <option value={3}>3-hop</option>
            </select>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-300 hover:to-cyan-500 text-black font-semibold px-5 py-2 rounded-full shadow-lg transform transition duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Network className="h-4 w-4" />
              <span>{loading ? 'Exploring...' : 'Explore Network'}</span>
            </button>
          </div>
        </div>
      </form>

      {error && <div className="text-red-400 mb-3 p-3 bg-red-900/20 border border-red-700/40 rounded-lg">{error}</div>}

      <div className="flex items-center space-x-3 mb-4">
        <div className="px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-700 text-sm">Nodes: <span className="font-semibold text-white">{nodes.length}</span></div>
        <div className="px-3 py-1 rounded-full bg-rose-900/40 border border-rose-700 text-sm">Edges: <span className="font-semibold text-white">{edges.length}</span></div>
        <div className="px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-700 text-sm">Depth: <span className="font-semibold text-white">{depth}-hop</span></div>
        
        {nodes.length > 0 && (
          <button 
            onClick={handleZoomToFit}
            className="ml-auto inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-700/50 hover:bg-gray-600/70 text-xs text-white transition duration-150"
            title="Zoom to Fit Graph"
          >
            <Maximize className="h-3 w-3" />
            <span>Zoom to Fit</span>
          </button>
        )}

        <div className="ml-2 text-sm text-gray-400">Tip: deep graphs may be large — use 1-2 hops for exploration.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div ref={graphContainerRef} className="h-[40rem] rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5), rgba(58,12,141,0.25))', border: '1px solid rgba(255,255,255,0.03)' }}>
            {nodes.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-700/30 to-indigo-700/30 flex items-center justify-center mb-4 shadow-inner">
                  <Network className="h-12 w-12 text-teal-300" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Network Exploration</h4>
                <p className="text-sm text-center text-gray-300 max-w-sm">
                  Run an exploration by entering an address to visualize connected nodes and transaction edges. Use the depth selector to control the scope of the search.
                </p>
              </div>
            ) : (
              <div className="w-full h-full"> 
                <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  width={graphDimensions.width}
                  height={graphDimensions.height}
                  nodeLabel={(node: any) => `${node.address}\nRisk: ${node.risk_score ?? 0}`}
                  nodeAutoColorBy={(node: any) => (node.risk_score >= 75 ? 'high' : node.risk_score >= 40 ? 'medium' : 'low')}
                  nodeCanvasObject={nodeCanvasObject}
                  
                  nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI, false);
                    ctx.fill();
                  }}
                  
                  linkDirectionalArrowLength={6}
                  linkDirectionalArrowRelPos={1}
                  linkDirectionalParticles={0}
                  linkWidth={(link: any) => Math.max(0.8, (link.tx_count || 0) / 10)}
                  linkColor={() => 'rgba(255,255,255,0.15)'}
                  
                  onLinkHover={(link: any) => setHoveredLink(link || null)}
                  onNodeClick={(node: any) => handleNodeClick(node)}
                  onNodeHover={(node: any) => setHoveredNode(node || null)}
                  onBackgroundClick={() => { setHoveredNode(null); setHoveredLink(null); }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-gray-900/40 rounded-xl p-4 sticky top-4"> 
            <h4 className="font-semibold mb-2 text-lg text-white border-b border-gray-700/50 pb-2">Investigation Summary</h4>
            <div className="text-sm text-gray-300 mt-2">Initial Address: <span className="font-semibold text-white">{address.slice(0, 10)}...{address.length > 0 ? address.slice(-8) : 'N/A'}</span></div>
            <div className="text-sm text-gray-300">Total Nodes: <span className="font-semibold text-white">{nodes.length}</span></div>
            <div className="text-sm text-gray-300">Total Edges: <span className="font-semibold text-white">{edges.length}</span></div>
            <div className="text-sm text-gray-300">Exploration Depth: <span className="font-semibold text-white">{depth}-hop</span></div>
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={handleCreateCase} 
                className="w-full text-sm px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold transition duration-150 shadow-lg shadow-purple-900/30 disabled:opacity-50"
                disabled={nodes.length === 0}
              >
                Create Case from Selection
              </button>
              <button 
                onClick={handleExport} 
                disabled={exporting || nodes.length === 0} 
                className={`w-full text-sm px-4 py-3 rounded-xl border font-semibold transition duration-150 ${exporting || nodes.length === 0 ? 'bg-gray-700/30 text-gray-400 cursor-not-allowed border-gray-700/30' : 'border-gray-700/40 text-gray-200 hover:bg-gray-800/50'}`}
              >
                {exporting ? 'Exporting...' : 'Export All Data'}
              </button>
            </div>
          </div>

          <div className="bg-gray-900/40 rounded-xl p-4 mt-4">
             <h4 className="font-semibold mb-2 text-sm text-white border-b border-gray-700/50 pb-1">Risk Color Key</h4>
             <ul className="text-xs space-y-1 mt-2">
                <li className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-red-500"></span> High Risk (&gt;= 75)</li>
                <li className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-amber-400"></span> Medium Risk (&gt;= 40)</li>
                <li className="flex items-center"><span className="w-3 h-3 rounded-full mr-2 bg-emerald-500"></span> Low Risk (&lt; 40)</li>
             </ul>
          </div>
        </div>
      </div>

      {hoveredNode && graphContainerRef.current && (
        <div 
          className="absolute z-20 pointer-events-none transition-opacity duration-200"
          style={{ 
            left: `${(hoveredNode.x / fgRef.current.getScale() + fgRef.current.getTranslate().x) + graphContainerRef.current.offsetLeft + 20}px`,
            top: `${(hoveredNode.y / fgRef.current.getScale() + fgRef.current.getTranslate().y) + graphContainerRef.current.offsetTop - 50}px`,
            opacity: 1 
          }}
        >
          <div className="bg-black/85 text-white p-3 rounded-lg max-w-xs shadow-xl border border-white/10">
            <div className="font-semibold truncate">{hoveredNode.address}</div>
            <div className="text-xs text-gray-300 mt-1">Type: <span className="font-medium text-cyan-300">{hoveredNode.type}</span></div>
            <div className="text-xs text-gray-300">Risk Score: <span className="font-medium">{hoveredNode.risk_score ?? 'N/A'}</span></div>
          </div>
        </div>
      )}

      {hoveredLink && (
        <div className="fixed left-1/2 top-[5rem] transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-black/90 text-white p-3 rounded-lg shadow-2xl text-sm border border-white/20">
            <div className="font-bold text-center mb-1">{hoveredLink.relation || 'Transaction'}</div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-300">From: <span className="font-mono text-xs text-teal-300">{String(hoveredLink.source).slice(0, 8)}...</span></div>
              <div className="text-xs text-gray-300">To: <span className="font-mono text-xs text-teal-300">{String(hoveredLink.target).slice(0, 8)}...</span></div>
            </div>
            <div className="text-xs text-gray-300 mt-1 text-center">Tx Count: <span className="font-medium text-lg text-yellow-400">{hoveredLink.tx_count}</span></div>
          </div>
        </div>
      )}

      <div className='lg:col-span-3 mt-6'>
          <h3 className="font-semibold text-xl text-white mb-3">Data Tables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/40 rounded-xl p-4">
              <h4 className="font-semibold mb-3 text-lg border-b border-gray-700/50 pb-2">Nodes List ({nodes.length})</h4>
              <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {nodes.map((n: any) => (
                  <li key={n._id} onClick={() => handleNodeClick(n)} className="p-3 bg-gradient-to-r from-gray-800/40 to-gray-900/30 border border-gray-700/40 rounded-lg flex justify-between items-center hover:bg-gray-700/50 transition duration-150 cursor-pointer">
                    <div>
                      <div className="font-medium text-sm text-cyan-300">{n.address}</div>
                      <div className="text-xs text-gray-400">{n.type || 'address'}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${n.risk_score >= 75 ? 'text-red-400' : n.risk_score >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>{n.risk_score ?? 0}</div>
                      <div className="text-xs text-gray-400">risk</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900/40 rounded-xl p-4">
              <h4 className="font-semibold mb-3 text-lg border-b border-gray-700/50 pb-2">Edges List ({edges.length})</h4>
              <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {edges.map((e: any) => (
                  <li key={e._id} className="p-3 bg-gradient-to-r from-gray-800/30 to-gray-900/20 border border-gray-700/30 rounded-lg flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-semibold text-white">{e.relation}</span> 
                        <span className="text-xs text-gray-400 block">
                            {String(e.from).slice(0, 6)}... &rarr; {String(e.to).slice(0, 6)}...
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-yellow-300">{e.tx_count}</div>
                        <div className="text-xs text-gray-400">transactions</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
      </div>
    </div>
  );
}
