"use client";
import React, { useState } from "react";
import HoverExpand from "./ui/hover-expand";

export const stories = [
  {
    id: 1,
    name: "Cyber Crime Analyst",
    role: "Law Enforcement Officer",
    quote:
      "CryptoIntelX lets me trace suspect wallets across darknet forums and social platforms without building complex tools from scratch.",
    image: "/card/card-1.png",
  },
  {
    id: 2,
    name: "Blockchain Investigator",
    role: "Financial Crime Specialist",
    quote:
      "The platform’s AI automatically links suspicious addresses to potential laundering schemes, saving hours of manual work.",
    image: "/card/card-2.png",
  },
  {
    id: 3,
    name: "Regulatory Officer",
    role: "Compliance Auditor",
    quote:
      "CryptoIntelX provides actionable intelligence on crypto-enabled crimes, helping us enforce regulations more effectively.",
    image: "/card/card-3.png",
  },
  {
    id: 4,
    name: "Threat Intelligence Analyst",
    role: "Cybersecurity Expert",
    quote:
      "With real-time wallet monitoring and alerts, I can quickly identify high-risk addresses linked to scams or ransomware.",
    image: "/card/card-4.png",
  },
  {
    id: 5,
    name: "Data Scientist",
    role: "AI Researcher",
    quote:
      "Integrating NLP and blockchain analysis in CryptoIntelX makes it easy to uncover patterns in suspicious transactions.",
    image: "/card/card-5.png",
  },
  {
    id: 6,
    name: "Security Consultant",
    role: "Crypto Forensics Expert",
    quote:
      "Secure storage and verification of wallet data gives me confidence when performing forensic investigations.",
    image: "/card/card-6.png",
  },
  {
    id: 7,
    name: "Investigator",
    role: "Darknet Analyst",
    quote:
      "The knowledge graph helps me visualize networks of suspicious wallets and identify hidden connections effortlessly.",
    image: "/card/card-7.png",
  },
  {
    id: 8,
    name: "Law Enforcement Trainer",
    role: "Cybercrime Educator",
    quote:
      "CryptoIntelX is perfect for training new officers — they can practice tracing illicit wallets and analyzing risk patterns safely.",
    image: "/card/card-8.png",
  },
];

export default function SuccessStories() {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  return (
    <section className="relative p-16">
      <div className="container sm:mx-4 md:mx-auto md:px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Real Stories from Crypto Crime Fighters
        </h2>
        <p className="text-muted-foreground mb-4">
          Discover how analysts, investigators, and cybersecurity experts leverage CryptoIntelX to track illicit wallets, uncover hidden networks, and fight crypto-enabled crimes effectively.
        </p>

        <HoverExpand
          images={stories.map((s) => s.image)}
          maxThumbnails={stories.length}
          thumbnailHeight={220}
          modalImageSize={420}
          onHover={(index) => setHoveredIndex(index)}
        />

        <div className="mt-6 max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground italic mb-4">
            “{stories[hoveredIndex].quote}”
          </p>
          <h3 className="text-foreground font-semibold">
            {stories[hoveredIndex].name}
          </h3>
          <span className="text-sm text-muted-foreground">
            {stories[hoveredIndex].role}
          </span>
        </div>
      </div>
    </section>
  );
}
