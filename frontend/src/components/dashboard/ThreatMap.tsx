"use client";

import { MapPin, AlertTriangle, TrendingUp } from "lucide-react";

interface ThreatLocation {
  id: string;
  country: string;
  city: string;
  threatCount: number;
  riskLevel: 'high' | 'medium' | 'low';
  coordinates: [number, number];
  mainThreatType: string;
  trend: 'up' | 'down' | 'stable';
}

interface ThreatMapProps {
  threats: ThreatLocation[];
}

export default function ThreatMap({ threats }: ThreatMapProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const topThreats = threats
    .sort((a, b) => b.threatCount - a.threatCount)
    .slice(0, 8);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <MapPin className="h-6 w-6 text-cyan-400 mr-3" />
          Global Threat Map
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Feed</span>
        </div>
      </div>

      {/* Threat Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topThreats.map((threat) => (
          <div 
            key={threat.id}
            className={`border rounded-xl p-4 hover:bg-gray-700/30 transition-all duration-200 ${getRiskColor(threat.riskLevel)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-white font-medium text-sm">
                  {threat.city}, {threat.country}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {threat.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-red-400" />
                )}
                <span className="text-xs font-semibold">
                  {threat.threatCount}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-300 mb-2">
              Primary: {threat.mainThreatType}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getRiskColor(threat.riskLevel)}`}>
                {threat.riskLevel.toUpperCase()}
              </span>
              <div className="text-xs text-gray-400">
                {threat.trend === 'up' ? '↗️ Rising' : 
                 threat.trend === 'down' ? '↘️ Declining' : '→ Stable'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-400">
              {threats.filter(t => t.riskLevel === 'high').length}
            </div>
            <div className="text-xs text-gray-400">High Risk Zones</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {threats.filter(t => t.riskLevel === 'medium').length}
            </div>
            <div className="text-xs text-gray-400">Medium Risk</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {threats.reduce((sum, t) => sum + t.threatCount, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Threats</div>
          </div>
        </div>
      </div>
    </div>
  );
}
