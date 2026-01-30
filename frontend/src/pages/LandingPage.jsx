import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/useAuth.js'
import Navbar from '../components/layout/Navbar'
import Hero from '../components/landing/Hero'
import Footer from '../components/landing/Footer.jsx'
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
      <Footer />
    </div>
  )
}

export default LandingPage
