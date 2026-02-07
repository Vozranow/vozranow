'use client';
import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

// --- FAQ Data (Adapted for Solance) ---
const faqs = [
  {
    question: "How much does Solance cost?",
    answer: "Solance offers flexible plans starting at just $29/week. You can also pay per session if you prefer not to subscribe. We believe support should be accessible to everyone."
  },
  {
    question: "Is this a replacement for therapy?",
    answer: "No. Solance provides emotional support through active listening and peer connection. While incredibly helpful for stress, anxiety, and loneliness, our listeners are not licensed psychologists and do not diagnose mental health conditions."
  },
  {
    question: "How are listeners vetted?",
    answer: "Every listener on Solance undergoes a rigorous background check and completes our 40-hour 'Empathetic Listening' certification program before they can take their first call."
  },
  {
    question: "Is it completely anonymous?",
    answer: "Yes. You can use a nickname/alias, and video is optional. Your conversations are encrypted and never recorded without your explicit written consent."
  },
  {
    question: "How do I get matched with a listener?",
    answer: "It takes about 60 seconds. You'll answer a few simple questions about what's on your mind (e.g., relationship issues, work stress), and we'll show you listeners who specialize in those areas."
  }
];

export default function FAQsection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#E5F0EE] py-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* --- LEFT: Header & Illustration --- */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4">
              <h2 className="font-serif text-4xl md:text-5xl text-[#173F3A]">
                Any questions?
              </h2>
              <p className="text-[#3A6B65] text-lg">
                Find trust-worthy answers about how Solance helps you grow.
              </p>
            </div>

            {/* Custom SVG Illustration (Hands & Growth) */}
            <div className="hidden lg:block w-full max-w-md mx-auto opacity-90">
               <GrowthIllustration />
            </div>
          </div>

          {/* --- RIGHT: The Accordion --- */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-[#BFD4D1]">
              {faqs.map((faq, index) => (
                <div key={index} className="group">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between py-6 text-left focus:outline-none"
                  >
                    <span className="font-serif text-xl md:text-2xl text-[#173F3A] group-hover:text-[#2C7A70] transition-colors pr-8">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 text-[#173F3A]">
                      {openIndex === index ? (
                        <Minus size={24} strokeWidth={1.5} />
                      ) : (
                        <Plus size={24} strokeWidth={1.5} />
                      )}
                    </span>
                  </button>
                  
                  {/* Expandable Answer */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      openIndex === index ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[#3A6B65] text-[17px] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Closing line for the last item */}
              <div className="h-[1px] bg-[#BFD4D1]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// --- Custom SVG Component to mimic the "Growth/Hands" Diagram ---
function GrowthIllustration() {
  return (
    <svg viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Hand Outline Left */}
      <path 
        d="M60 220 C60 220 40 250 80 290 C120 330 180 330 200 330" 
        stroke="#2D2A26" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Hand Outline Right */}
      <path 
        d="M340 220 C340 220 360 250 320 290 C280 330 220 330 200 330" 
        stroke="#2D2A26" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
      
      {/* Soil / Base */}
      <path 
        d="M100 290 C130 270 270 270 300 290" 
        stroke="#2D2A26" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"
      />
      
      {/* Stem */}
      <path 
        d="M200 280 L200 150" 
        stroke="#2D2A26" strokeWidth="3" strokeLinecap="round"
      />
      
      {/* Leaf Left */}
      <path 
        d="M200 220 Q 150 200 160 180 Q 180 210 200 210" 
        stroke="#2D2A26" strokeWidth="3" strokeLinecap="round" fill="#E8F4F1"
      />
      {/* Leaf Right */}
      <path 
        d="M200 190 Q 250 170 240 150 Q 220 180 200 180" 
        stroke="#2D2A26" strokeWidth="3" strokeLinecap="round" fill="#E8F4F1"
      />
      
      {/* The Sun/Flower Checkmark Badge */}
      <circle cx="200" cy="100" r="40" stroke="#2D2A26" strokeWidth="3" fill="#FFFFFF" />
      {/* Rays */}
      <path d="M200 50 L200 30" stroke="#2D2A26" strokeWidth="3" strokeLinecap="round"/>
      <path d="M200 150 L200 170" stroke="#2D2A26" strokeWidth="3" strokeLinecap="round"/>
      <path d="M250 100 L270 100" stroke="#2D2A26" strokeWidth="3" strokeLinecap="round"/>
      <path d="M150 100 L130 100" stroke="#2D2A26" strokeWidth="3" strokeLinecap="round"/>
      <path d="M235 65 L250 50" stroke="#2D2A26" strokeWidth="3" strokeLinecap="round"/>
      <path d="M165 65 L150 50" stroke="#2D2A26" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Checkmark in Center */}
      <path 
        d="M185 100 L195 110 L215 90" 
        stroke="#173F3A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
      />
      
      {/* Decorative Scribbles (Soil Texture) */}
      <circle cx="150" cy="300" r="2" fill="#2D2A26"/>
      <circle cx="180" cy="310" r="3" fill="#2D2A26"/>
      <circle cx="220" cy="305" r="2" fill="#2D2A26"/>
      <circle cx="250" cy="295" r="3" fill="#2D2A26"/>
    </svg>
  );
}