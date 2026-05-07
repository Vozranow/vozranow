'use client';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { useAuth } from "../context/useAuth.js";
import loginpg from "../assets/login-background.jpg";
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, form);
      const userData = res.data.user;

      login(userData);

      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "listener") {
        navigate("/listener/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    setTimeout(() => navigate("/dashboard"), 1000);
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex items-center gap-2 text-white animate-pulse">
          <Loader2 className="animate-spin" />
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* ✅ Background Image */}
      <div className="absolute inset-0  bg-cover bg-center" style={{ backgroundImage: `url(${loginpg})` }} />

      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Glass Card */}
      <div
        className={`relative z-10 w-full max-w-md p-10 rounded-3xl 
        bg-white/10 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]
        transition-all duration-700
        ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            Log in to continue your journey
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="icon-btn"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Link
            to="/forgot-pass"
            className="block text-sm text-gray-300 text-right hover:text-white transition"
          >
            Forgot password?
          </Link>

          <button className="primary-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-300 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-white font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Styles */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          transition: all 0.25s ease;
        }

        .input::placeholder {
          color: rgba(255,255,255,0.4);
        }

        .input:focus {
          outline: none;
          border-color: rgba(163,198,192,0.6);
          box-shadow: 0 0 0 2px rgba(163,198,192,0.2);
          background: rgba(255,255,255,0.12);
        }

        .primary-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          background: linear-gradient(135deg, #A3C6C0, #6FAEA6);
          color: #0F2F2B;
          font-weight: 600;
          transition: all 0.25s ease;
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }

        .icon-btn {
          position: absolute;
          right: 12px;
          top: 12px;
          color: rgba(255,255,255,0.6);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;