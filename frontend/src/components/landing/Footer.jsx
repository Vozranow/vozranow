'use client';
import React from 'react';
import { Instagram, Linkedin, Twitter, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#173F3A] text-[#E5F0EE] pt-24 pb-12 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* --- LEFT: The Visual (Laptop Mockup) --- */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            <h3 className="font-serif text-3xl mb-8 text-center lg:text-left">
              Find your space. <br />
              <span className="opacity-60 italic">Start today.</span>
            </h3>

            {/* Laptop Device */}
            <div className="relative w-full max-w-[400px]">
              {/* Lid / Screen */}
              <div className="relative rounded-xl border-[8px] border-[#E5F0EE]/10 bg-[#E5F0EE] shadow-2xl overflow-hidden aspect-[16/10]">
                {/* Screen Content */}
                <div className="absolute inset-0 bg-white flex flex-col">
                  {/* Fake Nav */}
                  <div className="h-8 border-b border-gray-100 flex items-center px-4 gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                  
                  {/* Dashboard UI */}
                  <div className="p-6 flex-1 bg-[#FDFCF8] flex gap-4">
                    {/* Sidebar */}
                    <div className="w-16 hidden sm:flex flex-col gap-3">
                       <div className="h-8 w-8 rounded-lg bg-[#E5F0EE] flex items-center justify-center text-[#173F3A]"><Heart size={14}/></div>
                       <div className="h-8 w-8 rounded-lg bg-white border border-gray-100" />
                       <div className="h-8 w-8 rounded-lg bg-white border border-gray-100" />
                    </div>
                    {/* Main Card */}
                    <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col justify-between">
                       <div className="flex items-center gap-3">
                          <img src="https://i.pravatar.cc/150?img=32" className="h-10 w-10 rounded-full object-cover" alt="User" />
                          <div>
                             <div className="h-2 w-24 bg-gray-100 rounded mb-1.5" />
                             <div className="h-2 w-16 bg-gray-100 rounded" />
                          </div>
                       </div>
                       <div className="mt-4 space-y-2">
                          <div className="h-10 w-full rounded-lg bg-[#173F3A] opacity-10" />
                          <div className="h-10 w-full rounded-lg bg-gray-50" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Laptop Base */}
              <div className="relative -z-10 mx-auto h-4 w-[110%] rounded-b-xl bg-[#0F2926] shadow-lg transform -translate-y-1">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-20 rounded-b-lg bg-[#1F4D45]" />
              </div>
            </div>
          </div>


          {/* --- RIGHT: Links & Socials --- */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              
              {/* Column 1 */}
              <div className="space-y-6">
                <h4 className="font-serif text-xl text-white">Company</h4>
                <ul className="space-y-3 text-[#BCCECE] text-sm md:text-base">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                <h4 className="font-serif text-xl text-white">Support</h4>
                <ul className="space-y-3 text-[#BCCECE] text-sm md:text-base">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Safety Standards</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Listener Guidelines</a></li>
                  <li><a href="#" className="hover:text-white transition-colors font-medium text-red-200 hover:text-red-100">Crisis Resources</a></li>
                </ul>
              </div>

              {/* Column 3 */}
              <div className="space-y-6">
                <h4 className="font-serif text-xl text-white">Legal</h4>
                <ul className="space-y-3 text-[#BCCECE] text-sm md:text-base">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Preferences</a></li>
                </ul>
              </div>

            </div>

            {/* Socials & Copyright */}
            <div className="mt-20 pt-8 border-t border-[#2C5F58] flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Logo */}
              <div className="flex items-center gap-2 font-serif text-2xl tracking-tight text-white">
                Vozranow.
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-6">
                <SocialLink href="#" icon={Instagram} />
                <SocialLink href="#" icon={Twitter} />
                <SocialLink href="#" icon={Linkedin} />
              </div>

              {/* Copyright */}
              <div className="text-xs text-[#8FAFA9]">
                © 2024 Vozranow. All rights reserved.
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Very subtle bottom text for safety */}
      <div className="mt-12 text-center">
         <p className="text-xs text-[#5C8983] max-w-2xl mx-auto px-6">
            If you are in a life-threatening situation, please do not use this site. Call your local emergency number or 988 immediately.
         </p>
      </div>
    </footer>
  );
}

// --- Helper Component for Social Icons ---
function SocialLink({ href, icon: Icon }) {
  return (
    <a 
      href={href} 
      className="h-10 w-10 flex items-center justify-center rounded-full bg-[#23534B] text-[#E5F0EE] transition-all duration-300 hover:bg-[#E5F0EE] hover:text-[#173F3A] hover:scale-110"
    >
      <Icon size={18} />
    </a>
  );
}