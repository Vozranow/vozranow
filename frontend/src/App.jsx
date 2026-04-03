import './App.css'
import { ENV } from './utils/env.js'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/speaker/SignupPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import ProfilePage from './pages/speaker/ProfilePage.jsx'
import { Routes, Route } from "react-router-dom";
import ResetPasswordPage from './pages/speaker/ResetPassword.jsx'
import ForgotPasswordPage from './pages/speaker/ForgetPassword.jsx'
import Dashboard from './pages/speaker/Dashboard.jsx'
import AddMoneyPage from './pages/speaker/AddMoneyPage.jsx'
import SessionBookingPage from './pages/speaker/SessionBookingPage.jsx'
import ListenerLandingPage from './pages/ListenerLandingPage.jsx'
import ListenerDashboard from './pages/listener/ListenerDashboard.jsx'
import { Toaster } from "react-hot-toast";
import ListenerProfile from './pages/listener/ListenerProfile.jsx'
import LobbyPage from './pages/LobbyPage.jsx'
import FeedbackPage from './pages/speaker/FeedbackPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProfilePage from './pages/admin/AdminProfile.jsx'
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx'
import ManagerFinancials from './pages/manager/ManagerFinancials.jsx'
import ListenerDirectory from './pages/manager/ListenerDirect.jsx'
import ManagerSessionLogs from './pages/manager/ManagerSessionLogs.jsx'
import ManagerAssignSession from './pages/manager/ManagerAssignSession.jsx'

function App() {
  console.log(ENV.BACKEND_URL);
  return (
    <>

    <Toaster 
        position="top-center" 
        reverseOrder={false} 
      />
    <Routes>

      {/* ===== Public Routes ===== */}
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/listener-landing" element={<ListenerLandingPage/>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-pass" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/register" element={<SignupPage />} />

      {/* ===== Protected Routes ===== */}
      <Route element={<ProtectedRoute allowedRoles={['user']}/>}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-money" element={<AddMoneyPage />} />
        <Route path="/book-session" element={<SessionBookingPage />} />
        <Route path="/session/:sessionId/feedback" element={<FeedbackPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['listener']} />}>
        <Route path="/listener/dashboard" element={<ListenerDashboard />} />
        <Route path="/listener/profile" element={<ListenerProfile />} />
      </Route>

      {/* ===== Shared Protected Routes (User & Listener) ===== */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'listener']} />}>
        <Route path="/session/:sessionId/lobby" element={<LobbyPage />} />
      </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfilePage />}/>
        </Route>

        {/* manager route */}

        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/financials" element={<ManagerFinancials />} />
          <Route path="/manager/listeners" element={<ListenerDirectory />} />
          
          <Route path="/manager/sessions" element={<ManagerSessionLogs />} />
          <Route path="/manager/assign" element={<ManagerAssignSession />} />
        </Route>

    </Routes>
    </>
    
  )
}

export default App
