'use client';
import React, { useState } from 'react';

// 🟢 Replaced React components with image paths so you can insert your own UI screenshots
const stepsData = [
  {
    id: 1,
    title: "Create your free account",
    description: "Get started in minutes. Provide a few details to set up your private, secure profile.",
    image: "/Screenshot 2026-04-20 012516.png" // <-- Insert your own image path here
  },
  {
    id: 2,
    title: "Request a time window",
    description: "Select a 2-3 hour window where you are free. Our admin team will carefully match you with the perfect listener.",
    image: "/Screenshot 2026-04-20 012601.png" // <-- Insert your own image path here
  },
  {
    id: 3,
    title: "Have your session, your way",
    description: "At the confirmed time, connect with your listener via secure video, audio, or text chat.",
    image: "/Screenshot 2026-04-20 012958.png" 
  },
  {
    id: 4,
    title: "Seamless & secure payments",
    description: "Top up your secure Vozranow wallet for instant, fail-proof session bookings.",
    image: "/Screenshot 2026-04-20 012911.png" // <-- Insert your own image path here
  },
];

// 🟢 Background colors that get progressively lighter green
const bgColors = {
  1: "bg-[#0A1D1A]", // Darkest green
  2: "bg-[#0D2622]", 
  3: "bg-[#11332E]", 
  4: "bg-[#173F3A]"  // Primary brand green
};

export default function HowitWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section 
      className={`w-full py-24 px-6 md:px-12 lg:px-24 transition-colors duration-700 ease-in-out font-sans ${bgColors[activeStep]}`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-[#FDFCF8] tracking-tight">
            How Vozranow works
          </h2>
          <p className="text-[#A3C6C0] mt-4 font-medium tracking-wide uppercase text-sm">
            Your journey to a safe space
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT: The Interactive Steps */}
          <div className="space-y-4 relative z-10">
            {stepsData.map((step) => {
              const isActive = activeStep === step.id;
              
              return (
                <div
                  key={step.id}
                  onMouseEnter={() => setActiveStep(step.id)}
                  onClick={() => setActiveStep(step.id)} // For mobile users
                  className={`flex cursor-pointer items-start gap-5 rounded-[1.5rem] p-6 md:p-8 transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 shadow-lg shadow-black/20 backdrop-blur-md translate-x-2'
                      : 'bg-transparent hover:bg-white/5'
                  }`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold font-serif transition-colors duration-300 ${
                      isActive
                        ? 'bg-[#E8F4F1] text-[#173F3A] shadow-md'
                        : 'bg-[#173F3A]/50 text-[#A3C6C0] border border-[#A3C6C0]/30'
                    }`}
                  >
                    {step.id}
                  </div>

                  {/* Step Text */}
                  <div className="pt-2">
                    <h3 className={`text-xl font-bold font-serif mb-2 transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#E8F4F1]'}`}>
                      {step.title}
                    </h3>
                    <p className={`leading-relaxed text-[15px] transition-colors duration-300 ${isActive ? 'text-[#E8F4F1]' : 'text-[#A3C6C0]'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: The Device Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[550px]">
              
              {/* 🟢 The Black Laptop/Device Bezel */}
              <div className="aspect-[4/3] bg-[#2D2A26] rounded-[2rem] p-3 md:p-4 shadow-2xl shadow-black/40 border-b-4 border-black/50">
                
                {/* The Screen Area */}
                <div className="relative w-full h-full bg-[#173F3A] rounded-xl overflow-hidden">
                  
                  {/* Map through the images and cross-fade them */}
                  {stepsData.map((step) => (
                    <img
                      key={step.id}
                      src={step.image}
                      alt={step.title}
                      className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-in-out ${
                        activeStep === step.id ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    />
                  ))}

                  {/* Fallback pattern just in case your images haven't loaded yet */}
                  <div className="absolute inset-0 bg-[#173F3A] opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none -z-10"></div>
                </div>

              </div>

              {/* Little detail to make it look like a real device standing up */}
              <div className="mx-auto w-[40%] h-3 bg-[#1A1816] rounded-b-xl shadow-lg"></div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}