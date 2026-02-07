'use client';
import React from 'react';
import { Check, X, Minus } from 'lucide-react';

// --- Comparison Data ---
const features = [
  {
    label: "Comfort of your own safe space",
    subtext: "Connect from bed, your car, or a park bench.",
    solance: true,
    traditional: false,
  },
  {
    label: "Flexible timing (Nights & Weekends)",
    subtext: "Support that fits your schedule, not 9-to-5.",
    solance: true,
    traditional: false,
  },
  {
    label: "Switch listeners instantly",
    subtext: "Find your vibe without awkward breakup talks.",
    solance: true,
    traditional: false,
  },
  {
    label: "Text, Audio, & Video options",
    subtext: "You choose how visible you want to be.",
    solance: true,
    traditional: false,
  },
  {
    label: "No clinical diagnosis required",
    subtext: "Just talk. No labels, no patient records.",
    solance: true,
    traditional: true, // Traditional usually requires intake/diagnosis
    traditionalLabel: "Often Required", // Custom label override
    solanceLabel: "Never",
  },
];

export default function SolanceVsTraditional() {
  return (
    <section className="w-full bg-[#FDFCF8] py-24 px-6 md:px-12">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="mb-16 text-center space-y-4">
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2A26]">
            Why we do things differently.
          </h2>
          <p className="text-lg text-[#5C5954]">
            Traditional support is great, but sometimes you just need something... lighter.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E8E6E1] bg-white shadow-sm">
          
          {/* --- Table Header --- */}
          <div className="grid grid-cols-12 border-b border-[#E8E6E1]">
            {/* Empty Corner */}
            <div className="col-span-5 md:col-span-6 p-6"></div>
            
            {/* Solance Header (Highlighted) */}
            <div className="col-span-3 md:col-span-3 bg-[#E8F4F1] p-6 text-center">
              <span className="font-serif text-2xl text-[#2D2A26] block">Solance</span>
            </div>
            
            {/* Traditional Header */}
            <div className="col-span-4 md:col-span-3 p-6 text-center flex items-center justify-center">
              <span className="font-medium text-[#8C877D] text-sm md:text-base">Traditional<br className="md:hidden"/> In-person</span>
            </div>
          </div>

          {/* --- Table Rows --- */}
          <div className="divide-y divide-[#E8E6E1]">
            {features.map((feature, index) => (
              <div key={index} className="grid grid-cols-12 group hover:bg-gray-50/50 transition-colors">
                
                {/* 1. Feature Label (Left) */}
                <div className="col-span-5 md:col-span-6 p-6 flex flex-col justify-center">
                  <span className="font-medium text-[#2D2A26] text-base md:text-lg">
                    {feature.label}
                  </span>
                  {feature.subtext && (
                    <span className="hidden md:block text-sm text-[#8C877D] mt-1 font-light">
                      {feature.subtext}
                    </span>
                  )}
                </div>

                {/* 2. Solance Column (Middle - Highlighted) */}
                <div className="col-span-3 md:col-span-3 bg-[#E8F4F1]/50 p-6 flex items-center justify-center border-x border-[#E8F4F1] relative">
                  {/* Active Highlight Line on Left */}
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#D1E6D9]" />
                  
                  {feature.solanceLabel ? (
                    <span className="font-bold text-[#3A6B48]">{feature.solanceLabel}</span>
                  ) : feature.solance ? (
                    <div className="h-8 w-8 rounded-full bg-[#3A6B48] flex items-center justify-center shadow-sm">
                      <Check size={18} className="text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <X size={24} className="text-[#8C877D]" />
                  )}
                </div>

                {/* 3. Traditional Column (Right) */}
                <div className="col-span-4 md:col-span-3 p-6 flex items-center justify-center">
                  {feature.traditionalLabel ? (
                     <span className="text-sm text-[#8C877D] text-center">{feature.traditionalLabel}</span>
                  ) : feature.traditional ? (
                    <div className="h-8 w-8 rounded-full border border-[#D6D3C9] flex items-center justify-center">
                       <Check size={16} className="text-[#8C877D]" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center">
                        <X size={20} className="text-[#D6D3C9]" />
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
        
        {/* Bottom Note */}
        <p className="mt-8 text-center text-sm text-[#8C877D] italic">
          *Solance is a peer-support platform, not a replacement for clinical psychiatric care.
        </p>

      </div>
    </section>
  );
}