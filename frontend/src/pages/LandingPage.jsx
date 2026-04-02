import { useNavigate } from 'react-router-dom'
import { useEffect,useState } from 'react'
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
  const [minWaitComplete, setMinWaitComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinWaitComplete(true);
    }, 2500); // 2.5 seconds (adjustable)
    return () => clearTimeout(timer);
  }, []);

  // 🟢 3. Update the redirect logic to wait for BOTH the backend and the timer
  useEffect(() => {
    if (!loading && isAuthenticated && minWaitComplete) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, loading, minWaitComplete, navigate]);

  // 🟢 4. Show the loader if the backend is loading OR the timer isn't done yet
  if (loading || !minWaitComplete) {
    return (
      <div className="h-screen w-full bg-[#FDFCF8] flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Soft, Calming Background Gradient (No aggressive pulsing) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#173F3A]/5 to-[#A3C6C0]/10 rounded-full blur-3xl"></div>

        {/* Minimalist Breathing/Spinning Loader */}
        <div className="relative flex items-center justify-center mb-10">
          {/* Outer elegant thin ring */}
          <div className="w-14 h-14 border-[3px] border-[#E8F4F1] border-t-[#173F3A] rounded-full animate-spin transition-all duration-500"></div>
          {/* Inner soft pulsing core (mimics breathing) */}
          <div className="absolute w-6 h-6 bg-[#173F3A]/10 rounded-full animate-pulse"></div>
        </div>

        {/* Branding & Text */}
        <div className="text-center relative z-10 flex flex-col items-center">
          <h2 className="font-serif text-2xl text-[#173F3A] tracking-[0.25em] mb-3 ml-1">
            SOLANCE
          </h2>
          <div className="flex items-center gap-1 text-sm font-medium text-[#8C877D] tracking-wide opacity-80 animate-pulse" style={{ animationDuration: '2s' }}>
            Preparing your space...
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
