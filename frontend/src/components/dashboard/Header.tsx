"use client";

import { Bell, Search, Zap, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { AxiosInstance } from "axios";
import api from "@/utils/axios";

interface BasicUser { _id?: string; fullName?: { firstName?: string; lastName?: string }; role?: string; profilePic?: string }
interface HeaderProps { user: BasicUser | null }

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState<Array<{id:string; address:string; coin:string; risk:number; source?:string; ts:number}>>([]);
  const [open, setOpen] = useState(false);
  const sseRef = useRef<EventSource | null>(null);
  const backendBase = useMemo(()=> {
    // Use axios baseURL if set, else fallback to same-origin
    const u = (api as unknown as AxiosInstance).defaults?.baseURL as string | undefined;
    if (u) return u.replace(/\/$/, '');
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  }, []);

  useEffect(() => {
    if (!backendBase) return;
  const url = `${backendBase}/api/stream/notifications`;
  const es = new EventSource(url, { withCredentials: true });
    sseRef.current = es;
    const onDetection = (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data);
        setAlerts(prev => [payload, ...prev].slice(0, 20));
      } catch { /* ignore */ }
    };
    es.addEventListener('detection', onDetection);
    // clean up
    return () => { es.close(); sseRef.current = null; };
  }, [backendBase]);
  
  return (
    <header className="flex items-center justify-between mb-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.fullName?.firstName || "Agent"}
          </h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Center Section - Quick Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search crypto addresses, entities, or cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
          {searchQuery && (
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg text-sm transition-colors">
              Search
            </button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* System Status */}
        <div className="flex items-center space-x-2 bg-green-900/30 text-green-400 px-3 py-2 rounded-xl">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium hidden md:block">All Systems Operational</span>
        </div>

        {/* Quick Stats */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="text-center">
            <div className="text-xl font-bold text-cyan-400">2.8K</div>
            <div className="text-xs text-gray-400">Flagged</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">23</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">76</div>
            <div className="text-xs text-gray-400">Risk Score</div>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={()=>setOpen(o=>!o)} className="relative p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors group">
            <Bell className="h-5 w-5 text-gray-400 group-hover:text-white" />
            {alerts.length > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-semibold">{Math.min(alerts.length,99)}</span>
              </div>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-gray-900 border border-gray-700/60 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-300">Live Detections</span>
                <button className="text-xs text-cyan-400 hover:underline" onClick={()=>setAlerts([])}>Clear</button>
              </div>
              <ul className="max-h-96 overflow-y-auto">
                {alerts.length === 0 && <li className="p-4 text-sm text-gray-500">No new alerts</li>}
                {alerts.map(a => (
                  <li key={a.id} className="px-4 py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">{new Date(a.ts).toLocaleTimeString()} • {a.source || 'crawler'}</div>
                      <div className={`text-xs font-semibold ${a.risk>=80?'text-red-400':a.risk>=50?'text-yellow-400':'text-green-400'}`}>risk {a.risk}</div>
                    </div>
                    <div className="text-sm font-mono truncate text-cyan-300">{a.address}</div>
                    <div className="text-xs text-gray-400">{a.coin}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-3 bg-gray-800/50 rounded-xl px-3 py-2 hover:bg-gray-700/50 transition-colors cursor-pointer group">
          <Image
            src={user?.profilePic || `https://avatar.vercel.sh/${user?._id}.png`}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full border-2 border-gray-600"
          />
          <div className="hidden md:block">
            <div className="text-white text-sm font-medium">
              {user?.fullName?.firstName} {user?.fullName?.lastName}
            </div>
            <div className="text-gray-400 text-xs">
              {user?.role || "Intelligence Analyst"}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
        </div>

        {/* Emergency Alert Button */}
        <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-red-500/25">
          <Zap className="h-4 w-4" />
          <span className="hidden md:block">Emergency</span>
        </button>
      </div>
    </header>
  );
}
