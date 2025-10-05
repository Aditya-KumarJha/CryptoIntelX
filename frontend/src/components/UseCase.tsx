"use client";

import React from "react";
import MinimalCard, {
  MinimalCardDescription,
  MinimalCardImage,
  MinimalCardTitle,
} from "../components/ui/minimal-card";
import BadgeButton from "../components/ui/badge-button";
import { motion } from "framer-motion";

const UseCase = () => {
  const cards = [
    {
      title: "Threat Analyst",
      description:
        "CryptoIntelX continuously monitors dark web markets and blockchain networks, surfacing suspicious wallet activity and scam patterns in real-time.",
      src: "/giphy/giphy-1.gif",
      alt: "Threat Analyst Monitoring CryptoIntelX Dashboard",
    },
    {
      title: "Law Enforcement Agency",
      description:
        "Leverage CryptoIntelX to trace illicit crypto transactions, map connections between wallets, and generate actionable investigation reports instantly.",
      src: "/giphy/giphy-2.gif",
      alt: "Law Enforcement Tracking Crypto Crime",
    },
    {
      title: "Crypto Exchange / Security Team",
      description:
        "Our platform helps exchanges flag high-risk wallet addresses, detect fraud attempts, and automate compliance reporting with AI-powered insights.",
      src: "/giphy/giphy-3.gif",
      alt: "Security Analyst Reviewing Risk Alerts",
    },
  ];

  return (
    <section className="py-16">
      <div className="sm:w-[90%] md:w-[100%] lg:w-[75%] rounded-3xl shadow mx-auto">
        <div className="p-8 shadow rounded-3xl mx-auto bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
          <BadgeButton>Use Cases</BadgeButton>

          <h2 className="text-4xl font-bold text-white text-center mt-4 mb-10">
            How <span className="text-cyan-400">CryptoIntelX</span> Powers Investigation
          </h2>

          <div className="flex flex-col md:flex-row justify-center items-start gap-8 mt-6">
            {cards.map((card, key) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-full md:w-1/3"
              >
                <MinimalCard className="bg-zinc-800/80 backdrop-blur-md border border-zinc-700 hover:border-cyan-500 transition-all duration-300 rounded-2xl text-white shadow-lg">
                  <MinimalCardImage
                    className="h-[180px] w-full object-cover rounded-t-2xl"
                    src={card.src}
                    alt={card.alt}
                  />
                  <MinimalCardTitle className="text-cyan-400 mt-3">
                    {card.title}
                  </MinimalCardTitle>
                  <MinimalCardDescription className="text-zinc-300">
                    {card.description}
                  </MinimalCardDescription>
                </MinimalCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCase;
