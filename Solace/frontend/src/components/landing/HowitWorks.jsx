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
      
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#FDFCF8]">
          How Vozranow works
        </h2>
        <p className="text-[#A3C6C0] mt-3 text-sm uppercase tracking-widest">
          Your journey to a safe space
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {stepsData.map((step) => {
          const isActive = activeStep === step.id;

          return (
            <div
              key={step.id}
              onMouseEnter={() => setActiveStep(step.id)}
              onClick={() => setActiveStep(step.id)}
              className={`relative rounded-2xl p-7 transition-all duration-300 cursor-pointer
              
              ${
                isActive
                  ? "bg-white/10 border border-white/20 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                  : "bg-white/[0.03] border border-white/10"
              }
              `}
            >

              {/* NUMBER BADGE */}
              <div
                className={`absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm
                ${
                  isActive
                    ? "bg-[#E8F4F1] text-[#173F3A]"
                    : "bg-[#173F3A] text-[#A3C6C0] border border-[#A3C6C0]/30"
                }`}
              >
                {step.id}
              </div>

              {/* ICON */}
              <div className="mb-5">
                <div className="w-12 h-12 border border-[#A3C6C0]/30 rounded-lg flex items-center justify-center">
                  <step.icon
                    className={`w-8 h-8 transition-colors ${
                      isActive ? "text-white" : "text-[#A3C6C0]"
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* TITLE */}
              <h3
                className={`text-lg font-serif font-semibold mb-2 transition-colors
                ${isActive ? "text-white" : "text-[#E8F4F1]"}`}
              >
                {step.title}
              </h3>

              {/* DESCRIPTION */}
              <p
                className={`text-sm leading-relaxed transition-colors
                ${isActive ? "text-[#E8F4F1]" : "text-[#A3C6C0]"}`}
              >
                {step.description}
              </p>

            </div>
          );
        })}
      </div>
    </section>
  );
}