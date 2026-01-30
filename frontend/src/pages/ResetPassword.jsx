import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import API_PATHS from "@/utils/apiPaths";
import { useAuth } from "../context/useAuth";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!token) {
    return (
      <div className="p-6 text-center">
        <p>Invalid or missing reset token.</p>
      </div>
    );
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axiosInstance.post(
        API_PATHS.AUTH.RESET_PASSWORD,
        {
          token,
          newPassword,
        }
      );
      
      setMessage(res.data.message || "Password reset successful");


      // Redirect to login after a short delay
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md p-6 space-y-6 border rounded">
      <h1 className="text-xl font-semibold">Reset Password</h1>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded border p-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Reset Password
        </button>
      </form>

      {message && (
        <div className="rounded bg-green-100 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
