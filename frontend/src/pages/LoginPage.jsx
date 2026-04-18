'use client';
import { useState , useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { useAuth } from "../context/useAuth.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, form);
      // Pass the user object to your context
      const userData = res.data.user; 

      // 2. Update Context (This happens in the background)
      login(userData);

      // 3. Use the LOCAL variable for checking role (NOT the state 'user')
      if (userData.role === "admin") {
         navigate("/admin/dashboard");
      } else if (userData.role === "listener") {
         navigate("/listener/dashboard");
      } else {
         navigate("/dashboard"); 
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeout;
    if (isAuthenticated) {
      timeout = setTimeout(() => {
        
        navigate("/dashboard"); 
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [isAuthenticated, navigate]);
  if (isAuthenticated) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
           <div className="flex items-center gap-2 text-[#3A6B48] font-medium animate-pulse">
              <Loader2 className="animate-spin" /> Redirecting...
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen w-full flex bg-[#FDFCF8]">
      
      {/* --- LEFT SIDE: Visual & Atmosphere --- */}
      {/* Hidden on mobile, visible on large screens */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#173F3A]">
        {/* Background Image */}
        <img 
          src="monstera-leaves-nature-background-wallpaper.jpg" 
          alt="Calm leaves shadow" 
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#173F3A] via-[#173F3A]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-[#E5F0EE]">
           <div className="font-serif text-3xl font-bold tracking-tight">Vozranow.</div>
           
           <div className="space-y-6 max-w-md">
              <blockquote className="font-serif text-4xl leading-tight">
                "There is no greater agony than bearing an untold story inside you."
              </blockquote>
              <cite className="block text-lg font-light opacity-80 not-italic">
                — Maya Angelou
              </cite>
           </div>

           <div className="text-sm opacity-60">
              © 2026 Vozranow. All rights reserved.
           </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: The Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        {/* Mobile Logo (Only shows on small screens) */}
        <div className="lg:hidden absolute top-8 left-8 font-serif text-2xl font-bold text-[#173F3A]">
           Vozranow.
        </div>

        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h1 className="font-serif text-4xl text-[#2D2A26]">Welcome back</h1>
            <p className="text-[#5C5954]">
              Please enter your details to access your space.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D2A26]" htmlFor="email">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-4 text-[#2D2A26] placeholder-[#8C877D] outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2D2A26]" htmlFor="password">Password</label>
                <Link 
                  to="/forgot-pass" 
                  className="text-sm font-medium text-[#3A6B48] hover:text-[#173F3A] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877D]">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#E8E6E1] bg-white py-3 pl-10 pr-12 text-[#2D2A26] placeholder-[#8C877D] outline-none transition-all focus:border-[#173F3A] focus:ring-1 focus:ring-[#173F3A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877D] hover:text-[#2D2A26] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                 <span className="block h-1.5 w-1.5 rounded-full bg-red-600"/> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-[#173F3A] py-3.5 text-white shadow-lg shadow-[#173F3A]/20 transition-all hover:bg-[#0F2926] hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Logging in...
                  </>
                ) : (
                  <>
                    Log in <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer / Sign Up */}
          <div className="text-center text-sm text-[#5C5954]">
            Don't have an account yet?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-[#173F3A] hover:underline"
            >
              Create free account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;