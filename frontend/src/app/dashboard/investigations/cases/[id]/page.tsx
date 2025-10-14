"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import api from '@/utils/axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface CaseDoc { _id: string; title: string; status: string; notes?: string; address_ids: string[]; createdAt: string; updatedAt: string; progress?: number }
interface BasicUser { _id?: string; fullName?: { firstName?: string; lastName?: string }; role?: string; profilePic?: string }

function CaseDetailShell({ user }: { user: BasicUser | null }) {
  const { collapsed } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const [doc, setDoc] = useState<CaseDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('open');
  const [addressPage, setAddressPage] = useState(1);
  const pageSize = 25;

  const fetchCase = useCallback(()=> {
    if (!caseId) return;
    setLoading(true);
    api.get(`/api/cases/${caseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setDoc(res.data.data); setNotes(res.data.data.notes || ''); setStatus(res.data.data.status); })
      .catch(()=> { toast.error('Case not found'); router.push('/dashboard/investigations/cases'); })
      .finally(()=> setLoading(false));
  }, [caseId, token, router]);

  useEffect(()=> { fetchCase(); }, [fetchCase]);

  const save = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      await api.patch(`/api/cases/${doc._id}`, { status, notes }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Saved');
      fetchCase();
    } catch {
      toast.error('Save failed');
    } finally { setSaving(false); }
  };

  const addresses = doc?.address_ids || [];
  const totalPages = Math.ceil(addresses.length / pageSize) || 1;
  const pageSlice = addresses.slice((addressPage-1)*pageSize, addressPage*pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main className={`${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 p-6 lg:p-8`}>
        <Header user={user} />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/investigations/cases" className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 text-sm"><ArrowLeft className="w-4 h-4" /><span>Back</span></Link>
            <h1 className="text-2xl font-bold">Case Detail</h1>
          </div>
          <div className="flex space-x-2">
            <button onClick={fetchCase} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 text-sm"><RefreshCw className="w-4 h-4" /><span>Refresh</span></button>
            <button disabled={saving} onClick={save} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center space-x-2 text-sm disabled:opacity-50"><Save className="w-4 h-4" /><span>{saving?'Saving...':'Save'}</span></button>
          </div>
        </div>
        {loading && <div className="p-10 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />Loading case...</div>}
        {!loading && doc && (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="md:col-span-2 bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-4">Overview</h2>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-400">Case ID:</span> <span className="font-mono">{doc._id}</span></div>
                  <div><span className="text-gray-400">Title:</span> {doc.title}</div>
                  <div><span className="text-gray-400">Status:</span> 
                    <select value={status} onChange={e=>setStatus(e.target.value)} className="ml-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:outline-none">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div><span className="text-gray-400">Created:</span> {new Date(doc.createdAt).toLocaleString()}</div>
                  <div><span className="text-gray-400">Updated:</span> {new Date(doc.updatedAt).toLocaleString()}</div>
                  <div><span className="text-gray-400">Addresses:</span> {doc.address_ids.length}</div>
                </div>
                <div className="mt-6">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Notes</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={6} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-600" placeholder="Add investigative notes, hypotheses, next steps..." />
                </div>
              </div>
              <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-4">Progress</h2>
                <div className="mb-4">
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${doc.progress===100?'bg-emerald-500':'bg-cyan-600'} transition-all`} style={{ width: `${doc.progress ?? 0}%` }}></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">{doc.progress}% complete</div>
                </div>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li>• Status based progress heuristic</li>
                  <li>• Future: auto-calc from completed analysis tasks</li>
                  <li>• Export snapshots & link to reports</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5 mb-8">
              <h2 className="text-lg font-semibold mb-4">Addresses ({addresses.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-900/80 border-b border-gray-700 text-gray-300">
                    <tr>
                      <th className="p-3">Address</th>
                      <th className="p-3">Coin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map(a => (
                      <tr key={a} className="border-b border-gray-800 hover:bg-gray-800/40">
                        <td className="p-3 font-mono text-xs truncate" style={{maxWidth:340}}>{a}</td>
                        <td className="p-3 text-gray-400 text-xs">auto</td>
                      </tr>
                    ))}
                    {pageSlice.length===0 && <tr><td colSpan={2} className="p-6 text-center text-gray-500">No addresses</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                <div>Page {addressPage} / {totalPages}</div>
                <div className="flex space-x-2">
                  <button disabled={addressPage<=1} onClick={()=>setAddressPage(p=>p-1)} className={`px-3 py-1 rounded-lg border border-gray-700 ${addressPage<=1?'text-gray-500':'hover:bg-gray-800'}`}>Prev</button>
                  <button disabled={addressPage>=totalPages} onClick={()=>setAddressPage(p=>p+1)} className={`px-3 py-1 rounded-lg border border-gray-700 ${addressPage>=totalPages?'text-gray-500':'hover:bg-gray-800'}`}>Next</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function CaseDetailPage() {
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
  return <SidebarProvider><CaseDetailShell user={user} /></SidebarProvider>;
}
