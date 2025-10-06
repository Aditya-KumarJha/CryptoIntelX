"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import api from "@/utils/axios";
import {
  FiSearch,
  FiLoader,
  FiCopy,
  FiUser,
  FiInfo,
} from "react-icons/fi";

type UserShape = {
  _id: string;
  fullName?: { firstName?: string; lastName?: string };
  email?: string | null;
  profilePic?: string;
  provider?: string;
};

type Transaction = {
  id: string;
  from: string;
  to: string;
  amountBTC: number;
  amountUSD: number;
  type: "In" | "Out";
  date: string;
};

type AddressDetails = {
  address: string;
  cryptoType: string;
  riskScore: number;
  tags: string[];
  entityInfo: {
    name: string | null;
    email: string | null;
    phone: string | null;
    bankDetails: string | null;
  };
  scanDetails: {
    firstSeen: string;
    lastScan: string;
    source: string;
    sourceCredibility: string;
  };
  transactions: Transaction[];
};

// Mock API function (replace with real API call)
async function getAddressDetails(address: string): Promise<AddressDetails | null> {
  // simulate delay
  await new Promise((r) => setTimeout(r, 1500));
  return {
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    cryptoType: "BTC",
    riskScore: 98,
    tags: ["Ransomware", "Conti Group", "High-Risk"],
    entityInfo: { name: "Unknown", email: "contact@conti.leaks", phone: null, bankDetails: "Not Found" },
    scanDetails: { firstSeen: "2023-01-15", lastScan: "2025-10-05", source: "Conti Leak Files", sourceCredibility: "High" },
    transactions: [
      { id: "a1b2..", from: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", to: "bc1qar...", amountBTC: 2.5, amountUSD: 75000, type: "In", date: "2025-10-01" },
      { id: "c3d4..", from: "bc1qar...", to: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", amountBTC: 1.0, amountUSD: 30000, type: "Out", date: "2025-09-28" },
      { id: "e5f6..", from: "1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX", to: "bc1qar...", amountBTC: 0.8, amountUSD: 24000, type: "In", date: "2025-09-25" },
      { id: "g7h8..", from: "bc1qar...", to: "3E5s3vAfS9a1yZ1YQ1a2R3b4c5d6e7f8g9", amountBTC: 2.2, amountUSD: 66000, type: "Out", date: "2025-09-22" },
    ],
  };
}

function RiskScoreIndicator({ score }: { score: number }) {
  const color = score > 90 ? "text-red-500 border-red-500" : score > 70 ? "text-orange-500 border-orange-500" : score > 50 ? "text-yellow-500 border-yellow-500" : "text-green-500 border-green-500";
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-full border-4 ${color}`} style={{ width: "120px", height: "120px" }}>
      <span className="text-4xl font-bold">{score}</span>
      <span className="text-sm">/ 100</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-700">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-white">{value ?? "N/A"}</span>
    </div>
  );
}

function SearchShell({ user }: { user: UserShape }) {
  const { collapsed } = useSidebar();
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<AddressDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    setSearchResult(null);
    setError(null);
    try {
      const data = await getAddressDetails(query);
      if (data) setSearchResult(data);
      else setError("Address not found in the database.");
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main className={`${collapsed ? "ml-16" : "ml-64"} transition-all duration-300 p-6 lg:p-8 min-h-screen overflow-auto`}>
        <Header user={user} />

        <div className="p-0 text-gray-200">
          <h1 className="text-3xl font-bold text-white mb-2">Address Search</h1>
          <p className="text-gray-400 mb-6">Enter a cryptocurrency address to retrieve detailed intelligence.</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-8">
            <div className="relative flex-grow">
              <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter BTC, ETH, XMR address..."
                className="w-full bg-[#1f2937] border border-gray-600 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300 disabled:bg-gray-500">
              {isLoading ? <FiLoader className="animate-spin" /> : "Search"}
            </button>
          </form>

          {/* Initial State */}
          {!isLoading && !searchResult && !error && (
            <div className="text-center py-16">
              <FiSearch className="mx-auto text-6xl text-gray-600 mb-4" />
              <h2 className="text-2xl text-gray-400">Begin Your Investigation</h2>
              <p className="text-gray-500">Results will be displayed here.</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <FiLoader className="mx-auto text-6xl text-gray-500 animate-spin mb-4" />
              <h2 className="text-2xl text-gray-400">Analyzing Address...</h2>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16 bg-red-900/20 border border-red-700 rounded-lg">
              <h2 className="text-2xl text-red-400">{error}</h2>
            </div>
          )}

          {/* Results State */}
          {searchResult && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Address ({searchResult.cryptoType})</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-mono text-white">{searchResult.address}</h2>
                    <FiCopy className="text-gray-400 hover:text-white cursor-pointer" onClick={() => navigator.clipboard.writeText(searchResult.address)} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {searchResult.tags.map((tag) => (
                      <span key={tag} className="bg-red-900 text-red-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-2 text-white">Global Risk Score</p>
                  <RiskScoreIndicator score={searchResult.riskScore} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Entity & Scan Details */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FiUser /> Entity Information
                    </h3>
                    <InfoRow label="Name" value={searchResult.entityInfo.name} />
                    <InfoRow label="Email" value={searchResult.entityInfo.email} />
                    <InfoRow label="Phone" value={searchResult.entityInfo.phone} />
                    <InfoRow label="Bank Details" value={searchResult.entityInfo.bankDetails} />
                  </div>
                  <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FiInfo /> Scan Details
                    </h3>
                    <InfoRow label="First Seen" value={searchResult.scanDetails.firstSeen} />
                    <InfoRow label="Last Scan" value={searchResult.scanDetails.lastScan} />
                    <InfoRow label="Source" value={searchResult.scanDetails.source} />
                    <InfoRow label="Credibility" value={searchResult.scanDetails.sourceCredibility} />
                  </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 bg-[#1f2937] p-6 rounded-lg shadow-lg">
                  <h3 className="font-bold text-lg mb-4">Transaction History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="p-2">Date</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Counterparty Address</th>
                          <th className="p-2 text-right">Amount (BTC)</th>
                          <th className="p-2 text-right">Amount (USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResult.transactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-gray-700 hover:bg-[#2d3748]">
                            <td className="p-2 text-gray-400">{tx.date}</td>
                            <td className="p-2">
                              <span className={`font-semibold ${tx.type === "In" ? "text-green-400" : "text-red-400"}`}>{tx.type}</span>
                            </td>
                            <td className="p-2 font-mono truncate" style={{ maxWidth: "150px" }}>{tx.type === "In" ? tx.from : tx.to}</td>
                            <td className="p-2 font-mono text-right">{tx.amountBTC.toFixed(4)}</td>
                            <td className="p-2 font-mono text-right">${tx.amountUSD.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AddressSearchPage() {
  const [user, setUser] = useState<UserShape | null>(null);
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
      <SearchShell user={user as UserShape} />
    </SidebarProvider>
  );
}
