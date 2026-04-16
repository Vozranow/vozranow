'use client';
import React from 'react';
import { MessageSquarePlus, LifeBuoy, AlertCircle } from 'lucide-react';

export default function DashboardFooter() {
  return (
    // mt-auto ensures it pushes to the bottom of the page if content is short
    <footer className="mt-auto w-full bg-[#173F3A] text-[#E5F0EE] py-8 px-6 md:px-12 border-t border-[#1F4D45]">
      <div className="mx-auto max-w-7xl">
        
        {/* --- TOP SECTION: Support & Feedback --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E5F0EE]/10">
          
          {/* Messaging */}
          <div className="text-center md:text-left space-y-1">
            <h4 className="font-serif text-xl font-medium tracking-wide">We're here for you.</h4>
            <p className="text-[#8FAFA9] text-sm">
              Have a suggestion or need help with a session? Let us know.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Feedback Button (Can trigger a modal later) */}
            <button className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#23534B] text-[#E5F0EE] text-sm font-medium transition-all hover:bg-[#E5F0EE] hover:text-[#173F3A]">
              <MessageSquarePlus size={16} className="transition-transform group-hover:scale-110" />
              Share Feedback
            </button>
            
            {/* Email Support Button */}
            <a 
              href="mailto:support@Vozranow.com" 
              className="group flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#2C5F58] text-[#E5F0EE] text-sm font-medium transition-all hover:border-[#E5F0EE] hover:bg-[#1F4D45]"
            >
              <LifeBuoy size={16} className="text-[#8FAFA9] group-hover:text-[#E5F0EE]" />
              support@Vozranow.com
            </a>
          </div>
        </div>

        {/* --- BOTTOM SECTION: Legal & Safety --- */}
        <div className="pt-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Branding & Copyright */}
          <div className="flex items-center gap-4">
            <span className="font-serif text-xl font-bold tracking-tight text-white">Vozranow.</span>
            <span className="text-[#5C8983]">|</span>
            <span className="text-xs text-[#8FAFA9]">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          {/* Crisis Warning - Centered & Subtle but clear */}
          <div className="flex items-center gap-2 text-xs text-[#E5F0EE]/60 max-w-md text-center bg-[#0F2926] px-4 py-2 rounded-full">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span>If you are in crisis, please call your local emergency services or <strong>988</strong> immediately.</span>
          </div>

          {/* Essential Links */}
          <div className="flex items-center gap-6 text-xs font-medium text-[#8FAFA9]">
            <a href="/guidelines" className="hover:text-white transition-colors">Guidelines</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>

        </div>
      </div>
    </footer>
  );
}