'use client';
import React, { useState } from 'react';
// FIXED: Added 'Mic' to the imports
import { User, Video, MessageCircle, Calendar, Mic } from 'lucide-react';

// --- Data for the 4 Steps ---
const stepsData = [
  {
    id: 1,
    title: "Create your free account",
    description: "Get started in minutes. Just provide a few details to create your private, secure profile.",
    color: "bg-[#E8F4F1]", // Soft mint/teal
    screenContent: <ScreenStep1 />,
  },
  {
    id: 2,
    title: "Browse & connect with listeners",
    description: "Explore profiles of empathetic listeners. Filter by topic, language, and availability to find your perfect match.",
    color: "bg-[#F8F4E3]", // Soft cream/yellow
    screenContent: <ScreenStep2 />,
  },
  {
    id: 3,
    title: "Have your session, your way",
    description: "Connect via video, audio, or chat in our secure, private virtual space. You control the comfort level.",
    color: "bg-[#E3EDF8]", // Soft blue
    screenContent: <ScreenStep3 />,
  },
  {
    id: 4,
    title: "Build your support system",
    description: "Schedule recurring sessions with your favorite listeners and access resources to support your journey.",
    color: "bg-[#F4E3E8]", // Soft pink
    screenContent: <ScreenStep4 />,
  },
];

export default function HowitWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="w-full bg-[#FDFCF8] py-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-16 text-center font-serif text-4xl md:text-5xl text-[#2D2A26]">
          How Vozranow works
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* --- LEFT: The Steps List --- */}
          <div className="space-y-4">
            {stepsData.map((step) => (
              <div
                key={step.id}
                onMouseEnter={() => setActiveStep(step.id)}
                className={`group relative flex cursor-pointer items-start gap-6 rounded-2xl p-8 transition-all duration-300 ${
                  activeStep === step.id ? `${step.color} shadow-sm` : 'bg-white hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-serif transition-colors ${
                  activeStep === step.id ? 'bg-[#2D2A26] text-white' : 'bg-[#F0F4F4] text-[#2D2A26]'
                }`}>
                  {step.id}
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-medium text-[#2D2A26]">{step.title}</h3>
                  <p className="text-[16px] text-[#5C5954] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- RIGHT: The Dynamic Laptop Display --- */}
          <div className="relative flex items-center justify-center lg:h-[600px]">
            {/* Animated Background Blob */}
            <div 
              className={`absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] transition-colors duration-700 ease-in-out blur-3xl opacity-60 ${stepsData[activeStep - 1].color}`}
            />
            
            {/* Laptop Device Mockup */}
            <LaptopDevice>
              <div className="relative h-full w-full overflow-hidden bg-white">
                {stepsData.map((step) => (
                  <div
                    key={step.id}
                    className={`absolute inset-0 flex h-full w-full items-center justify-center p-8 transition-opacity duration-500 ease-in-out ${
                      activeStep === step.id ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    {step.screenContent}
                  </div>
                ))}
              </div>
            </LaptopDevice>
          </div>

        </div>
      </div>
    </section>
  );
}

// --- Laptop Device Component ---
function LaptopDevice({ children }) {
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="relative h-[350px] w-full overflow-hidden rounded-t-2xl border-[12px] border-b-0 border-[#2D2A26] bg-[#2D2A26] shadow-xl">
        <div className="absolute top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#1a1a1a]" />
        <div className="h-full w-full overflow-hidden rounded-t-lg bg-white">
          {children}
        </div>
      </div>
      <div className="relative h-4 w-full rounded-b-2xl bg-[#2D2A26]">
        <div className="absolute top-0 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-b-lg bg-[#403D39]" />
      </div>
    </div>
  );
}

// --- Step 1 Screen: Sign Up ---
function ScreenStep1() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-6 text-center">
      <div className="h-16 w-16 rounded-full bg-[#E8F4F1] flex items-center justify-center">
        <User size={32} className="text-[#5C5954]" />
      </div>
      <div>
        <h4 className="text-xl font-medium text-[#2D2A26]">Welcome to Vozranow</h4>
        <p className="text-sm text-[#5C5954]">Create your private account.</p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse"></div>
        <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse"></div>
        <div className="h-10 w-full rounded-lg bg-[#2D2A26] text-white flex items-center justify-center text-sm font-medium">Create Account</div>
      </div>
    </div>
  );
}

// --- Step 2 Screen: Listener Profile ---
function ScreenStep2() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-6">
       <h4 className="text-lg font-medium text-[#2D2A26]">Meet your listener</h4>
       <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img src="https://i.pravatar.cc/150?img=47" alt="Listener" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <h5 className="text-lg font-medium text-[#2D2A26]">Sarah M.</h5>
              <p className="text-sm text-[#5C5954]">Empathetic Listener</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#5C5954] leading-relaxed">"I'm here to provide a calm, non-judgmental space for you to share whatever is on your mind."</p>
          <div className="mt-6 flex gap-3">
             <div className="flex-1 h-9 rounded-lg bg-[#F8F4E3] flex items-center justify-center text-[#2D2A26] text-sm font-medium">View Profile</div>
             <div className="flex-1 h-9 rounded-lg bg-[#2D2A26] text-white flex items-center justify-center text-sm font-medium">Connect</div>
          </div>
       </div>
    </div>
  );
}

// --- Step 3 Screen: Video Call ---
function ScreenStep3() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-900">
      <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop" alt="Listener Video" className="h-full w-full object-cover opacity-90" />
      
      <div className="absolute bottom-4 right-4 h-24 w-32 overflow-hidden rounded-lg border-2 border-white bg-gray-800 shadow-lg">
         <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop" alt="Self Video" className="h-full w-full object-cover" />
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-4 rounded-full bg-[#2D2A26]/80 p-3 backdrop-blur-sm">
         <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white"><Mic size={20} /></div>
         <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#2D2A26]"><Video size={20} /></div>
         <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white"></div>
      </div>
    </div>
  );
}

// --- Step 4 Screen: Dashboard ---
function ScreenStep4() {
  return (
     <div className="flex h-full w-full flex-col items-center justify-center space-y-6 p-6">
        <h4 className="text-xl font-medium text-[#2D2A26]">Your Dashboard</h4>
        <div className="w-full space-y-4">
           <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F4E3E8]/30 p-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#2D2A26]"><Calendar size={20} /></div>
                 <div>
                    <p className="text-sm font-medium text-[#2D2A26]">Next Session</p>
                    <p className="text-xs text-[#5C5954]">Tomorrow, 4:00 PM with Sarah</p>
                 </div>
              </div>
              <div className="h-8 px-3 rounded-lg bg-white text-[#2D2A26] text-xs font-medium flex items-center justify-center border border-gray-200">Join</div>
           </div>
           <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 bg-white">
               <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[#5C5954]"><MessageCircle size={20} /></div>
               <div>
                  <p className="text-sm font-medium text-[#2D2A26]">Recent Messages</p>
                  <p className="text-xs text-[#5C5954]">You have 2 new messages.</p>
               </div>
           </div>
        </div>
     </div>
  );
}