'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrolled = useScroll(10);
  const navigate = useNavigate();

  // Navigation handlers
  const handleSignIn = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
        scrolled
          ? 'bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E8E6E1] py-3'
          : 'bg-transparent py-5 border-transparent'
      }`}
    >
      {/* Container: widened to px-8 or px-12 to push logo left */}
      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-6 md:px-12">
        
        {/* --- 1. The Logo (Mature, Serif, Icon-free) --- */}
        <div className="flex items-center">
          <a href="/" className="font-serif text-3xl tracking-tight text-[#2D2A26] hover:opacity-80 transition-opacity">
            Vozranow<span className="text-[#8C877D]">.</span>
          </a>
        </div>

        {/* --- 2. Center Navigation (Clean Text) --- */}
        <nav className="hidden md:flex items-center gap-10">
          <DropdownItem title="Find Support" items={supportLinks} />
          <DropdownItem title="Community" items={communityLinks} />
          
          <a href="/pricing" className="text-[15px] font-medium text-[#5C5954] hover:text-[#2D2A26] transition-colors tracking-wide">
            Pricing
          </a>
          
          <a href="/listener-landing" className="text-[15px] font-medium text-[#5C5954] hover:text-[#2D2A26] transition-colors tracking-wide">
            Become a Listener
          </a>
        </nav>

        {/* --- 3. Action Buttons (Subtle & Serious) --- */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={handleSignIn}
            className="text-[15px] font-medium text-[#5C5954] hover:text-[#2D2A26] transition-colors"
          >
            Log in
          </button>
          
          <button 
            onClick={handleRegister}
            className="rounded-full bg-[#2D2A26] px-6 py-2.5 text-[15px] font-medium text-white transition-all hover:bg-[#403D39] hover:shadow-lg hover:shadow-[#2D2A26]/10 active:scale-95"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#2D2A26]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
        </button>
      </div>

      {/* --- Mobile Menu (Clean Overlay) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[70px] z-40 bg-[#FDFCF8] overflow-y-auto md:hidden animate-in fade-in duration-200">
          <div className="flex flex-col p-8 space-y-8">
            
            {/* Mobile Support */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-[#2D2A26]">Find Support</h3>
              <div className="flex flex-col space-y-3 pl-2 border-l border-[#E8E6E1]">
                {supportLinks.map((item, i) => (
                  <MobileLink key={i} {...item} />
                ))}
              </div>
            </div>

            {/* Mobile Community */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl text-[#2D2A26]">Community</h3>
              <div className="flex flex-col space-y-3 pl-2 border-l border-[#E8E6E1]">
                {communityLinks.map((item, i) => (
                  <MobileLink key={i} {...item} />
                ))}
              </div>
            </div>

            <div className="pt-8 space-y-4">
               <button 
                onClick={handleSignIn}
                className="w-full text-left text-lg font-medium text-[#5C5954]"
              >
                Log in
              </button>
              <button 
                onClick={handleRegister}
                className="w-full rounded-full bg-[#2D2A26] py-4 text-lg font-medium text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// --- Minimalist Components ---

function DropdownItem({ title, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1.5 text-[15px] font-medium text-[#5C5954] group-hover:text-[#2D2A26] transition-colors focus:outline-none py-4">
        {title}
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 text-[#8C877D] ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Panel: Clean, no icons, just good typography */}
      <div 
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[280px] rounded-sm border border-[#E8E6E1] bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top
        ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}
      >
        <div className="flex flex-col">
            {items.map((item, i) => (
              <a 
                key={i} 
                href={item.href} 
                className="block px-6 py-3.5 hover:bg-[#F9F8F6] transition-colors group/item"
              >
                <div className="text-[15px] font-medium text-[#2D2A26] group-hover/item:text-black">
                    {item.title}
                </div>
                <div className="text-[13px] text-[#8C877D] mt-0.5 font-light">
                    {item.description}
                </div>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}

function MobileLink({ title, href }) {
  return (
    <a href={href} className="block py-1 text-[16px] text-[#5C5954]">
      {title}
    </a>
  );
}

// --- Hooks ---
function useScroll(threshold) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

// --- DATA (Text Only, No Icons) ---

const supportLinks = [
  { 
    title: '1-on-1 Sessions', 
    href: '/booking', 
    description: 'Private video calls with listeners.' 
  },
  { 
    title: 'Emotional Support', 
    href: '/topics/emotional', 
    description: 'Anxiety, stress, and daily struggles.' 
  },
  { 
    title: 'Personal Growth', 
    href: '/topics/growth', 
    description: 'Coaching for life and career.' 
  },
  { 
    title: 'Crisis Resources', 
    href: '/crisis', 
    description: 'Immediate help when you need it.' 
  },
];

const communityLinks = [
  { 
    title: 'Our Mission', 
    href: '/about', 
    description: 'The story behind Vozranow.' 
  },
  { 
    title: 'Safety & Trust', 
    href: '/safety', 
    description: 'How we keep this space safe.' 
  },
  { 
    title: 'Stories', 
    href: '/stories', 
    description: 'Real experiences from our community.' 
  },
];