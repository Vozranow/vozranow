'use client';
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
      setStatus({ type: "success", message: res.data.message });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Something went wrong."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* ✅ Background Image */}
      <div className="absolute inset-0 bg-[url('/login-background.jpg')] bg-cover bg-center" />

      {/* Optional overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-3xl 
        bg-white/10 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Forgot password
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            We’ll send you a reset link
          </p>
        </div>

        {/* SUCCESS */}
        {status.type === "success" ? (
          <div className="text-center space-y-4">

            <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center mx-auto">
              <Mail size={22} className="text-white" />
            </div>

            <h3 className="text-lg font-medium text-white">
              Check your inbox
            </h3>

            <p className="text-sm text-gray-300">
              {status.message}
            </p>

            <Link
              to="/login"
              className="block mt-4 text-white font-medium hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        ) : (

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />

            {/* Error */}
            {status.type === "error" && (
              <div className="text-red-400 text-sm">
                {status.message}
              </div>
            )}

            {/* Button */}
            <button className="primary-btn">
              {loading ? "Sending..." : "Send reset link"}
            </button>

            {/* Back */}
            <Link
              to="/login"
              className="block text-center text-sm text-gray-300 hover:text-white"
            >
              ← Back to login
            </Link>

          </form>
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
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;