'use client';
import React, { useState, useEffect } from 'react';

// --- Configuration ---
const STATS = [
  {
    id: 'sessions',
    label: 'Therapy sessions conducted',
    baseValue: 24532, 
    suffix: '',
    isLive: true, 
  },
  {
    id: 'members',
    label: 'Lives changed',
    baseValue: 12000, 
    suffix: '+',
    isLive: false,
  },
  {
    id: 'providers',
    label: 'Licensed listeners',
    baseValue: 50,
    suffix: '+',
    isLive: false,
  },
];

export default function ImpactStats() {
  const [counts, setCounts] = useState(
    STATS.reduce((acc, stat) => ({ ...acc, [stat.id]: stat.baseValue }), {})
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        ...prev,
        sessions: prev.sessions + 1,
      }));
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    // CHANGED: Background to 'Warm Stone' (#F2F0EB) for contrast
    <section className="relative w-full bg-[#F2F0EB] py-24 px-6 md:px-12 overflow-hidden">
      
      {/* Subtle "Light Leak" effect for depth (Top Center) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="mb-20 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-[#2D2A26] mb-4">
            Experts in virtual connection.
          </h2>
          {/* Divider: Darkened slightly to match new background */}
          <div className="h-1 w-24 bg-[#D6D3C9] mx-auto rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#D6D3C9]/50">
          {STATS.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center gap-2 pt-8 md:pt-0 px-4">
              {/* The Number Display */}
              <div className="font-serif text-5xl md:text-6xl lg:text-7xl text-[#3A6B48] tracking-tight tabular-nums h-[1.2em] overflow-hidden flex justify-center drop-shadow-sm">
                <AnimatedCounter 
                  value={counts[stat.id]} 
                  suffix={stat.suffix} 
                />
              </div>
              
              {/* The Label */}
              <p className="text-lg text-[#5C5954] font-medium tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- The "Digital Clock" Animation Component ---
function AnimatedCounter({ value, suffix }) {
  const numStr = value.toLocaleString('en-US');
  const characters = (numStr + suffix).split('');

  return (
    <div className="flex items-baseline">
      {characters.map((char, index) => (
        <Digit key={`${index}-${char}`} char={char} />
      ))}
    </div>
  );
}

function Digit({ char }) {
  if (isNaN(parseInt(char))) {
    return <span>{char}</span>;
  }

  return (
    <div className="relative h-[1em] w-[0.6em] overflow-hidden">
      <div className="animate-slide-up">
        <span className="block">{char}</span>
      </div>
      
      <style jsx>{`
        @keyframes slideUp {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}