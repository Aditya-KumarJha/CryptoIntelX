"use client";

import React, { useEffect, useState } from "react";
import { FaFileCsv, FaFileCode, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import api from "@/utils/axios";

type ThreatRow = {
  address: string;
  coin: string;
  category?: string;
  source?: string;
  lastSeen?: string;
  risk: number;
};

export default function HighThreatsDashboard() {
  const [threats, setThreats] = useState<ThreatRow[]>([]);
  const [filtered, setFiltered] = useState<ThreatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);
    api
      .get("/api/threat/recent?limit=100", { headers })
      .then((res) => {
        if (cancelled) return;
        const data = (res.data?.data || []) as ThreatRow[];
        const sorted = [...data].sort((a, b) => (b.risk || 0) - (a.risk || 0));
        setThreats(sorted);
        setFiltered(sorted);
      })
      .catch(() => !cancelled && setError("Failed to fetch threat data."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const f = threats.filter((t) =>
      t.address?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.coin?.toLowerCase().includes(q) ||
      t.source?.toLowerCase().includes(q)
    );
    setFiltered(f);
  }, [search, threats]);

  const exportCSV = () => {
    const headers = [
      "Address",
      "Coin",
      "Category",
      "Source",
      "Last Seen",
      "Risk",
    ];
    const rows = filtered.map((t) => [
      t.address,
      t.coin,
      t.category || "",
      t.source || "",
      t.lastSeen ? new Date(t.lastSeen).toISOString() : "",
      String(t.risk ?? ""),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "high_threats.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "high_threats.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FaExclamationTriangle className="text-red-400" />
          <h3 className="text-xl font-semibold">High-Level Threats</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={exportCSV} className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm flex items-center space-x-2">
            <FaFileCsv />
            <span>Export CSV</span>
          </button>
          <button onClick={exportJSON} className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm flex items-center space-x-2">
            <FaFileCode />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by address, category, source..."
          className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600"
        />
      </div>

      {/* Content */}
      {loading && (
        <div className="py-8 text-center text-gray-400">Loading Threat Intelligence Data...</div>
      )}
      {error && !loading && (
        <div className="py-8 text-center text-red-400">{error}</div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/80 border-b border-gray-800 text-gray-300">
                <th className="p-3">Risk</th>
                <th className="p-3">Category</th>
                <th className="p-3">Address</th>
                <th className="p-3">Coin</th>
                <th className="p-3">Source</th>
                <th className="p-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="p-3 font-bold text-red-400">{Math.round(t.risk || 0)}</td>
                  <td className="p-3">{t.category || '-'}</td>
                  <td className="p-3 font-mono text-sm truncate" style={{ maxWidth: 320 }}>{t.address}</td>
                  <td className="p-3">{t.coin?.toUpperCase?.() || t.coin}</td>
                  <td className="p-3 text-gray-400">{t.source || '-'}</td>
                  <td className="p-3 text-gray-400">{t.lastSeen ? new Date(t.lastSeen).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">No matching threats found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
