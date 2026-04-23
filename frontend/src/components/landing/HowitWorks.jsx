'use client';
import React, { useState } from 'react';
import { FormInput, Clipboard, Clock, CalendarCheck, HandCoins } from 'lucide-react';

const stepsData = [
  {
    id: 1,
    title: "Create your free account",
    description:
      "Get started in minutes. Provide a few details to set up your private, secure profile.",
    icon: FormInput,
  },
  {
    id: 2,
    title: "Request a time window",
    description:
      "Select a 2–3 hour window where you are free. Our admin team will carefully match you with the perfect listener.",
    icon: Clipboard,
  },
  {
    id: 3,
    title: "Have your session, your way",
    description:
      "At the confirmed time, connect with your listener via secure video, audio, or text chat.",
    icon: Clock,
  },
  {
    id: 4,
    title: "Seamless & secure payments",
    description:
      "Top up your secure Vozranow wallet for instant, fail-proof session bookings.",
    icon: HandCoins,
  },
];

export default function HowitWorks() {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <section className="w-full py-24 px-6 md:px-12 bg-gradient-to-br from-[#0B1F1C] via-[#0F2E2A] to-[#0A1D1A] transition-all duration-500">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        
        {/* LEFT: Header & Illustration */}
        <div className="lg:col-span-5 space-y-12 text-center lg:text-left">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#FDFCF8] leading-tight">
              How Vozranow works
            </h2>
            <p className="text-[#A3C6C0] mt-4 text-sm uppercase tracking-widest font-medium">
              Your journey to a safe space
            </p>
          </div>

          <div className="hidden lg:flex justify-center lg:justify-start w-full opacity-85">
            <CalmPlantIllustration />
          </div>
        </div>

        {/* RIGHT: Grid of Steps */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6 lg:gap-8">
          {stepsData.map((step) => {
            const isActive = activeStep === step.id;

            return (
              <div
                key={step.id}
                onMouseEnter={() => setActiveStep(step.id)}
                onClick={() => setActiveStep(step.id)}
                className={`relative rounded-2xl p-7 transition-all duration-300 cursor-pointer w-full
                
                ${
                  isActive
                    ? "bg-white/10 border border-white/20 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                    : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.05]"
                }
                `}
              >

                {/* NUMBER BADGE */}
                <div
                  className={`absolute -top-4 -left-4 w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm font-bold shadow-lg shadow-black/20
                  ${
                    isActive
                      ? "bg-[#E8F4F1] text-[#173F3A]"
                      : "bg-[#173F3A] text-[#A3C6C0] border border-[#A3C6C0]/30"
                  }`}
                >
                  {step.id}
                </div>

                {/* ICON */}
                <div className="mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? "bg-[#173F3A]/60 border border-[#A3C6C0]/50" : "border border-[#A3C6C0]/20"
                    }`}
                  >
                    <step.icon
                      className={`w-6 h-6 transition-colors ${
                        isActive ? "text-white" : "text-[#A3C6C0]"
                      }`}
                      strokeWidth={1.8}
                    />
                  </div>
                </div>

                {/* TITLE */}
                <h3
                  className={`text-lg font-serif font-semibold mb-2 transition-colors
                  ${isActive ? "text-[#FDFCF8]" : "text-[#E8F4F1]/90"}`}
                >
                  {step.title}
                </h3>

                {/* DESCRIPTION */}
                <p
                  className={`text-sm leading-relaxed transition-colors
                  ${isActive ? "text-[#E8F4F1]/80" : "text-[#A3C6C0]/70"}`}
                >
                  {step.description}
                </p>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// --- Cute Potted Plant Illustration for the Dark Theme ---
function CalmPlantIllustration() {
  return (
    <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] h-auto drop-shadow-2xl">
      
      {/* Background glow circle */}
      <circle cx="150" cy="200" r="100" fill="#A3C6C0" fillOpacity="0.05" blur="40" />

      {/* Main stem (curve) */}
      <path 
        d="M150 320 C140 250 160 150 150 70" 
        stroke="#E8F4F1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"
      />
      
      {/* Left Leaves */}
      <path 
        d="M148 270 Q 100 240 90 270 Q 110 300 150 285" 
        fill="#A3C6C0" stroke="#E8F4F1" strokeWidth="2" strokeLinejoin="round" className="opacity-90"
      />
      <path 
        d="M152 180 Q 70 140 60 180 Q 90 220 151 195" 
        fill="none" stroke="#E8F4F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"
      />
      <path 
        d="M151 100 Q 110 70 100 100 Q 120 130 150 115" 
        fill="#A3C6C0" stroke="#E8F4F1" strokeWidth="2" strokeLinejoin="round" className="opacity-90"
      />

      {/* Right Leaves (asymmetrical) */}
      <path 
        d="M150 230 Q 220 190 230 230 Q 190 260 149 245" 
        fill="none" stroke="#E8F4F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"
      />
      <path 
        d="M150 140 Q 210 110 220 140 Q 180 170 150 155" 
        fill="#A3C6C0" stroke="#E8F4F1" strokeWidth="2" strokeLinejoin="round" className="opacity-90"
      />
      <path 
        d="M150 60 Q 190 30 200 60 Q 170 90 150 75" 
        fill="none" stroke="#E8F4F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"
      />

      {/* Top Leaf */}
      <path 
        d="M150 70 Q 120 20 150 10 Q 180 20 150 70" 
        fill="#A3C6C0" stroke="#E8F4F1" strokeWidth="2" strokeLinejoin="round" className="opacity-90"
      />

      {/* The Pot Base */}
      <path 
        d="M110 320 L190 320 L175 390 L125 390 Z" 
        fill="#173F3A" stroke="#A3C6C0" strokeWidth="3" strokeLinejoin="round"
      />
      <path 
        d="M100 320 L200 320 L195 340 L105 340 Z" 
        fill="#A3C6C0" stroke="#E8F4F1" strokeWidth="2" strokeLinejoin="round"
      />

      {/* Minimalist cute butterfly resting on the top leaf */}
      <g className="drop-shadow-md transition-transform duration-1000 hover:-translate-y-2 hover:rotate-6 origin-[150px_10px]">
        {/* Left Wing */}
        <path d="M150 5 C 132 -8, 135 19, 150 12 Z" fill="#E8F4F1" opacity="0.9" />
        {/* Right Wing */}
        <path d="M150 5 C 168 -8, 165 19, 150 12 Z" fill="#A3C6C0" opacity="0.9" />
        {/* Body */}
        <path d="M150 3 L150 13" stroke="#0B1F1C" strokeWidth="1.5" strokeLinecap="round" />
        {/* Antennae */}
        <path d="M150 3 Q 146 0 145 -3" stroke="#A3C6C0" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M150 3 Q 154 0 155 -3" stroke="#A3C6C0" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
      
    </svg>
  );
}