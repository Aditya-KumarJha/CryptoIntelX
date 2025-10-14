"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import api from '@/utils/axios';
import { Download, RefreshCw, Search, FolderPlus, X, Loader2, CheckCircle2, AlertCircle, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RecordRow {
  address: string;
  coin: string;
  risk: number;
  lastSeen?: string;
  category?: string;
  source?: string;
  txCount?: number;
  counterparty_count?: number;
}

const riskColor = (r: number) => r >= 80 ? 'text-red-400' : r >= 50 ? 'text-yellow-400' : 'text-green-400';

interface BasicUser { _id?: string; fullName?: { firstName?: string; lastName?: string }; role?: string; profilePic?: string }

function InvestigationShell({ user }: { user: BasicUser | null }) {
  const { collapsed } = useSidebar();
  const [data, setData] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNotes, setCaseNotes] = useState('');
  const [creatingCase, setCreatingCase] = useState(false);

  // Removed embedded cases table; navigation button instead.

  // Filters
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [coin, setCoin] = useState('');
  const [minRisk, setMinRisk] = useState(0);
  const [maxRisk, setMaxRisk] = useState(100);
  const [source, setSource] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchData = useCallback(() => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(limit), minRisk: String(minRisk), maxRisk: String(maxRisk) });
    if (q) params.append('q', q);
    if (category) params.append('category', category);
    if (coin) params.append('coin', coin);
    if (source) params.append('source', source);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    api.get(`/api/investigations/search?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setData(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
        setSelected(new Set());
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [page, limit, q, category, coin, source, from, to, minRisk, maxRisk, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSelect = (addr: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(addr)) next.delete(addr); else next.add(addr);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map(d => d.address)));
  };

  const exportCSV = () => {
    const rows = data.filter(r => selected.size === 0 || selected.has(r.address));
    const headers = ['Address','Coin','Category','Risk','Last Seen','Source','Tx Count','Counterparties'];
    const csv = [headers.join(',')].concat(rows.map(r => [r.address,r.coin,r.category||'',r.risk,r.lastSeen?new Date(r.lastSeen).toISOString():'',r.source||'',r.txCount??'',r.counterparty_count??''].map(v => `"${String(v).replaceAll('"','""')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='investigations.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const exportJSON = () => {
    const rows = data.filter(r => selected.size === 0 || selected.has(r.address));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='investigations.json'; a.click(); URL.revokeObjectURL(url);
  };

  const openCaseModal = () => {
    if (selected.size === 0) {
      toast.error('Select at least one address');
      return;
    }
    setCaseTitle(`Investigation ${new Date().toISOString().slice(0,19).replace('T',' ')}`);
    setCaseNotes('');
    setCaseModalOpen(true);
  };

  const submitCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim()) {
      toast.error('Title required');
      return;
    }
    setCreatingCase(true);
    try {
      await api.post('/api/cases', { title: caseTitle.trim(), notes: caseNotes.trim(), address_ids: Array.from(selected) }, { headers: { Authorization: `Bearer ${token}` } });
  toast.success('Case created');
  setCaseModalOpen(false);
  setSelected(new Set());
      fetchCases();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || 'Failed to create case';
      toast.error(msg);
    } finally {
      setCreatingCase(false);
    }
  };

  // no fetchCases needed now

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main className={`${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 p-6 lg:p-8`}>        
        <Header user={user} />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Investigations</h1>
            <div className="flex border border-gray-700 rounded-lg overflow-hidden text-sm">
              <span className="px-4 py-2 bg-cyan-600 text-white font-medium">Addresses</span>
              <a href="/dashboard/investigations/cases" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center space-x-1">
                <FolderOpen className="w-4 h-4" /> <span>Cases</span>
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchData} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 text-sm"><RefreshCw className="w-4 h-4" /><span>Refresh</span></button>
            <button onClick={exportCSV} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center space-x-2 text-sm"><Download className="w-4 h-4" /><span>CSV</span></button>
            <button onClick={exportJSON} className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg flex items-center space-x-2 text-sm"><Download className="w-4 h-4" /><span>JSON</span></button>
            <button disabled={selected.size===0} onClick={openCaseModal} className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-sm ${selected.size===0?'bg-gray-700 cursor-not-allowed':'bg-emerald-600 hover:bg-emerald-500'}`}><FolderPlus className="w-4 h-4" /><span>Create Case</span></button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-2 lg:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={e=>{setPage(1);setQ(e.target.value);}} placeholder="Search address" className="w-full pl-9 pr-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-600" />
          </div>
          <select value={coin} onChange={e=>{setPage(1);setCoin(e.target.value);}} className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:ring-2 focus:ring-cyan-600"><option value="">Coin</option><option value="bitcoin">Bitcoin</option><option value="ethereum">Ethereum</option><option value="monero">Monero</option></select>
          <select value={category} onChange={e=>{setPage(1);setCategory(e.target.value);}} className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:ring-2 focus:ring-cyan-600"><option value="">Category</option><option value="Terror Financing">Terror Financing</option><option value="Money Laundering">Money Laundering</option><option value="Scams & Phishing">Scams & Phishing</option><option value="Ransomware">Ransomware</option></select>
          <input type="text" value={source} onChange={e=>{setPage(1);setSource(e.target.value);}} placeholder="Source contains" className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:ring-2 focus:ring-cyan-600" />
          <div className="flex space-x-2">
            <input type="number" value={minRisk} onChange={e=>{setPage(1);setMinRisk(Number(e.target.value));}} min={0} max={100} className="w-1/2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700" placeholder="Min" />
            <input type="number" value={maxRisk} onChange={e=>{setPage(1);setMaxRisk(Number(e.target.value));}} min={0} max={100} className="w-1/2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-700" placeholder="Max" />
          </div>
          <input type="date" value={from} onChange={e=>{setPage(1);setFrom(e.target.value);}} className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700" />
          <input type="date" value={to} onChange={e=>{setPage(1);setTo(e.target.value);}} className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700" />
        </div>

  {/* Table */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900/80 border-b border-gray-700 text-gray-300">
              <tr>
                <th className="p-3"><input type="checkbox" onChange={toggleSelectAll} checked={selected.size===data.length && data.length>0} /></th>
                <th className="p-3">Address</th>
                <th className="p-3">Coin</th>
                <th className="p-3">Category</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Last Seen</th>
                <th className="p-3">Source</th>
                <th className="p-3">Tx</th>
                <th className="p-3">Counterparties</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="p-6 text-center text-gray-400">Loading...</td></tr>
              )}
              {error && !loading && (
                <tr><td colSpan={9} className="p-6 text-center text-red-400">{error}</td></tr>
              )}
              {!loading && !error && data.map(row => (
                <tr key={row.address} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="p-3"><input type="checkbox" checked={selected.has(row.address)} onChange={()=>toggleSelect(row.address)} /></td>
                  <td className="p-3 font-mono text-sm truncate" style={{maxWidth:240}}>{row.address}</td>
                  <td className="p-3">{row.coin}</td>
                  <td className="p-3">{row.category || '-'}</td>
                  <td className={`p-3 font-semibold ${riskColor(row.risk)}`}>{Math.round(row.risk)}</td>
                  <td className="p-3 text-gray-400">{row.lastSeen ? new Date(row.lastSeen).toLocaleString() : '-'}</td>
                  <td className="p-3 text-gray-400">{row.source || '-'}</td>
                  <td className="p-3 text-gray-400">{row.txCount ?? '-'}</td>
                  <td className="p-3 text-gray-400">{row.counterparty_count ?? '-'}</td>
                </tr>
              ))}
              {!loading && !error && data.length === 0 && (
                <tr><td colSpan={9} className="p-6 text-center text-gray-400">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Removed embedded cases summary; navigation provided above */}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
          <div>Page {page} / {totalPages} — {total} total</div>
          <div className="flex items-center space-x-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className={`px-3 py-1 rounded-lg border border-gray-700 ${page<=1?'text-gray-500':'hover:bg-gray-800'}`}>Prev</button>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className={`px-3 py-1 rounded-lg border border-gray-700 ${page>=totalPages?'text-gray-500':'hover:bg-gray-800'}`}>Next</button>
            <select value={limit} onChange={e=>{setLimit(Number(e.target.value)); setPage(1);}} className="bg-gray-800 rounded-lg px-2 py-1 border border-gray-700">
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </main>

      {caseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>!creatingCase && setCaseModalOpen(false)}></div>
          <div className="relative bg-gray-900/95 border border-gray-700/60 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create Investigation Case</h3>
              <button onClick={()=>!creatingCase && setCaseModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={submitCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Title</label>
                <input value={caseTitle} onChange={e=>setCaseTitle(e.target.value)} maxLength={120} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-600" placeholder="Case title" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Notes</label>
                <textarea value={caseNotes} onChange={e=>setCaseNotes(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-600" placeholder="Context, hypotheses, next steps..." />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{selected.size} address{selected.size!==1 && 'es'} selected</span>
                <span>Risk range: {minRisk}-{maxRisk}</span>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button type="button" disabled={creatingCase} onClick={()=>setCaseModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={creatingCase} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {creatingCase ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}<span>{creatingCase ? 'Creating...' : 'Create Case'}</span>
                </button>
              </div>
            </form>
            <p className="mt-4 text-xs text-gray-500 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>Cases let you persist a snapshot of selected addresses for deeper investigation & export.</span></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvestigationsPage() {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    api.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(() => { localStorage.removeItem('authToken'); window.location.href = '/login'; })
      .finally(()=> setAuthLoading(false));
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-cyan-400"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-20 w-20 border-2 border-cyan-400/20"></div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <InvestigationShell user={user} />
    </SidebarProvider>
  );
}
