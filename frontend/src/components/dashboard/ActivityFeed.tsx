"use client";

import { Clock, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'threat' | 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  metadata?: {
    address?: string;
    source?: string;
    risk?: 'high' | 'medium' | 'low';
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export default function ActivityFeed({ activities, maxItems = 5 }: ActivityFeedProps) {
  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'threat':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getTypeColors = (type: ActivityItem['type']) => {
    switch (type) {
      case 'threat':
        return 'border-red-500/30 bg-red-900/20';
      case 'success':
        return 'border-green-500/30 bg-green-900/20';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-900/20';
      case 'error':
        return 'border-red-500/30 bg-red-900/20';
      default:
        return 'border-blue-500/30 bg-blue-900/20';
    }
  };

  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-900/50 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-900/50 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {activities.slice(0, maxItems).map((activity) => (
        <div
          key={activity.id}
          className={`border rounded-xl p-4 hover:bg-gray-700/30 transition-all duration-200 ${getTypeColors(activity.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getTypeIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-white font-medium text-sm truncate">
                  {activity.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-2">
                {activity.message}
              </p>
              
              {activity.metadata && (
                <div className="flex items-center space-x-3 text-xs">
                  {activity.metadata.address && (
                    <span className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-md font-mono">
                      {activity.metadata.address}
                    </span>
                  )}
                  
                  {activity.metadata.risk && (
                    <span className={`px-2 py-1 rounded-md border text-xs font-medium ${getRiskBadgeColor(activity.metadata.risk)}`}>
                      {activity.metadata.risk.toUpperCase()} RISK
                    </span>
                  )}
                  
                  {activity.metadata.source && (
                    <span className="text-gray-400">
                      Source: {activity.metadata.source}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {activities.length > maxItems && (
        <div className="text-center">
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            View {activities.length - maxItems} more activities
          </button>
        </div>
      )}
    </div>
  );
}
