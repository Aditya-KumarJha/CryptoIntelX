"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import Spline from '@splinetool/react-spline';

const CRYPTOINTELX_SPLINE_URL = "https://prod.spline.design/iYdA6nHD833cFF7f/scene.splinecode"; 
const GENKUB_SPLINE_URL = "https://prod.spline.design/Gq9iUNlWC2y8Aq1H/scene.splinecode";

export default function HeroSection() {
  const [isClient, setIsClient] = useState(false);
  const [isRobotVisible, setIsRobotVisible] = useState(true); 
  const robotRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (robotRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            setIsRobotVisible(entry.isIntersecting);
          });
        },
        { threshold: 0.1, rootMargin: '100px 0px 100px 0px' } 
      );

      observer.observe(robotRef.current);
      
      return () => {
        if (robotRef.current) {
          observer.unobserve(robotRef.current);
        }
      };
    }
  }, [isClient]);

  const fallbackContent = (
    <div className="flex items-center justify-center h-full w-full bg-black">
      <div className="text-xl text-cyan-500">Initializing 3D Experience...</div>
    </div>
  );

  return (
    <section className="relative overflow-hidden -mt-[22px] h-[85vh] min-h-[500px] bg-black">
      
      <Suspense fallback={fallbackContent}>
        
        {isClient && (
            <>
                <div className="absolute inset-0 w-full h-full z-10">
                    <Spline scene={CRYPTOINTELX_SPLINE_URL} />
                </div>

                <div 
                  ref={robotRef}
                  className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 z-20"
                >
                    {isRobotVisible && (
                      <>
                        <Spline scene={GENKUB_SPLINE_URL} />
                        <div className="absolute bottom-0 right-0 w-39.5 h-14 bg-black z-30"></div>
                      </>
                    )}
                </div>
            </>
        )}
        
        <div className="absolute bottom-0 right-0 w-40 h-16 bg-black z-30"></div>
        
      </Suspense>
      
    </section>
  );
}
