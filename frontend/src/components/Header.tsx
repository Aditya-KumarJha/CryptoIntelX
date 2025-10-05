"use client";

import React from "react";
import WrapButton from "./ui/wrap-button";

export default function Header() {
  return (
    <header className="p-2 fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-sm transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        <a 
          href="/" 
          className="text-3xl font-extrabold tracking-wider cursor-pointer transition-colors 
            bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 
            text-transparent bg-clip-text 
            hover:opacity-80
          "
        >
          CryptoIntelX
        </a>
        
        {/* The nav container remains simple */}
        <nav className="flex items-center">
          <WrapButton href="/signup" className="">
            Get Started
          </WrapButton>
        </nav>
        
      </div>
    </header>
  );
}
