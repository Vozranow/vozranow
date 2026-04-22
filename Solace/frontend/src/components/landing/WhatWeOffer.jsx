'use client';
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Users, User } from 'lucide-react';

// --- Configuration Data ---
const services = [
  {
    id: 'adults',
    title: 'Individual',
    subtitle: 'For Adults (18+)',
    description: "Life gets heavy. Whether it’s anxiety, work stress, or just feeling stuck, our listeners provide a safe space to unpack it all at your own pace.",
    // Soft Sage Green Theme
    bgColor: '#E4F0E6', 
    accentColor: '#3A6B48',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop',
    icon: User
  },
  {
    id: 'couples',
    title: 'Corporates',
    subtitle: 'For working professionals',
    description: "Office life can be hectic sometimes. Navigate conflict, improve communication, or just reconnect.",
    // Soft Serene Blue Theme
    bgColor: '#E3EDF6',
    accentColor: '#2C5282',
    image: 'corporate.jpg',
    icon: Users
  },
  {
    id: 'teens',
    title: 'Teenagers',
    subtitle: 'For Ages 13-17',
    description: "Growing up is complicated. We offer a judgment-free zone where teens can talk about school, friends, and pressure without parents hovering.",
    // Warm Sand/Yellow Theme
    bgColor: '#F7F3E3',
    accentColor: '#8C7335',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop',
    icon: Sparkles
  }
];

export default function WhatWeOffer() {
  // Default background is the page color
  const [activeBg, setActiveBg] = useState('#FDFCF8');

  return (
    <section 
      className="w-full py-24 px-6 md:px-12 transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: activeBg }}
    >
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2A26]">
            Support for every stage of life.
          </h2>
          <p className="text-lg text-[#5C5954] max-w-2xl mx-auto">
            Whoever you are, whatever you're carrying, there is a space for you here.
          </p>
        </div>

        {/* The Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {services.map((service) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              setActiveBg={setActiveBg} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}

// --- Individual Card Component ---
function ServiceCard({ service, setActiveBg }) {
  const Icon = service.icon;

  return (
    <div 
      className="group relative h-[500px] w-full cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      onMouseEnter={() => setActiveBg(service.bgColor)}
      onMouseLeave={() => setActiveBg('#FDFCF8')}
    >
      {/* 1. Background Image Layer */}
      <div className="absolute inset-0 h-full w-full">
        <img 
          src={service.image} 
          alt={service.title} 
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:blur-[2px]"
        />
        {/* Gradient Overlay (Darkens on hover for readability) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 opacity-60 group-hover:opacity-80" />
      </div>

      {/* 2. Content Layer */}
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        
        {/* Visible Content (Always there) */}
        <div className="relative z-10 transform transition-transform duration-500 ease-out group-hover:-translate-y-4">
          {/* Badge */}
         

          <h3 className="font-serif text-3xl text-white mb-2">
            {service.title}
          </h3>

          {/* Hidden Content (Expands on Hover) */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="pt-2 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100">
                <p className="text-[16px] leading-relaxed text-gray-200 mb-6">
                  {service.description}
                </p>
                
                {/* Learn More Link */}
                {/* <div className="flex items-center gap-2 text-sm font-bold text-white tracking-wide uppercase">
                  <span>Learn more</span>
                  <div className="rounded-full bg-white/20 p-1 transition-transform duration-300 group-hover:translate-x-2">
                    <ArrowRight size={14} />
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Accent Line (Color Matching) */}
      <div 
        className="absolute top-0 left-0 h-1.5 w-full transform scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: service.accentColor }} 
      />
    </div>
  );
}