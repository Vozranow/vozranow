'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import hook
import {
  Code,
  Globe,
  Layers,
  UserPlus,
  Users,
  Star,
  FileText,
  Shield,
  RotateCcw,
  Handshake,
  Leaf,
  HelpCircle,
  BarChart,
  Plug,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrolled = useScroll(20);
  const navigate = useNavigate(); // 2. Initialize hook

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
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 border-gray-200 backdrop-blur-md shadow-sm'
          : 'bg-white border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center space-x-2 font-bold text-xl">
            <WordmarkIcon className="h-6 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <DropdownItem title="Product" items={productLinks} />
            <DropdownItem title="Company" items={companyLinks} footerLinks={companyLinks2} />
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Pricing
            </a>
          </nav>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={handleSignIn}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={handleRegister}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white border-t border-gray-100 overflow-y-auto md:hidden animate-in slide-in-from-top-5 duration-200">
          <div className="p-4 space-y-6">
            
            {/* Mobile Product Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Product</h3>
              <div className="grid gap-4">
                {productLinks.map((item, i) => (
                  <MobileListItem key={i} {...item} />
                ))}
              </div>
            </div>

            {/* Mobile Company Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Company</h3>
              <div className="grid gap-4">
                {companyLinks.map((item, i) => (
                  <MobileListItem key={i} {...item} />
                ))}
                {companyLinks2.map((item, i) => (
                   <a key={i} href={item.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <item.icon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">{item.title}</span>
                   </a>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={handleSignIn}
                className="w-full rounded-md border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </button>
              <button 
                onClick={handleRegister}
                className="w-full rounded-md bg-black py-2.5 font-medium text-white hover:bg-gray-800"
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

// --- Subcomponents ---

function DropdownItem({ title, items, footerLinks }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-black transition-colors focus:outline-none">
        {title}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      <div 
        className={`absolute top-full left-0 mt-2 w-[500px] rounded-xl border border-gray-100 bg-white shadow-lg p-4 transition-all duration-200 origin-top-left
        ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {items.map((item, i) => (
              <a key={i} href={item.href} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-100 bg-white shadow-sm">
                    <item.icon className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
              </a>
            ))}
          </div>
          
          {footerLinks && (
            <div className="col-span-2 mt-2 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
              {footerLinks.map((item, i) => (
                 <a key={i} href={item.href} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                   {item.icon && <item.icon className="h-4 w-4 text-gray-400" />}
                   {item.title}
                 </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileListItem({ title, description, icon: Icon, href }) {
  return (
    <a href={href} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <span className="block font-medium text-gray-900">{title}</span>
        {description && <span className="block text-sm text-gray-500">{description}</span>}
      </div>
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

// --- Data ---

const productLinks = [
  { title: 'Website Builder', href: '#', description: 'Create responsive websites', icon: Globe },
  { title: 'Cloud Platform', href: '#', description: 'Deploy and scale apps', icon: Layers },
  { title: 'Team Collaboration', href: '#', description: 'Tools to help teams work', icon: UserPlus },
  { title: 'Analytics', href: '#', description: 'Track website traffic', icon: BarChart },
  { title: 'Integrations', href: '#', description: 'Connect your apps', icon: Plug },
  { title: 'API', href: '#', description: 'Build custom integrations', icon: Code },
];

const companyLinks = [
  { title: 'About Us', href: '#', description: 'Learn our story', icon: Users },
  { title: 'Customer Stories', href: '#', description: 'Client success', icon: Star },
  { title: 'Partnerships', href: '#', description: 'Grow with us', icon: Handshake },
];

const companyLinks2 = [
  { title: 'Terms of Service', href: '#', icon: FileText },
  { title: 'Privacy Policy', href: '#', icon: Shield },
  { title: 'Refund Policy', href: '#', icon: RotateCcw },
  { title: 'Blog', href: '#', icon: Leaf },
  { title: 'Help Center', href: '#', icon: HelpCircle },
];

const WordmarkIcon = (props) => (
  <svg viewBox="0 0 84 24" fill="currentColor" {...props}>
    <path d="M12.297 0h1.789v5.441l-.961.016c-2.36.04-3.441.215-4.441.719-.836.414-1.278.879-1.895 1.976-.219.399-.535 1.02-.535 1.063 0 .02 1.285.027 3.918.027h3.914v5.113h-3.914c-2.54 0-3.918.008-3.918.028 0 .05.254.597.441.953.344.656.649 1.086 1.051 1.48.668.657 1.356.985 2.445 1.16.645.106 1.274.145 2.61.16l1.285.016v5.442l-2.055-.004a120 120 0 0 1-2.183-.016M16.469 14.715c0-5.504.011-9.04.031-9.29a5.54 5.54 0 0 1 1.527-3.48c.778-.82 1.922-1.457 3.118-1.734C21.915.035 22.422 0 24.39 0h1.652v4.914h-1.426c-1.324 0-1.445.004-1.644.055-.739.191-1.059.699-1.106 1.754l-.015.355h4.191v4.914h-4.184v11.602h-5.39Z" />
  </svg>
);