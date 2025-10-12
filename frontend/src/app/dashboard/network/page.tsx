"use client";
import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import NetworkAnalysis from '@/components/dashboard/NetworkAnalysis';

function NetworkContent() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main className={`${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 p-6 lg:p-8 min-h-screen overflow-auto`}>
        <h2 className="text-2xl font-bold mb-4">Network Analysis</h2>
        <p className="text-gray-300 mb-6">Explore transaction graphs and related entities for a given address.</p>

        <NetworkAnalysis />
      </main>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <SidebarProvider>
      <NetworkContent />
    </SidebarProvider>
  );
}
