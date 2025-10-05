"use client";

import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

interface IntelligenceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  gradient: string;
  borderColor: string;
  iconColor: string;
  children?: React.ReactNode;
}

export default function IntelligenceCard({ 
  icon, 
  title, 
  description, 
  value, 
  trend = 'neutral',
  trendValue,
  onClick,
  gradient,
  borderColor,
  iconColor,
  children
}: IntelligenceCardProps) {
  return (
    <div 
      className={`bg-gradient-to-br ${gradient} backdrop-blur-sm border ${borderColor} rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconColor}`}>
          {icon}
        </div>
        {trend !== 'neutral' && trendValue && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? 
              <TrendingUp className="h-4 w-4" /> : 
              <TrendingDown className="h-4 w-4" />
            }
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>

      {children && (
        <div className="mb-4">
          {children}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-gray-400 text-xs">
          Updated now
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}
