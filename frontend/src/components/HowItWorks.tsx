"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Radar, SearchCheck, Network, ShieldAlert } from "lucide-react";
// import Crypto3DScene from "@/components/3d/Crypto3DScene"; // optional future visual

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());

  const steps = [
    {
      step: "1",
      title: "Collect & Discover",
      desc: "Autonomous crawlers scan surface, deep, and dark web sources to uncover cryptocurrency wallet addresses and suspicious entities.",
      icon: <Radar className="text-cyan-400" />,
      visualType: "collect" as const,
    },
    {
      step: "2",
      title: "Extract & Verify",
      desc: "AI-powered extraction validates wallet formats, removes duplicates, and verifies existence through blockchain explorers.",
      icon: <SearchCheck className="text-emerald-400" />,
      visualType: "verify" as const,
    },
    {
      step: "3",
      title: "Correlate & Categorize",
      desc: "Entity linking and NLP models connect wallets to people, posts, and patterns — classifying threats like scams, laundering, and ransomware.",
      icon: <Network className="text-violet-400" />,
      visualType: "categorize" as const,
    },
    {
      step: "4",
      title: "Analyze & Alert",
      desc: "Neo4j-powered graphs reveal criminal clusters, while analysts receive real-time alerts and AI-generated intelligence reports.",
      icon: <ShieldAlert className="text-rose-400" />,
      visualType: "alert" as const,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="container mx-auto px-6 pb-24">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-20 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
      >
        How <span className="text-white">CryptoIntelX</span> Works
      </motion.h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-10"
      >
        {/* Neon connector line */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1.5px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 blur-[1px] opacity-40"></div>

        {steps.map((s, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            onViewportEnter={() => setVisibleSteps(prev => new Set([...prev, idx]))}
            onViewportLeave={() => {
              const next = new Set(visibleSteps);
              next.delete(idx);
              setVisibleSteps(next);
            }}
            className="group relative z-10 flex flex-col items-center text-center gap-4 p-8 rounded-2xl border-2
                       bg-gradient-to-b from-zinc-900 to-zinc-800 border-zinc-700/70 transition-all duration-300
                       hover:shadow-[0_0_25px_-5px_rgba(0,255,255,0.4)] hover:-translate-y-2 w-full"
          >
            {/* Step badge */}
            <div className="absolute -top-8 flex items-center justify-center text-xl font-bold text-white 
                            bg-gradient-to-br from-cyan-600 to-purple-600 border-4 border-zinc-900 rounded-full 
                            w-16 h-16 shadow-lg shadow-cyan-500/30">
              {s.step}
            </div>

            {/* Icon or 3D visual */}
            <div className="relative mt-10 mb-3">
              {/* If you have a 3D visualization, swap this section */}
              {/* <Crypto3DScene step={s.visualType} isVisible={visibleSteps.has(idx)} /> */}
              <motion.div
                whileHover={{ rotate: 10, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-4xl"
              >
                {s.icon}
              </motion.div>
            </div>

            <h3 className="text-xl font-semibold text-white">{s.title}</h3>
            <p className="text-gray-400 leading-relaxed">{s.desc}</p>

            {/* Hover glow bottom line */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
