"use client";

import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import {
  Rocket,
  Search as SearchIcon,
  Brain,
  Network as NetworkIcon,
  AlertTriangle,
} from "lucide-react";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import HighThreatsDashboard from "@/components/dashboard/HighThreatsDashboard";

// Intersection Observer hook to reveal on scroll
function useOnScreen<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible } as const;
}

// Animated wrapper using Tailwind transitions
function Animated({
  children,
  threshold = 0.15,
  className = "",
}: {
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}) {
  const { ref, isVisible } = useOnScreen<HTMLDivElement>({ threshold });
  return (
    <div
      ref={ref}
      className={
        `${className} transform transition-all duration-700 ease-out ` +
        (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")
      }
    >
      {children}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 text-center">
      <div className="max-w-5xl mx-auto">
        <Animated>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
            Proactive Threat Detection for the Crypto Age
          </h1>
        </Animated>
        <Animated threshold={0.3}>
          <p className="mt-6 text-lg md:text-xl text-gray-300">
            Our AI-powered engine autonomously scans the surface, deep, and dark web to identify,
            categorize, and score illicit cryptocurrency activity before it escalates.
          </p>
        </Animated>
        <Animated threshold={0.5}>
          <div className="mt-10">
            <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20">
              Get Actionable Intelligence
            </button>
          </div>
        </Animated>
      </div>
    </section>
  );
}

function DetectionProcessSection() {
  const steps = [
    {
      icon: <SearchIcon className="w-8 h-8 text-cyan-400" />,
      title: "1. Autonomous Collection",
      description:
        "Our crawlers continuously scrape forums, darknet markets, and paste sites 24/7 to gather raw intelligence on suspect addresses.",
    },
    {
      icon: <Brain className="w-8 h-8 text-cyan-400" />,
      title: "2. AI Context Extraction",
      description:
        'An NLP model analyzes text surrounding addresses to extract PII, keywords (e.g., "ransom," "drugs"), and entity details with a confidence score.',
    },
    {
      icon: <NetworkIcon className="w-8 h-8 text-cyan-400" />,
      title: "3. Threat Categorization",
      description:
        "Addresses are automatically classified into high-risk categories like Terror Financing, Money Laundering, Scams, and Ransomware.",
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-cyan-400" />,
      title: "4. Risk Scoring & Alerts",
      description:
        "Each entity receives a dynamic Risk Index (0-100). High-risk activities trigger instant alerts to your team via email or Telegram.",
    },
  ];
  return (
    <section className="py-16 md:py-20 bg-[#161b22]/80 border-y border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
        <Animated>
          <h2 className="text-3xl font-bold text-white mb-2">Our Four-Pillar Detection Process</h2>
          <p className="text-gray-400 mb-12">
            From raw data to courtroom-ready evidence, our system provides end-to-end clarity.
          </p>
        </Animated>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <Animated key={idx} threshold={0.15 + idx * 0.1}>
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl h-full">
                <div className="mx-auto bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mb-4 border border-cyan-500/40">
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.description}</p>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdvancedTechSection() {
  const features = [
    {
      title: "Knowledge Graph Correlation",
      description:
        "Our Neo4j-powered graph database visually maps hidden relationships between wallets, darknet user IDs, emails, and other entities. Instantly uncover complex laundering networks.",
    },
    {
      title: "On-Chain Blockchain Intelligence",
      description:
        "We enrich data with real-time on-chain analysis. Detect mixer/tumbler usage, transaction anomalies, and fund flows from sanctioned addresses to add powerful context.",
    },
    {
      title: "AI Investigative Co-Pilot",
      description:
        'Use natural language to query our database. Simply ask: "Show ETH addresses linked to +91 numbers in scams" and get instant results.',
    },
  ];
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Animated>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Unmasking Criminal Networks with Advanced Tech</h2>
            <p className="mt-3 text-gray-400">Go beyond simple address lists. We connect the dots.</p>
          </div>
        </Animated>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <Animated key={idx} threshold={0.2 + idx * 0.1}>
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl h-full">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4">
                  {f.title}
                </h3>
                <p className="text-gray-300">{f.description}</p>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThreatCategoriesSection({ data }: { data: { name: string; value: number }[] }) {
  const categories = data;
  return (
    <section className="py-16 md:py-20 bg-[#161b22]/80 border-y border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Animated>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Threat Categories We Uncover</h2>
            <p className="mt-3 text-gray-400">
              Our system is trained to identify and flag a wide spectrum of illicit activities.
            </p>
          </div>
        </Animated>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 text-center">
          {categories.map((cat, idx) => (
            <Animated key={idx} threshold={0.1 + idx * 0.05}>
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 p-6 rounded-lg hover:bg-cyan-500/10 transition-colors duration-300">
                <div className="text-4xl mb-2">🔥</div>
                <h4 className="font-bold text-white">{cat.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{cat.value} signals</p>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <Animated>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to Fortify Your Defenses?</h2>
          <p className="mt-5 text-lg text-gray-300">
            Schedule a personalized demo and see how CryptoIntelX can provide the clarity and foresight your
            organization needs to combat crypto-crime.
          </p>
          <div className="mt-8">
            <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20">
              Request a Live Demo
            </button>
          </div>
        </div>
      </Animated>
    </section>
  );
}

type Overview = {
  totalAddresses: number;
  highRiskCount: number;
  last24hExtractions: number;
  activeCategories: number;
};


type BasicUser = { _id?: string; fullName?: { firstName?: string; lastName?: string }; profilePic?: string; role?: string } | null;

function ThreatDetectionContent({ user }: { user: BasicUser }) {
  const { collapsed } = useSidebar();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [categories, setCategories] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("authToken");
    const auth = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      api.get("/api/threat/overview", { headers: auth }),
      api.get("/api/threat/categories", { headers: auth }),
  api.get("/api/threat/trend?days=42", { headers: auth }),
  // HighThreatsDashboard fetches its own recent data
    ])
  .then(([o, c, ]) => {
        if (cancelled) return;
        setOverview(o.data?.data);
        setCategories(c.data?.data || []);
        // trend data fetched (t) can be used for charts in future
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <main
        className={`${collapsed ? "ml-16" : "ml-64"} transition-all duration-300 p-6 lg:p-8 min-h-screen overflow-x-hidden`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Threat Detection</h1>
              <p className="text-sm text-gray-400">Proactive monitoring across surface, deep, and dark web</p>
            </div>
          </div>
        </div>

        <Header user={user} />

        {/* KPI Strip */}
        {!loading && overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
              <p className="text-gray-400 text-sm">Total Addresses</p>
              <p className="text-2xl font-bold">{overview.totalAddresses.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
              <p className="text-gray-400 text-sm">High-Risk Addresses</p>
              <p className="text-2xl font-bold text-red-400">{overview.highRiskCount.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
              <p className="text-gray-400 text-sm">Extractions (24h)</p>
              <p className="text-2xl font-bold text-cyan-400">{overview.last24hExtractions.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
              <p className="text-gray-400 text-sm">Active Categories</p>
              <p className="text-2xl font-bold text-purple-400">{overview.activeCategories.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Marketing/Explainer Sections */}
        <HeroSection />
        <DetectionProcessSection />
        <AdvancedTechSection />

        {/* Category Breakdown (live) */}
        <ThreatCategoriesSection data={categories} />

        {/* High Threats DataTable (live) */}
        <section className="py-10">
          <HighThreatsDashboard />
        </section>

        <CtaSection />
      </main>
    </div>
  );
}

export default function ThreatDetectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<BasicUser>(null);
  const [loading, setLoading] = useState(true);

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
      <ThreatDetectionContent user={user} />
    </SidebarProvider>
  );
}
