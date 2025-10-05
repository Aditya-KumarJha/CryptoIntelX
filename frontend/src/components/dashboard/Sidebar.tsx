"use client";

import {
  LayoutDashboard,
  Search,
  Network,
  Shield,
  Brain,
  AlertTriangle,
  BarChart3,
  Database,
  Globe,
  Target,
  Settings,
  LogOut,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Radar,
  Eye,
  Zap
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const router = useRouter();
  const pathname = usePathname(); 

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const getSelectedKey = () => {
    if (!pathname) return "dashboard"; 
    if (pathname.startsWith("/dashboard/search")) return "search";
    if (pathname.startsWith("/dashboard/network")) return "network";
    if (pathname.startsWith("/dashboard/threat")) return "threat";
    if (pathname.startsWith("/dashboard/ai")) return "ai";
    if (pathname.startsWith("/dashboard/alerts")) return "alerts";
    if (pathname.startsWith("/dashboard/analytics")) return "analytics";
    if (pathname.startsWith("/dashboard/database")) return "database";
    if (pathname.startsWith("/dashboard/darkweb")) return "darkweb";
    if (pathname.startsWith("/dashboard/investigations")) return "investigations";
    if (pathname.startsWith("/dashboard/profile")) return "profile";
    if (pathname.startsWith("/dashboard/settings")) return "settings";
    return "dashboard"; 
  };

  const menuItems = [
    { key: "dashboard", icon: LayoutDashboard, label: "Intelligence Hub", path: "/dashboard" },
    { key: "search", icon: Search, label: "Address Search", path: "/dashboard/search" },
    { key: "network", icon: Network, label: "Network Analysis", path: "/dashboard/network" },
    { key: "threat", icon: Shield, label: "Threat Detection", path: "/dashboard/threat" },
    { key: "ai", icon: Brain, label: "AI Co-Pilot", path: "/dashboard/ai" },
    { key: "alerts", icon: AlertTriangle, label: "Alert Center", path: "/dashboard/alerts" },
    { key: "analytics", icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { key: "database", icon: Database, label: "Intelligence DB", path: "/dashboard/database" },
    { key: "darkweb", icon: Globe, label: "Dark Web Monitor", path: "/dashboard/darkweb" },
    { key: "investigations", icon: Target, label: "Investigations", path: "/dashboard/investigations" },
  ];

  const bottomMenuItems = [
    { key: "profile", icon: UserRound, label: "Profile", path: "/dashboard/profile" },
    { key: "settings", icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 shadow-2xl shadow-black/20 flex flex-col h-screen fixed left-0 top-0 z-50`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
        <div className={`flex items-center space-x-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Radar className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">CryptoIntelX</h1>
              <p className="text-gray-400 text-xs">Intelligence Platform</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {collapsed ? 
            <ChevronRight className="h-4 w-4 text-gray-400" /> : 
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = getSelectedKey() === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`} />
              {!collapsed && (
                <span className={`font-medium ${isActive ? 'text-cyan-400' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
        
        {/* Divider */}
        <div className="my-4 border-t border-gray-700/50"></div>
        
        {/* Status Indicator */}
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="bg-gray-800/50 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">System Online</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monitoring</span>
                  <span className="text-white">Active</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Threats</span>
                  <span className="text-red-400">12 New</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-gray-700/50 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = getSelectedKey() === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400' 
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`} />
              {!collapsed && (
                <span className={`font-medium ${isActive ? 'text-cyan-400' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

