"use client";

import React, { Suspense } from "react";
import Spline from '@splinetool/react-spline';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden -mt-[22px] h-[85vh] min-h-[500px]">
      {/* Spline Background */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-black">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
        </div>
      }>
        <div className="relative w-full h-full">
            <Spline
              scene="https://prod.spline.design/iYdA6nHD833cFF7f/scene.splinecode" 
            />
            
          {/* Hide Spline watermark with a highly-stacked black overlay */}
          <div className="absolute bottom-0 right-0 w-42 h-18 bg-black"></div>
        </div>
      </Suspense>
    </section>
  );
}
