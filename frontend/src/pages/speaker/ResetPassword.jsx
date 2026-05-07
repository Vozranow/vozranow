'use client';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!token) {
      setStatus({ type: "error", message: "Invalid or missing reset token." });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        token: token,
        newPassword: form.newPassword
      });

      setStatus({ type: "success", message: "Password reset successfully!" });

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to reset password."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* ✅ Background Image */}
      <div className="absolute inset-0 bg-[url('/login-background.jpg')] bg-cover bg-center" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-3xl 
        bg-white/10 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Reset Password
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            Choose a new password
          </p>
        </div>

        {status.type === 'success' ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="text-green-400" size={48} />
            <h3 className="text-lg text-white font-medium">All Set!</h3>
            <p className="text-gray-300 text-sm">
              Password updated. Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {!token && (
              <div className="text-red-400 text-sm text-center">
                Invalid or missing token
              </div>
            )}

            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={form.newPassword}
                disabled={!token}
                onChange={(e) => setForm({...form, newPassword: e.target.value})}
                className="input pr-10"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                disabled={!token}
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
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

            {status.type === 'error' && (
              <div className="text-red-400 text-sm text-center">
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="primary-btn"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Updating...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
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

export default ResetPasswordPage;