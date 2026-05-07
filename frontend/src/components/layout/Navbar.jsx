'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrolled = useScroll(10);
  const navigate = useNavigate();

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
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-[#F5F5F0]/95 backdrop-blur-md border-b border-[#DDE5E3] py-1'
          : 'bg-[#F5F5F0] py-2'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 md:px-12">
        
        {/* Logo */}
        <div>
          <a href="/" className="font-serif text-3xl text-[#0F2F2B]">
            Vozranow<span className="text-[#4A6B67]"></span>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <DropdownItem title="Find Support" items={supportLinks} />
          <DropdownItem title="About" items={communityLinks} />

          <a href="/pricing" className="text-[15px] text-[#4A6B67] hover:text-[#0F2F2B]">
            Pricing
          </a>

          {/* <a href="/listener-landing" className="text-[15px] text-[#4A6B67] hover:text-[#0F2F2B]">
            Become a Listener
          </a> */}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={handleSignIn}
            className="text-[15px] text-[#4A6B67] hover:text-[#0F2F2B]"
          >
            Log in
          </button>

          <button
            onClick={handleRegister}
            className="rounded-full bg-[#173F3A] px-6 py-2.5 text-white hover:bg-[#0F2F2B]"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#0F2F2B]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[70px] bg-[#F5F5F0] md:hidden">
          <div className="flex flex-col p-8 space-y-6">

            <button onClick={handleSignIn} className="text-[#0F2F2B] text-lg">
              Log in
            </button>

            <button
              onClick={handleRegister}
              className="rounded-full bg-[#173F3A] py-4 text-white"
            >
              Get Started
            </button>

          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Dropdown ---------- */

function DropdownItem({ title, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative group flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1.5 text-[15px] text-[#4A6B67] group-hover:text-[#0F2F2B] py-4">
        {title}
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 w-[280px] border border-[#DDE5E3] bg-[#F5F5F0] shadow-md py-2 transition-all
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {items.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="block px-6 py-3 hover:bg-[#E8EFED]"
          >
            <div className="text-[15px] text-[#0F2F2B]">
              {item.title}
            </div>
            <div className="text-[13px] text-[#4A6B67]">
              {item.description}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------- Hook ---------- */

function useScroll(threshold) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

/* ---------- Data ---------- */

const supportLinks = [
  { title: '1-on-1 Sessions', href: '/booking', description: 'Private video calls with listeners.' },
  // { title: 'Emotional Support', href: '/topics/emotional', description: 'Anxiety, stress, and daily struggles.' },
  { title: 'Personal Growth', href: '/topics/growth', description: 'Coaching for life and career.' },
  // { title: 'Crisis Resources', href: '/crisis', description: 'Immediate help when you need it.' },
];

const communityLinks = [
  { title: 'Our Mission', href: '/about', description: 'The story behind Vozranow.' },
  { title: 'Safety & Trust', href: '/safety', description: 'How we keep this space safe.' },
  { title: 'Stories', href: '/stories', description: 'Real experiences from our community.' },
];