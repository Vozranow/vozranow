import './App.css'
import { ENV } from './utils/env.js'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { Routes, Route } from "react-router-dom";
import ResetPasswordPage from './pages/ResetPassword.jsx'

function App() {
  console.log(ENV.BACKEND_URL);
  return (
    <Routes>

      {/* ===== Public Routes ===== */}
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/register" element={<SignupPage />} />

      {/* ===== Protected Routes ===== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

    </Routes>
  )
}

export default App
