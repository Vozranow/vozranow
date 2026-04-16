'use client';
import React from 'react';
import { Heart, Mic, Shield, Users, PauseCircle } from 'lucide-react';

export default function Whatwedo() {
  return (
    <section className="relative w-full bg-[#FDFCF8] py-24 px-6 md:px-12 overflow-hidden">
      
      {/* --- Background Textures (Subtle Waves) --- */}
      {/* Top Right Wave */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-40 pointer-events-none translate-x-1/3 -translate-y-1/3">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#E8E6E1" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.1,22.9,70.6,33.5C59.1,44.1,47.5,51.7,35.4,59.3C23.3,66.9,10.7,74.5,-0.6,75.5C-11.9,76.6,-25.1,71.1,-37.2,63.4C-49.3,55.7,-60.3,45.8,-68.6,33.7C-76.9,21.6,-82.5,7.3,-80.4,-5.9C-78.3,-19.1,-68.5,-31.2,-57.4,-40.3C-46.3,-49.4,-33.9,-55.5,-21.2,-63.9C-8.5,-72.3,4.5,-83,17.4,-82.7C30.3,-82.4,43.1,-71.1,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      {/* Bottom Left Wave */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/3">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#E8E6E1" d="M41.4,-70.5C53.3,-64.8,62.6,-53.4,70.8,-41.4C79,-29.4,86.1,-16.8,85.1,-4.7C84.1,7.4,75,19.1,65.8,29.7C56.6,40.3,47.3,49.8,36.7,56.8C26.1,63.8,14.1,68.3,1.3,66.1C-11.5,63.9,-25.1,55,-37.4,46.2C-49.7,37.4,-60.7,28.7,-67.8,17.4C-74.9,6.1,-78.1,-7.8,-73.3,-20.1C-68.5,-32.4,-55.7,-43.1,-43.3,-48.6C-30.9,-54.1,-18.9,-54.4,-7.6,-41.3C3.7,-28.1,29.5,-76.2,41.4,-70.5Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* CHANGED: Added responsiveness (md:grid-cols-2) to ensure side-by-side on tablets/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">
          
          {/* --- LEFT: The "IRL" Image --- */}
          <div className="relative group mx-auto w-full max-w-md md:max-w-none">
            <div className="absolute inset-0 bg-[#E8E6E1] rounded-2xl transform rotate-3 transition-transform duration-500 group-hover:rotate-2" />
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl bg-gray-100 shadow-xl shadow-[#2D2A26]/5">
              <img 
                src="women.png" 
                alt="Woman holding tea" 
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#2D2A26]/5 mix-blend-overlay" />
            </div>
          </div>

          {/* --- RIGHT: The Engaging Points --- */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="font-serif text-3xl md:text-5xl text-[#2D2A26] leading-tight">
                What finding your <br />
                <span className="italic text-[#8C877D]">space</span> looks like.
              </h2>
              <p className="text-lg text-[#5C5954] max-w-md leading-relaxed font-medium opacity-90">
                Vozranow isn't about clinical fixes or rigid schedules. It's about having a dedicated time where you don't have to pretend.
              </p>
            </div>

            {/* CHANGED: Compact spacing (space-y-4 instead of 6) */}
            <ul className="space-y-4">
              <BenefitPoint 
                icon={Heart} 
                text="Real human connection, absolutely no bots or scripts." 
              />
              <BenefitPoint 
                icon={Mic} 
                text="Flexible sessions on your terms—video, audio, or chat." 
              />
              <BenefitPoint 
                icon={Shield} 
                text="A completely private, judgment-free zone." 
              />
              <BenefitPoint 
                icon={Users} 
                text="Switch listeners easily to find your right match." 
              />
              <BenefitPoint 
                icon={PauseCircle} 
                text="Support that respects your pace and needs, not a 'fix'." 
              />
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

// --- Subcomponent for the List Items ---
function BenefitPoint({ icon: Icon, text }) {
  return (
    <li className="flex items-start gap-3 group cursor-default">
      <div className="mt-0.5 flex-shrink-0 text-[#8C877D] transition-colors duration-300 group-hover:text-[#2D2A26]">
        <Icon size={20} strokeWidth={2} /> {/* Slightly bolder icon stroke */}
      </div>
      {/* CHANGED: Bolder font (font-medium), slightly smaller text, tighter leading */}
      <span className="text-[16px] font-medium text-[#4A4742] leading-snug transition-colors duration-300 group-hover:text-black">
        {text}
      </span>
    </li>
  );
}