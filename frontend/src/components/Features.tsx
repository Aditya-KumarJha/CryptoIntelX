"use client";
import { motion } from "framer-motion";
import { BrainCircuit, GlobeLock, Network, Radar, SearchCheck, ShieldAlert, DatabaseZap, Bot } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Radar className="text-cyan-400" />,
      title: "Autonomous Crypto Intelligence",
      desc: "Continuous AI-driven collection from surface, deep, and dark web sources to uncover hidden crypto footprints."
    },
    {
      icon: <SearchCheck className="text-emerald-400" />,
      title: "Address Verification & Categorization",
      desc: "Validate and classify wallets by type, behavior, and on-chain activity — complete with confidence scoring."
    },
    {
      icon: <Network className="text-violet-400" />,
      title: "Entity Correlation Graphs",
      desc: "Visualize interconnected wallets, forums, and users through interactive Neo4j-powered network maps."
    },
    {
      icon: <BrainCircuit className="text-amber-400" />,
      title: "AI Investigator Co-Pilot",
      desc: "Query intelligence data in natural language — powered by fine-tuned LLMs for crypto crime investigation."
    },
    {
      icon: <GlobeLock className="text-indigo-400" />,
      title: "Blockchain Analytics",
      desc: "Track fund flows, detect mixers, and identify laundering patterns through smart on-chain graph analysis."
    },
    {
      icon: <DatabaseZap className="text-pink-400" />,
      title: "Secure Intelligence Warehouse",
      desc: "PostgreSQL, Elasticsearch, and Neo4j backend with AES-256 encryption and real-time Kafka pipelines."
    },
    {
      icon: <Bot className="text-teal-400" />,
      title: "Automated Alerts & Reports",
      desc: "Get instant Telegram/email alerts for new high-risk wallets or weekly AI-generated crime summaries."
    },
    {
      icon: <ShieldAlert className="text-red-400" />,
      title: "Compliance & Audit Trail",
      desc: "Role-based access, differential privacy, and blockchain-anchored logs for tamper-proof investigations."
    },
  ];

  return (
    <section className="container mx-auto px-6 pt-2 pb-24">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-20 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
      >
        Core Intelligence Features
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, rotate: -1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
            className="relative overflow-hidden group flex flex-col gap-4 p-6 rounded-2xl border
                       bg-gradient-to-b from-zinc-900 to-zinc-800 border-zinc-700/60
                       hover:shadow-[0_0_20px_-5px_rgba(0,255,255,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div
              whileHover={{ rotate: 10, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-4xl"
            >
              {f.icon}
            </motion.div>
            <h3 className="text-xl font-semibold text-white">{f.title}</h3>
            <p className="text-gray-400 leading-relaxed">{f.desc}</p>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
