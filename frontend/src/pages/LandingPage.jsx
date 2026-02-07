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
        return <div className="h-screen flex items-center justify-center">Loading session...</div>;
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
