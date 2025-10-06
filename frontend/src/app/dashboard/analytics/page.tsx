"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import api from "@/utils/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FiCalendar,
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiAlertTriangle,
  FiList,
} from "react-icons/fi";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease";
};

// --- MOCK DATA (Replace with your API data) ---
const trendData = [
  { name: "Week 1", detections: 40 },
  { name: "Week 2", detections: 30 },
  { name: "Week 3", detections: 45 },
  { name: "Week 4", detections: 60 },
  { name: "Week 5", detections: 50 },
  { name: "Week 6", detections: 75 },
  { name: "Week 7", detections: 90 },
];

const categoryData = [
  { name: "Darknet Market", value: 400 },
  { name: "Scam/Phishing", value: 300 },
  { name: "Ransomware", value: 300 },
  { name: "Terror Financing", value: 200 },
  { name: "Money Laundering", value: 150 },
];
const COLORS = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#3b82f6"];

type AddressRow = {
  id: number;
  address: string;
  type: string;
  category: string;
  risk: number;
  pii: string;
  lastScan: string;
  source: string;
};

const addressData: AddressRow[] = [
  { id: 1, address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", type: "BTC", category: "Darknet Market", risk: 95, pii: "Yes", lastScan: "2025-10-06", source: "AlphaBay Forum" },
  { id: 2, address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", type: "ETH", category: "Scam/Phishing", risk: 82, pii: "Yes", lastScan: "2025-10-05", source: "Telegram Group" },
  { id: 3, address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", type: "BTC", category: "Ransomware", risk: 98, pii: "No", lastScan: "2025-10-05", source: "Conti Leak Files" },
  { id: 4, address: "44tLjmXrQxT23VSfAD9GGwEpb7k2t4vD42iY1jF5dG8c", type: "XMR", category: "Money Laundering", risk: 75, pii: "No", lastScan: "2025-10-04", source: "News Portal" },
  { id: 5, address: "ltc1qtkvj3w5k2gfl8yv9z8qjw9w9y8z7y5z3c8a4n7", type: "LTC", category: "Terror Financing", risk: 91, pii: "Yes", lastScan: "2025-10-03", source: "Deep Web Intel" },
];

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType }) => {
  const changeColor = changeType === "increase" ? "text-green-500" : "text-red-500";
  return (
    <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {change && <p className={`text-xs ${changeColor}`}>{change}</p>}
      </div>
      <div className="text-3xl text-purple-400">{icon}</div>
    </div>
  );
};

function AnalyticsShell({ user }: { user: any }) {
  const { collapsed } = useSidebar();
  const [timeframe, setTimeframe] = useState("30d");

  const download = (filename: string, content: string, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: "CSV" | "JSON") => {
    if (format === "JSON") {
      download("address-report.json", JSON.stringify(addressData, null, 2), "application/json");
    } else {
      const headers = ["id", "address", "type", "category", "risk", "pii", "lastScan", "source"]; 
      const csvRows = [headers.join(",")].concat(
        addressData.map((r) => headers.map((h) => `${String((r as any)[h]).replaceAll('"', '""')}`).join(","))
      );
      download("address-report.csv", csvRows.join("\n"), "text/csv");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main className={`${collapsed ? "ml-16" : "ml-64"} transition-all duration-300 p-6 lg:p-8 min-h-screen overflow-auto`}>
        <Header user={user} />

        <div className="p-0 text-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <div className="flex items-center space-x-4 bg-[#1f2937] p-2 rounded-lg">
              <FiCalendar className="text-purple-400" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Addresses Analyzed" value="34,890" icon={<FiList />} change="+5.2% vs last month" changeType="increase" />
            <StatCard title="New High-Risk Addresses" value="1,204" icon={<FiAlertTriangle />} change="+12.8% vs last month" changeType="increase" />
            <StatCard title="Most Active Category" value="Scam/Phishing" icon={<FiPieChart />} />
            <StatCard title="Total Networks Mapped" value="452" icon={<FiBarChart2 />} change="-1.5% vs last month" changeType="decrease" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Trend Chart */}
            <div className="lg:col-span-3 bg-[#1f2937] p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Suspicious Detections Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "none" }} />
                  <Legend />
                  <Line type="monotone" dataKey="detections" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Chart */}
            <div className="lg:col-span-2 bg-[#1f2937] p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Risk Category Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "none" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Detailed Address Report</h2>
              <div className="flex space-x-3">
                <button onClick={() => handleExport("CSV")} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition duration-300">
                  <FiDownload />
                  <span>Export CSV</span>
                </button>
                <button onClick={() => handleExport("JSON")} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition duration-300">
                  <FiDownload />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="p-3">Address</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">PII</th>
                    <th className="p-3">Last Scan</th>
                    <th className="p-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {addressData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700 hover:bg-[#2d3748] transition duration-200">
                      <td className="p-3 font-mono text-sm truncate" style={{ maxWidth: "200px" }}>{item.address}</td>
                      <td className="p-3">{item.type}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.category === "Darknet Market" ? "bg-red-900 text-red-300" : "bg-yellow-900 text-yellow-300"}`}>{item.category}</span></td>
                      <td className="p-3 font-bold text-red-400">{item.risk}/100</td>
                      <td className="p-3">{item.pii}</td>
                      <td className="p-3">{item.lastScan}</td>
                      <td className="p-3 text-gray-400">{item.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return router.replace("/login");

    api
      .get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("authToken");
        router.replace("/login?error=session_expired");
      })
      .finally(() => setLoading(false));
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
    <SidebarProvider>
      <AnalyticsShell user={user} />
    </SidebarProvider>
  );
}

