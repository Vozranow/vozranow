'use client';
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-[#FDFCF8] px-6 pt-20 md:pt-22 pb-20">
      
      {/* --- Ambient Background Elements --- */}
      {/* A slow, breathing organic shape to calm the visual field */}
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] animate-pulse-slow rounded-full bg-[#E8E6E1]/40 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] animate-pulse-slower rounded-full bg-[#F0F4F4]/50 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* --- Left Content: The Invitation --- */}
        <div 
          className={`max-w-2xl transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Gentle Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F2F0EB] px-4 py-1.5 mb-8">
            <span className="h-2 w-2 rounded-full bg-[#8C877D] animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-[#5C5954] uppercase">
              Real human connection
            </span>
          </div>

          {/* Headline: Serif font for warmth and humanity */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-[#2D2A26] mb-6 tracking-tight">
            You don’t have to <br className="hidden md:block" />
            <span className="italic text-[#5C5954]">carry it all</span> alone.
          </h1>

          {/* Subtext: Clear, honest, reassuring */}
          <p className="text-lg md:text-xl text-[#5C5954] leading-relaxed mb-10 max-w-lg">
            Vozranow connects you with trained, empathetic listeners for private 1-on-1 sessions. 
            No judgment, no bots, and no pressure to "fix" yourself. 
            Just a safe space to be heard.
          </p>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-12">
            
            {/* Primary Button: Soft black, rounded, understated */}
            <button className="group relative overflow-hidden rounded-full bg-[#2D2A26] px-8 py-4 text-white transition-all hover:bg-[#403D39] hover:shadow-lg hover:shadow-[#2D2A26]/10 hover:-translate-y-0.5 active:translate-y-0">
              <span className="relative z-10 flex items-center gap-2 font-medium">
                Find a listener
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>

            {/* Secondary Link: Text only, underlined */}
            <a href="/how-it-works" className="group flex items-center gap-2 px-4 py-4 font-medium text-[#5C5954] transition-colors hover:text-[#2D2A26]">
              <span className="border-b border-transparent transition-all group-hover:border-[#2D2A26]">
                How it works
              </span>
            </a>
          </div>

          {/* Trust Signals: Minimal and quiet */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-8 border-t border-[#E8E6E1]">
            <div className="flex items-center gap-2 text-sm text-[#8C877D]">
              <ShieldCheck size={16} strokeWidth={1.5} />
              <span>100% Private & Confidential</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8C877D]">
              <Heart size={16} strokeWidth={1.5} />
              <span>You control the pace</span>
            </div>
          </div>
        </div>

        {/* --- Right Content: Abstract Visual --- */}
        {/* Instead of a photo, we use an abstract, soothing visualization of "listening" */}
        <div 
          className={`relative hidden lg:block h-[600px] w-full transition-all duration-1000 delay-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Abstract Composition */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Main "Safe Space" Circle */}
            <div className="relative h-[450px] w-[450px] overflow-hidden rounded-full bg-[#F5F4F0]">
               {/* Inner "Breath" */}
               <div className="absolute inset-0 animate-pulse-slower bg-gradient-to-tr from-[#EBE9E4] to-transparent opacity-60" />
               
               {/* Floating elements representing thoughts/feelings settling down */}
               <div className="absolute top-[20%] left-[30%] h-16 w-16 rounded-full bg-[#E0DED7] opacity-40 blur-xl animate-float" />
               <div className="absolute bottom-[30%] right-[20%] h-24 w-24 rounded-full bg-[#D6D2C4] opacity-30 blur-2xl animate-float-delayed" />
               
               {/* The "Listener" connection line - subtle */}
               <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 50 Q 50 40 100 50" stroke="#8C877D" strokeWidth="0.5" fill="none" className="animate-pulse-slow" />
               </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Tailwind Custom Animations (Add these to your global CSS or Tailwind Config) */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
        @keyframes pulse-slower {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-pulse-slower {
          animation: pulse-slower 12s infinite ease-in-out;
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        .animate-float-delayed {
          animation: float-delayed 8s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
}

