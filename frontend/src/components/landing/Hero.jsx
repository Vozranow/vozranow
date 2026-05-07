'use client';
import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heropg from "../../assets/hero-section.jpg";
export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden px-6 pt-20 md:pt-22 pb-20">

    
      <div className="absolute inset-0  bg-cover bg-center" style={{ backgroundImage: `url(${heropg})` }} />

      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        {/* LEFT */}
        <div
          className={`max-w-2xl flex flex-col items-start justify-start gap-6 transition-all duration-1000 mt-40 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white tracking-tight font-sans font-semibold">
            A safe space to simply be heard
          </h1>

          <p className="text-lg text-gray-200 leading-relaxed max-w-md">
            Sometimes, all you need is someone who listens. Vozranow connects you with empathetic individuals for supportive, one-on-one conversations in a completely judgment-free environment.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link to="/dashboard">
              <button className="group rounded-full bg-[#A3C6C0] px-8 py-4 text-[#0F2F2B] font-medium transition hover:bg-[#8FB7B1] hover:-translate-y-0.5">
                <span className="flex items-center gap-2">
                  Start your journey
                  <ArrowRight size={18} />
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* RIGHT VISUAL (optional) */}
      

      </div>
    </section>
  );
}