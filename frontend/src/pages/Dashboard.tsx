"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { 
  Search, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Network, 
  Database,
  Brain,
  Zap,
  Globe,
  Eye,
  Activity,
  Target,
  Radar,
  ChevronRight,
  DollarSign,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Coins,
  Hexagon
} from "lucide-react";

interface DashboardStats {
  totalAddresses: number;
  flaggedAddresses: number;
  activeCases: number;
  riskScore: number;
  newThreats: number;
  cryptoTypes: { name: string; count: number; percentage: number }[];
  recentActivity: { time: string; type: string; address: string; risk: 'high' | 'medium' | 'low' }[];
  threatCategories: { category: string; count: number; trend: 'up' | 'down' }[];
}

function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { collapsed } = useSidebar();
  const [stats, setStats] = useState<DashboardStats>({
    totalAddresses: 0,
    flaggedAddresses: 0,
    activeCases: 0,
    riskScore: 0,
    newThreats: 0,
    cryptoTypes: [],
    recentActivity: [],
    threatCategories: []
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` } as const;

    // Helper: pretty time ago
    const timeAgo = (ts?: string | number | Date) => {
      if (!ts) return 'just now';
      const d = new Date(ts).getTime();
      const diff = Math.max(0, Date.now() - d);
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins} min ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hr${hrs>1?'s':''} ago`;
      const days = Math.floor(hrs / 24);
      return `${days} day${days>1?'s':''} ago`;
    };

    // Load user and dashboard data in parallel
    (async () => {
      try {
        const [meRes, overviewRes, recentRes, categoriesRes, casesRes] = await Promise.all([
          api.get('/api/users/me', { headers }),
          api.get('/api/threat/overview', { headers }),
          api.get('/api/threat/recent?limit=20', { headers }),
          api.get('/api/threat/categories', { headers }),
          // api.get('/api/threat/trend?days=14', { headers }),
          api.get('/api/cases', { headers }).catch(() => ({ data: { data: [] } })),
        ]);

        setUser(meRes.data);

        const ov = overviewRes.data?.data || {};
        const recent: Array<{ address:string; coin?:string; risk?:number; lastSeen?:string; category?:string; source?:string }> = recentRes.data?.data || [];
  const categories: Array<{ name: string; value: number }> = categoriesRes.data?.data || [];
        const userCases: Array<{ status?: string }> = casesRes.data?.data || [];

        // Active cases = cases not closed
        const activeCases = userCases.filter(c => (c.status || 'open') !== 'closed').length;

        // Derive crypto type distribution from recent sample by coin
        const coinCounts = recent.reduce<Record<string, number>>((acc, r) => {
          const key = (r.coin || 'Other').toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        // Map to top groups Bitcoin/Ethereum/Others
        const btc = (coinCounts['btc'] || coinCounts['bitcoin']) ?? 0;
        const eth = (coinCounts['eth'] || coinCounts['ethereum']) ?? 0;
        const totalCoins = Object.values(coinCounts).reduce((a, b) => a + b, 0) || 1;
        const others = Math.max(0, totalCoins - (btc + eth));
        const cryptoTypes = [
          { name: 'Bitcoin', count: btc, percentage: Math.round((btc / totalCoins) * 100) },
          { name: 'Ethereum', count: eth, percentage: Math.round((eth / totalCoins) * 100) },
          { name: 'Others', count: others, percentage: Math.max(0, 100 - (Math.round((btc / totalCoins) * 100) + Math.round((eth / totalCoins) * 100))) },
        ];

        // Recent activity mapping
        const recentActivity: DashboardStats['recentActivity'] = recent.slice(0, 10).map((r) => {
          const riskLevel: 'high' | 'medium' | 'low' = (r.risk ?? 0) >= 80 ? 'high' : (r.risk ?? 0) >= 50 ? 'medium' : 'low';
          const addr = r.address || '';
          return {
            time: timeAgo(r.lastSeen || Date.now()),
            type: r.category ? `${r.category} detection` : (r.source ? `${r.source} detection` : 'New detection'),
            address: addr.length > 10 ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : addr,
            risk: riskLevel,
          };
        });

        // Threat categories with a simple up/down heuristic (above median = up)
        const median = (() => {
          const vals = categories.map(c => c.value).sort((a, b) => a - b);
          if (vals.length === 0) return 0;
          const mid = Math.floor(vals.length / 2);
          return vals.length % 2 ? vals[mid] : Math.round((vals[mid - 1] + vals[mid]) / 2);
        })();
        const threatCategories = categories.slice(0, 6).map(c => ({
          category: c.name,
          count: c.value,
          trend: c.value >= median ? 'up' as const : 'down' as const,
        }));

        // Risk score: combine high-risk ratio and activity in last 24h
        const total = ov.totalAddresses || 0;
        const high = ov.highRiskCount || 0;
        const last24 = ov.last24hExtractions || 0;
        const highRatio = total > 0 ? high / total : 0;
        const baseScore = Math.min(80, Math.round(highRatio * 80));
        const activityBoost = Math.min(20, Math.round(Math.min(last24 / 500, 1) * 20));
        const riskScore = Math.min(100, baseScore + activityBoost);

        // New threats today approximated by last 24h extractions
        const newThreats = last24;

        setStats({
          totalAddresses: total,
          flaggedAddresses: high,
          activeCases,
          riskScore,
          newThreats,
          cryptoTypes,
          recentActivity,
          threatCategories,
        });
  } catch {
        // Auth failure or API error => redirect to login
        localStorage.removeItem('authToken');
        router.replace('/login?error=session_expired');
      } finally {
        setLoading(false);
      }
    })();
    
  }, [router]);

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
        
        {/* Intelligence Overview Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Crypto Intelligence Overview</h2>
              <p className="text-gray-300">Real-time monitoring of cryptocurrency threats and suspicious activities</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Addresses Monitored */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Database className="h-8 w-8 text-blue-400" />
              <span className="text-green-400 text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +12.5%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalAddresses.toLocaleString()}</h3>
            <p className="text-gray-300 text-sm">Total Addresses Monitored</p>
          </div>

          {/* Flagged Addresses */}
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <span className="text-red-400 text-sm flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +8.2%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.flaggedAddresses.toLocaleString()}</h3>
            <p className="text-gray-300 text-sm">High-Risk Addresses</p>
          </div>

          {/* Active Cases */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-purple-400" />
              <span className="text-yellow-400 text-sm flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-1" /> -2.1%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.activeCases}</h3>
            <p className="text-gray-300 text-sm">Active Investigations</p>
          </div>

          {/* Risk Score */}
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-yellow-400" />
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-700 rounded-full">
                  <div className="w-3/4 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.riskScore}/100</h3>
            <p className="text-gray-300 text-sm">Global Risk Index</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Left Column - Core Intelligence */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Intelligence Modules */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Brain className="h-6 w-6 text-cyan-400 mr-3" />
                AI Intelligence Modules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-400/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <Search className="h-6 w-6 text-cyan-400" />
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Address Intelligence</h4>
                  <p className="text-gray-300 text-sm mb-3">AI-powered crypto address risk assessment and entity linking</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-cyan-400">
                      <Zap className="h-3 w-3 mr-1" />
                      Real-time Analysis
                    </div>
                    <div className="text-xs text-white font-semibold">2.8K flagged</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <Network className="h-6 w-6 text-purple-400" />
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Network Analysis</h4>
                  <p className="text-gray-300 text-sm mb-3">Transaction network mapping and entity relationship graphs</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-purple-400">
                      <Eye className="h-3 w-3 mr-1" />
                      Graph Analytics
                    </div>
                    <div className="text-xs text-white font-semibold">156 networks</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4 hover:border-green-400/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <Globe className="h-6 w-6 text-green-400" />
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Dark Web Monitor</h4>
                  <p className="text-gray-300 text-sm mb-3">24/7 surveillance of darknet markets and forums</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-green-400">
                      <Radar className="h-3 w-3 mr-1" />
                      Live Surveillance
                    </div>
                    <div className="text-xs text-white font-semibold">89 sources</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-600/10 to-red-600/10 border border-orange-500/20 rounded-xl p-4 hover:border-orange-400/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Threat Prediction</h4>
                  <p className="text-gray-300 text-sm mb-3">ML-powered predictive threat intelligence and alerts</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-orange-400">
                      <Activity className="h-3 w-3 mr-1" />
                      Predictive AI
                    </div>
                    <div className="text-xs text-white font-semibold">92% accuracy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Analytics Dashboard */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <BarChart3 className="h-6 w-6 text-cyan-400 mr-3" />
                Intelligence Analytics
              </h3>
              
              {/* Crypto Distribution with Enhanced Visuals */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4">Cryptocurrency Distribution</h4>
                <div className="space-y-4">
                  {stats.cryptoTypes.map((crypto, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {crypto.name === 'Bitcoin' && <Coins className="h-5 w-5 text-orange-400" />}
                          {crypto.name === 'Ethereum' && <Hexagon className="h-5 w-5 text-blue-400" />}
                          {crypto.name === 'Others' && <DollarSign className="h-5 w-5 text-green-400" />}
                          <span className="text-white font-medium">{crypto.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{crypto.percentage}%</div>
                          <div className="text-gray-400 text-xs">{crypto.count.toLocaleString()} addresses</div>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            crypto.name === 'Bitcoin' ? 'bg-gradient-to-r from-orange-500 to-orange-400' : 
                            crypto.name === 'Ethereum' ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 
                            'bg-gradient-to-r from-green-500 to-green-400'
                          }`}
                          style={{ width: `${crypto.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Heatmap */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Threat Category Heatmap</h4>
                <div className="grid grid-cols-2 gap-3">
                  {stats.threatCategories.map((threat, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{threat.category}</span>
                        <div className={`flex items-center text-xs ${
                          threat.trend === 'up' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {threat.trend === 'up' ? 
                            <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          }
                          {threat.trend === 'up' ? '+' : '-'}15%
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{threat.count}</div>
                      <div className="text-xs text-gray-400">Active cases</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Monitoring */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Activity Feed */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Clock className="h-6 w-6 text-cyan-400 mr-3" />
                  Intelligence Feed
                </h3>
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                    activity.risk === 'high' ? 'bg-red-900/20 border-red-500/30' :
                    activity.risk === 'medium' ? 'bg-yellow-900/20 border-yellow-500/30' :
                    'bg-green-900/20 border-green-500/30'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.risk === 'high' ? 'bg-red-400' : 
                          activity.risk === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <span className="text-white font-medium text-sm">{activity.type}</span>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                    
                    <div className="ml-5">
                      <p className="text-gray-300 text-sm mb-2">Address flagged in suspicious activity</p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-gray-800/50 text-cyan-400 px-2 py-1 rounded">
                          {activity.address}
                        </code>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          activity.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                          activity.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {activity.risk.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <button className="w-full text-cyan-400 hover:text-cyan-300 text-sm font-medium py-2">
                  View All Intelligence Reports →
                </button>
              </div>
            </div>

            {/* Global Threat Overview */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <MapPin className="h-6 w-6 text-cyan-400 mr-3" />
                Global Threat Overview
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">47</div>
                  <div className="text-sm text-gray-300">High-Risk Regions</div>
                  <div className="text-xs text-red-400 mt-1">↗️ +12% this week</div>
                </div>
                
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">134</div>
                  <div className="text-sm text-gray-300">Active Investigations</div>
                  <div className="text-xs text-yellow-400 mt-1">→ Stable</div>
                </div>
              </div>

              {/* Top Threat Locations */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white mb-3">Top Threat Locations</h4>
                {[
                  { country: 'Russia', threats: 289, risk: 'high', trend: 'up' },
                  { country: 'North Korea', threats: 156, risk: 'high', trend: 'up' },
                  { country: 'Iran', threats: 134, risk: 'medium', trend: 'stable' },
                  { country: 'China', threats: 98, risk: 'medium', trend: 'down' }
                ].map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        location.risk === 'high' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}></div>
                      <span className="text-white font-medium">{location.country}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-300 text-sm">{location.threats} threats</span>
                      <div className={`text-xs ${
                        location.trend === 'up' ? 'text-red-400' : 
                        location.trend === 'down' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {location.trend === 'up' ? '↗️' : location.trend === 'down' ? '↘️' : '→'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Zap className="h-6 w-6 text-cyan-400 mr-3" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Address</span>
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <Target className="h-5 w-5" />
              <span>New Investigation</span>
            </button>
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Generate Report</span>
            </button>
            <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alert Center</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}

