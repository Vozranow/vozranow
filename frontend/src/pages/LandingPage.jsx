import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/useAuth.js'
import Navbar from '../components/layout/Navbar'
import Hero from '../components/landing/Hero'
import Footer from '../components/landing/Footer.jsx'
import Whatwedo from '../components/landing/Whatwedo.jsx'
import HowitWorks from '../components/landing/HowitWorks.jsx'
import WhatWeOffer from '../components/landing/WhatWeOffer.jsx'
import ImpactStats from '../components/landing/ImpactStats.jsx'
import SolanceVsTraditional from '../components/landing/SolanceVsTraditional.jsx'
import FAQsection from '../components/landing/FAQsection.jsx'
const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

 if (loading) {
    return (
      <div className="h-screen w-full bg-[#FDFCF8] flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Soft Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal-100/40 rounded-full blur-3xl animate-pulse"></div>

        {/* The "Blooming Lotus" Block Loader */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="grid grid-cols-2 gap-1.5 rotate-45">
            <div 
              className="w-6 h-6 bg-[#173F3A] rounded-tl-full animate-pulse shadow-sm" 
              style={{ animationDuration: '1.5s' }}
            ></div>
            <div 
              className="w-6 h-6 bg-teal-600 rounded-tr-full animate-pulse shadow-sm" 
              style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}
            ></div>
            <div 
              className="w-6 h-6 bg-teal-500 rounded-bl-full animate-pulse shadow-sm" 
              style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}
            ></div>
            <div 
              className="w-6 h-6 bg-[#0F2926] rounded-br-full animate-pulse shadow-sm" 
              style={{ animationDuration: '1.5s', animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>

        {/* Branding & Text */}
        <div className="text-center relative z-10 flex flex-col items-center">
          <h2 className="font-serif text-2xl text-[#173F3A] font-bold tracking-widest mb-2">
            SOLANCE
          </h2>
          <div className="flex items-center gap-1 text-sm text-[#8C877D]">
            <span>Preparing your space</span>
            <span className="flex gap-0.5">
              <span className="animate-[bounce_1s_infinite_-0.3s]">.</span>
              <span className="animate-[bounce_1s_infinite_-0.15s]">.</span>
              <span className="animate-[bounce_1s_infinite]">.</span>
            </span>
          </div>
        </div>

      </div>
    );
  }
  return (
    <div>
      <Navbar />
      <Hero />
      <Whatwedo/>
      <HowitWorks/>
      <WhatWeOffer/>
      <ImpactStats/>
      <SolanceVsTraditional/>
      <FAQsection/>
      <Footer />
    </div>
  )
}

export default LandingPage
