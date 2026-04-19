'use client';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance.js";
import API_PATHS from "../../utils/apiPaths.js";
import { useAuth } from "../../context/useAuth.js";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => setMounted(true), []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        username: form.name,
        email: form.email,
        password: form.password
      });
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.VERIFY_OTP, {
        email: form.email,
        otp: otp
      });

      if (res.data?.user) {
        login(res.data.user);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (isAuthenticated) {
    setTimeout(() => navigate("/dashboard"), 1000);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* ✅ Background Image */}
      <div className="absolute inset-0 bg-[url('/login-background.jpg')] bg-cover bg-center" />

      {/* Optional dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Glass Card */}
      <div
        className={`relative z-10 w-full max-w-md p-10 rounded-3xl 
        bg-white/15 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]
        transition-all duration-700
        ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {step === 1 ? "Create account" : "Verify email"}
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            {step === 1 ? "Start your journey with Solance" : `Code sent to ${form.email}`}
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-5">

            <input name="name" placeholder="Username" value={form.name} onChange={handleChange} className="input" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" />

            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} className="input pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-btn">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="input" />

            <button className="primary-btn">
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">

            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter code"
              className="input text-center text-2xl tracking-widest"
            />

            <button className="primary-btn">
              {loading ? "Verifying..." : "Verify"}
            </button>

            <div className="flex justify-between text-sm text-gray-300">
              <button onClick={() => setStep(1)}>Change Email</button>
              <button disabled={resendTimer > 0}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        {step === 1 && (
          <p className="text-center text-sm text-gray-300 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-white font-medium hover:underline">
              Login
            </Link>
          </p>
        )}
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

export default SignupPage;