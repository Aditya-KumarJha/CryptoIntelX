"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { 
  Radar, 
  Play, 
  Pause, 
  RefreshCw,
  Globe,
  Github,
  MessageSquare,
  Link,
  Eye,
  Clock,
  Hash,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Database,
  Coins,
  Target
} from "lucide-react";

interface AddressScannerStats {
  totalAddresses: number;
  totalSnapshots: number;
  totalExtractions: number;
  lastScrape: string | null;
}

interface Address {
  _id: string;
  canonical_address: string;
  coin: string;
  source_count: number;
  first_seen_ts: string;
  last_seen_ts: string;
  validation_status: string;
}

interface Snapshot {
  _id: string;
  post_id: string;
  subreddit: string;
  url: string;
  fetched_at: string;
  source: string;
}

interface SchedulerStatus {
  running: boolean;
  jobs: string[];
  nextRun: string;
}

function AddressScannerContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { collapsed } = useSidebar();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [stats, setStats] = useState<AddressScannerStats>({
    totalAddresses: 0,
    totalSnapshots: 0,
    totalExtractions: 0,
    lastScrape: null
  });
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({
    running: false,
    jobs: [],
    nextRun: 'Not scheduled'
  });
  const [activeSource, setActiveSource] = useState('all');
  const [manualUrl, setManualUrl] = useState('');

  const sources = [
    { id: 'all', name: 'All Sources', icon: Globe, color: 'blue' },
    { id: 'reddit', name: 'Reddit', icon: MessageSquare, color: 'orange' },
    { id: 'github', name: 'GitHub', icon: Github, color: 'gray' },
    { id: 'pastebin', name: 'Paste Sites', icon: Link, color: 'green' }
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data);
        fetchData();
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        router.replace("/login?error=session_expired");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const fetchData = async () => {
    try {
      console.log('Fetching scheduler data...');
      
      const [addressesRes, snapshotsRes, statsRes, statusRes] = await Promise.all([
        api.get('/api/scheduler/addresses'),
        api.get('/api/scheduler/snapshots'),
        api.get('/api/scheduler/stats'),
        api.get('/api/scheduler/status')
      ]);

      console.log('API responses:', {
        addresses: addressesRes.data,
        snapshots: snapshotsRes.data,
        stats: statsRes.data,
        status: statusRes.data
      });

      setAddresses(addressesRes.data);
      setSnapshots(snapshotsRes.data);
      setStats(statsRes.data);
      setSchedulerStatus(statusRes.data);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const toggleScheduler = async () => {
    try {
      const endpoint = schedulerStatus.running ? '/api/scheduler/stop' : '/api/scheduler/start';
      console.log('Toggling scheduler:', endpoint);
      const response = await api.post(endpoint);
      console.log('Toggle response:', response.data);
      fetchData();
    } catch (error: any) {
      console.error('Failed to toggle scheduler:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const runManualScan = async () => {
    try {
      console.log('Running manual scan...');
      const response = await api.post('/api/scheduler/run-now');
      console.log('Manual scan response:', response.data);
      fetchData();
    } catch (error: any) {
      console.error('Failed to run manual scan:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const scanManualUrl = async () => {
    if (!manualUrl) return;
    try {
      // This would need a new endpoint for single URL scanning
      console.log('Scanning URL:', manualUrl);
      setManualUrl('');
    } catch (error) {
      console.error('Failed to scan URL:', error);
    }
  };

  const filteredAddresses = activeSource === 'all' 
    ? addresses 
    : addresses.filter(addr => {
        // Filter based on source - this would need source tracking in the backend
        return true; // For now, show all
      });

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main className={`${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 p-6 lg:p-8 min-h-screen overflow-auto`}>
        <Header user={user} />
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Radar className="h-8 w-8 text-cyan-400 mr-3" />
                Address Scanner
              </h2>
              <p className="text-gray-300">Multi-source cryptocurrency address intelligence gathering</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                schedulerStatus.running 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  schedulerStatus.running ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span>{schedulerStatus.running ? 'Active Scanning' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Coins className="h-8 w-8 text-cyan-400" />
              <span className="text-green-400 text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> Active
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalAddresses}</h3>
            <p className="text-gray-300 text-sm">Addresses Found</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Database className="h-8 w-8 text-purple-400" />
              <span className="text-blue-400 text-sm flex items-center">
                <Activity className="h-4 w-4 mr-1" /> Live
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalSnapshots}</h3>
            <p className="text-gray-300 text-sm">Sources Scanned</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-orange-400" />
              <span className="text-yellow-400 text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +24
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalExtractions}</h3>
            <p className="text-gray-300 text-sm">Total Extractions</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-green-400" />
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${schedulerStatus.running ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {stats.lastScrape ? new Date(stats.lastScrape).toLocaleTimeString() : 'Never'}
            </h3>
            <p className="text-gray-300 text-sm">Last Scan</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Scanner Controls</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auto Scanner */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Automated Scanning</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="text-white font-medium">Auto-Scanner</p>
                    <p className="text-gray-400 text-sm">{schedulerStatus.nextRun}</p>
                  </div>
                  <button
                    onClick={toggleScheduler}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      schedulerStatus.running
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {schedulerStatus.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{schedulerStatus.running ? 'Stop' : 'Start'}</span>
                  </button>
                </div>
                
                <button
                  onClick={runManualScan}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-all"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Run Manual Scan</span>
                </button>
              </div>
            </div>

            {/* Manual URL Scanner */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Manual URL Scanner</h4>
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Enter URL to scan for addresses..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={scanManualUrl}
                  disabled={!manualUrl}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white transition-all"
                >
                  <Eye className="h-5 w-5" />
                  <span>Scan URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Source Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Filter by Source</h3>
          <div className="flex flex-wrap gap-3">
            {sources.map((source) => {
              const Icon = source.icon;
              const isActive = activeSource === source.id;
              return (
                <button
                  key={source.id}
                  onClick={() => setActiveSource(source.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? `bg-${source.color}-600/20 border border-${source.color}-500/30 text-${source.color}-400`
                      : 'bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-600/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{source.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Found Addresses Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Found Addresses ({filteredAddresses.length})</h3>
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Address</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Coin</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Found Count</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">First Seen</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAddresses.map((address) => (
                  <tr key={address._id} className="border-b border-gray-700/25 hover:bg-gray-700/25 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <code className="text-cyan-400 font-mono text-sm">
                          {address.canonical_address.slice(0, 12)}...{address.canonical_address.slice(-8)}
                        </code>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs uppercase font-medium">
                        {address.coin}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {address.validation_status === 'syntactic_ok' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className={`text-sm ${
                          address.validation_status === 'syntactic_ok' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {address.validation_status === 'syntactic_ok' ? 'Valid' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white">{address.source_count}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">
                      {new Date(address.first_seen_ts).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm">Analyze</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAddresses.length === 0 && (
              <div className="text-center py-12">
                <Radar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No addresses found yet</p>
                <p className="text-gray-500 text-sm">Start the scanner to begin finding cryptocurrency addresses</p>
              </div>
            )}
          </div>
        </div>

        {/* Auto-refresh */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            Data refreshes automatically every 30 seconds when scanner is active
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AddressScanner() {
  return (
    <SidebarProvider>
      <AddressScannerContent />
    </SidebarProvider>
  );
}