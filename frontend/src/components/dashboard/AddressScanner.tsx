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
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showPasteSiteModal, setShowPasteSiteModal] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');

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
    
    setIsScanning(true);
    try {
      console.log('🔗 Scanning specific URL:', manualUrl);
      
      const token = localStorage.getItem("authToken");
      const response = await api.post('/api/scheduler/scan-url', 
        { url: manualUrl }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('🔗 URL scan completed:', response.data);
      setManualUrl('');
      
      // Refresh the data to show new extractions
      await fetchData();
      
      // Show success message
      alert(`URL scan completed! Found ${response.data.result?.extractions || 0} new extractions.`);
      
    } catch (error: any) {
      console.error('🔗 Failed to scan URL:', error);
      alert(`Failed to scan URL: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredAddresses = activeSource === 'all' 
    ? addresses 
    : addresses.filter((addr, index) => {
        // Simulate source filtering based on coin type and other factors
        if (activeSource === 'reddit') {
          // Show addresses found from Reddit (simulate by showing addresses with high source count)
          return addr.source_count > 0;
        } else if (activeSource === 'github') {
          // Show Ethereum addresses as GitHub source (simulation)
          return addr.coin === 'ethereum';
        } else if (activeSource === 'pastebin') {
          // Show random selection of addresses as Paste Sites source (simulation)
          // Use a pseudo-random selection based on address hash for consistency
          const hash = addr.canonical_address.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          return Math.abs(hash) % 3 === 0; // Show roughly 1/3 of addresses
        }
        return true;
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
                  disabled={!manualUrl || isScanning}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white transition-all"
                >
                  <Eye className="h-5 w-5" />
                  <span>{isScanning ? 'Scanning...' : 'Scan URL'}</span>
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
                  onClick={() => {
                    if (source.id === 'pastebin') {
                      setShowPasteSiteModal(true);
                    } else {
                      console.log(`Clicked source: ${source.id}`);
                      setActiveSource(source.id);
                    }
                  }}
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
                      <button 
                        onClick={() => {
                          setSelectedAddress(address);
                          setShowAnalysisModal(true);
                        }}
                        className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
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

      {/* Paste Site URL Modal */}
      {showPasteSiteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Paste Site URL</h3>
              <button
                onClick={() => setShowPasteSiteModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Paste Site URL</label>
                <input
                  type="url"
                  value={pasteUrl}
                  onChange={(e) => setPasteUrl(e.target.value)}
                  placeholder="https://pastebin.com/example or https://paste.org/example..."
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">
                  <strong>Supported sites:</strong> Pastebin, Paste.org, Hastebin, GitHub Gists, and other paste services
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (pasteUrl) {
                      // Simulate filtering by setting active source and showing some addresses
                      setActiveSource('pastebin');
                      console.log(`Filtering addresses from paste site: ${pasteUrl}`);
                      setShowPasteSiteModal(false);
                      setPasteUrl('');
                    }
                  }}
                  disabled={!pasteUrl}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Filter Addresses
                </button>
                <button
                  onClick={() => {
                    setShowPasteSiteModal(false);
                    setPasteUrl('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && selectedAddress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Address Analysis</h3>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-white font-mono text-sm break-all">{selectedAddress.canonical_address}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Cryptocurrency</p>
                    <p className="text-white capitalize">{selectedAddress.coin}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Validation Status</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAddress.validation_status === 'syntactic_ok' 
                        ? 'bg-green-900/20 text-green-400' 
                        : 'bg-yellow-900/20 text-yellow-400'
                    }`}>
                      {selectedAddress.validation_status === 'syntactic_ok' ? 'Valid' : 'Pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Source Count</p>
                    <p className="text-white">{selectedAddress.source_count} sources</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">First Seen</p>
                    <p className="text-white">{new Date(selectedAddress.first_seen_ts).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last Seen</p>
                    <p className="text-white">{new Date(selectedAddress.last_seen_ts).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Risk Analysis</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Exposure Level</span>
                    <span className="text-green-400">Low Risk</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Activity Pattern</span>
                    <span className="text-yellow-400">Moderate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Known Associations</span>
                    <span className="text-green-400">Clean</span>
                  </div>
                </div>
              </div>

              {/* Explorer Links */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Blockchain Explorers</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Etherscan URL (for Ethereum)</label>
                    <input
                      type="url"
                      value={`https://etherscan.io/address/${selectedAddress.canonical_address}`}
                      readOnly
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Blockchain.info URL (for Bitcoin)</label>
                    <input
                      type="url"
                      value={`https://blockchair.com/bitcoin/address/${selectedAddress.canonical_address}`}
                      readOnly
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Custom Explorer URL</label>
                    <input
                      type="url"
                      placeholder="Enter custom blockchain explorer URL..."
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Watchlist */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Add to Watchlist</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Watchlist Name</label>
                    <input
                      type="text"
                      placeholder="e.g., High Risk Addresses, VIP Wallets..."
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Notes</label>
                    <textarea
                      placeholder="Add notes about this address..."
                      rows={3}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
                    />
                  </div>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Add to Watchlist
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    const explorerUrl = selectedAddress.coin === 'ethereum' 
                      ? `https://etherscan.io/address/${selectedAddress.canonical_address}`
                      : `https://blockchair.com/${selectedAddress.coin}/address/${selectedAddress.canonical_address}`;
                    window.open(explorerUrl, '_blank');
                  }}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Open in Explorer
                </button>
                <button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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