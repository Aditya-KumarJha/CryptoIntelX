"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import api from '@/utils/axios';
import { RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface CaseRow { _id: string; title: string; status: string; notes?: string; address_ids: string[]; createdAt: string; updatedAt: string; }
interface BasicUser { _id?: string; fullName?: { firstName?: string; lastName?: string }; role?: string; profilePic?: string }

function CasesShell({ user }: { user: BasicUser | null }) {
  const { collapsed } = useSidebar();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchCases = () => {
    setLoading(true);
    api.get('/api/cases', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCases(res.data.data || []))
      .catch(()=> toast.error('Failed to load cases'))
      .finally(()=> setLoading(false));
  };

  useEffect(()=>{ fetchCases(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(()=> cases.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (q && !c.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [cases, statusFilter, q]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main className={`${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 p-6 lg:p-8`}>
        <Header user={user} />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Cases</h1>
            <div className="flex border border-gray-700 rounded-lg overflow-hidden text-sm">
              <a href="/dashboard/investigations" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300">Addresses</a>
              <span className="px-4 py-2 bg-cyan-600 text-white font-medium">Cases</span>
            </div>
          </div>
            <button onClick={fetchCases} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 text-sm"><RefreshCw className="w-4 h-4" /><span>Refresh</span></button>
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 mb-6 grid gap-4 md:grid-cols-4">
          <div className="col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title" className="w-full pl-9 pr-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-600" />
          </div>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:ring-2 focus:ring-cyan-600">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <div className="flex items-center text-sm text-gray-400">{filtered.length} / {cases.length} shown</div>
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900/80 border-b border-gray-700 text-gray-300">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Addresses</th>
                <th className="p-3">Updated</th>
                <th className="p-3">Progress</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-6 text-center text-gray-400">Loading...</td></tr>}
              {!loading && filtered.length===0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No cases</td></tr>}
              {!loading && filtered.map(c => {
                const progress = c.status === 'closed' ? 100 : c.status === 'in_progress' ? 60 : 20;
                return (
                  <tr key={c._id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="p-3 font-medium"><Link href={`/dashboard/investigations/cases/${c._id}`} className="text-cyan-400 hover:underline">{c.title}</Link></td>
                    <td className="p-3 text-sm capitalize">{c.status.replace('_',' ')}</td>
                    <td className="p-3 text-sm text-gray-400">{c.address_ids?.length || 0}</td>
                    <td className="p-3 text-xs text-gray-400 whitespace-nowrap">{new Date(c.updatedAt).toLocaleString()}</td>
                    <td className="p-3 w-48">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${progress===100?'bg-emerald-500':'bg-cyan-600'} transition-all`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </td>
                    <td className="p-3 text-right text-xs text-gray-500"><Link href={`/dashboard/investigations/cases/${c._id}`} className="px-3 py-1 bg-cyan-700/30 hover:bg-cyan-700/40 rounded-lg text-cyan-300">Open</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function CasesPage() {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = '/login'; return; }
    api.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(()=> { localStorage.removeItem('authToken'); window.location.href='/login'; })
      .finally(()=> setAuthLoading(false));
  }, []);
  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"><div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-cyan-400"></div></div>;
  return <SidebarProvider><CasesShell user={user} /></SidebarProvider>;
}
