import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import API_PATHS from "@/utils/apiPaths";
import { useAuth } from "@/context/useAuth";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  /* ---------------- UPDATE PROFILE (username / email) ---------------- */

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        {
          username,
          email,
        }
      );

      setMessage(res.data.message || "Profile update initiated");
      refreshUser?.();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FORGOT PASSWORD ---------------- */

  const handleForgotPassword = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axiosInstance.post(
        API_PATHS.AUTH.FORGOT_PASSWORD,
        { email: user.email }
      );

      setMessage(res.data.message || "Reset link sent to email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {/* CURRENT USER INFO */}
      <div className="rounded border p-4 text-sm space-y-1">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {/* UPDATE PROFILE */}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <h2 className="font-medium">Update Profile</h2>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="Username"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="Email"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Update Profile
        </button>

        <p className="text-xs text-muted-foreground">
          Changing email will require OTP verification.
        </p>
      </form>

      {/* RESET PASSWORD */}
      <div className="space-y-3">
        <h2 className="font-medium">Password</h2>

        <button
          onClick={handleForgotPassword}
          disabled={loading}
          className="w-full rounded border px-4 py-2 hover:bg-muted disabled:opacity-50"
        >
          Send Password Reset Email
        </button>

        <p className="text-xs text-muted-foreground">
          You’ll receive a reset link on your email.
        </p>
      </div>

      {/* FEEDBACK */}
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

export default ProfilePage;
