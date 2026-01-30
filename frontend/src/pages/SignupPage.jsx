import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { useAuth } from "../context/useAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("register"); // register | otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  /* ======================
     HANDLE INPUTS
  ====================== */
  const handleChange = (e) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ======================
     REGISTER → SEND OTP
  ====================== */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post(
        API_PATHS.AUTH.REGISTER,
        registerData
      );

      // Backend says: OTP sent
      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     VERIFY OTP
  ====================== */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post(
        API_PATHS.AUTH.VERIFY_OTP,
        {
          email: registerData.email,
          otp,
        }
      );

      /**
       * Backend should:
       * - verify OTP
       * - create user
       * - set cookies
       * - return user
       */
      login(res.data.user);
      navigate("/");
    } catch (err) {
        console.log(err)
      setError(
        err.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {step === "register" ? "Create account" : "Verify email"}
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        {step === "register" && (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={registerData.username}
              onChange={handleChange}
              required
              className="w-full mb-3 px-3 py-2 border rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleChange}
              required
              className="w-full mb-3 px-3 py-2 border rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleChange}
              required
              className="w-full mb-4 px-3 py-2 border rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Register"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-sm text-gray-600 mb-3">
              Enter the OTP sent to <b>{registerData.email}</b>
            </p>

            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full mb-4 px-3 py-2 border rounded text-center tracking-widest"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
