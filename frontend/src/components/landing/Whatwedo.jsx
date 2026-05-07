'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Ear, SunMoon, UserCheck, ArrowRight } from 'lucide-react';

const FEATURES = [
  { 
    id: 0, 
    icon: Heart, 
    title: "Real Connection", 
    text: "Experience genuine, real human connection without automated responses." 
  },
  { 
    id: 1, 
    icon: ShieldCheck, 
    title: "A Safe Space", 
    text: "Enter a completely safe, judgment-free zone where your thoughts are protected." 
  },
  { 
    id: 2, 
    icon: Ear, 
    title: "True Listening", 
    text: "Find someone who truly listens to you, without interruption or expectation." 
  },
  { 
    id: 3, 
    icon: SunMoon, 
    title: "Constant Support", 
    text: "Unwavering support through both your happiest moments and your most difficult times." 
  },
  { 
    id: 4, 
    icon: UserCheck, 
    title: "Be Yourself", 
    text: "A dedicated place where you don't have to pretend. Just come exactly as you are." 
  }
];

export default function Whatwedo() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="w-full bg-[#FDFCF8] py-20 px-6 md:px-12 font-sans selection:bg-[#173F3A] selection:text-white">

      {/* ================= HERO IMAGE ================= */}
      <div className="relative max-w-6xl mx-auto rounded-[2rem] overflow-hidden h-[350px] md:h-[450px] shadow-sm border border-[#E8E6E1]">
        
        {/* Background Image */}
        <img
          src="/what-we-do.jpg"
          alt="Peaceful space"
          className={`absolute inset-0 w-full h-full object-cover object-[center_60%] transition-all duration-700 ease-in-out ${
            isHovered ? 'blur-xl scale-105' : 'blur-0 scale-100'
          }`}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className={`absolute inset-0 transition-all duration-700 bg-gradient-to-t from-[#173F3A]/90 via-[#173F3A]/30 to-transparent ${
            isHovered ? 'bg-[#173F3A]/40' : ''
        }`} />

        {/* 🟢 REFINED TEXT: Elegant, readable, not overwhelming */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-12 md:pb-16">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight tracking-wide drop-shadow-md transition-transform duration-500">
            Connect with a listener.
          </h1>
          <p className="text-[#E5F0EE] mt-3 text-sm md:text-base font-medium tracking-widest uppercase drop-shadow-sm">
            A space where you are heard
          </p>

          <Link 
            to="/register"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group mt-8 bg-white text-[#173F3A] px-8 py-4 rounded-full font-bold text-sm tracking-wide shadow-lg hover:shadow-2xl hover:bg-[#F0F7F5] transform transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
          >
            Get Started 
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ================= EDITORIAL PROSE SECTION ================= */}
      <div className="max-w-5xl mx-auto mt-24 md:mt-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Sticky Left Title */}
          <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-24 h-fit">
            <div className="w-12 h-1 bg-[#A3C6C0] rounded-full mb-6"></div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#173F3A] leading-tight">
              What finding your <br className="hidden md:block" />
              <span className="italic text-[#8C877D] font-light">space</span> looks like.
            </h2>
          </div>

          {/* Right Flowing Text */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8 text-[15px] md:text-[17px] text-[#5C5954] leading-relaxed font-medium">
            <p>
              In this world, it often feels like no one truly belongs to anyone. People don’t always understand each other, and sometimes it seems like no one really listens.
            </p>
            <p>
              All we really want is someone we can talk to—someone who will listen without judging, who will share in our happiness, and who will hear our pain with empathy.
            </p>
            <p>
              In moments of joy and in times of sorrow, we just need someone who will listen—without interruption, without expectations, and without judgment. Someone who is simply there to listen, and keeps listening.
            </p>
            <p className="text-[#2D2A26] font-bold text-lg md:text-xl font-serif mt-10 border-l-2 border-[#173F3A] pl-6 py-1">
              At the end of the day, what truly matters is having someone who listens and understands.
            </p>
          </div>

        </div>
      </div>

      {/* ================= INTERACTIVE ICON TIMELINE ================= */}
      <div className="max-w-4xl mx-auto mt-32 md:mt-40 text-center">
        
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2D2A26] mb-2">
          What you get here
        </h2>
        <p className="text-[#8C877D] text-sm uppercase tracking-widest font-medium mb-16">
          The Vozranow Promise
        </p>

        {/* The Horizontal Interactive Bar */}
        <div className="relative max-w-3xl mx-auto">
          
          {/* The Connecting Line (Background) */}
          <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-[#E8E6E1] -translate-y-1/2 z-0 hidden sm:block"></div>

          {/* The Icons */}
          <div className="flex justify-between items-center relative z-10 gap-2 sm:gap-0 overflow-x-auto sm:overflow-visible px-2 pb-4 sm:pb-0 hide-scrollbar">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;

              return (
                <button
                  key={feature.id}
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  onClick={() => setActiveFeature(feature.id)} 
                  className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#173F3A] text-white scale-110 shadow-lg shadow-[#173F3A]/20 border-2 border-white ring-4 ring-[#E8F4F1]' 
                      : 'bg-white text-[#8C877D] border-2 border-[#E8E6E1] hover:border-[#A3C6C0] hover:text-[#173F3A]'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Text Display (Changes based on hover) */}
        <div className="mt-12 h-24 flex flex-col items-center justify-start px-4">
           <div 
             key={activeFeature} 
             className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-lg mx-auto"
           >
             <h3 className="font-bold text-[#173F3A] text-xl mb-2">
               {FEATURES[activeFeature].title}
             </h3>
             <p className="text-[#5C5954] leading-relaxed text-[15px]">
               {FEATURES[activeFeature].text}
             </p>
           </div>
        </div>

      </div>
    </section>
  );
}