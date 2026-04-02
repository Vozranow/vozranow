import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import SolanceLoader from "../layout/SolanceLoader.jsx";

// valid roles: ['user', 'listener', 'admin']
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SolanceLoader/>
  }

  // 1. Not Logged In -> Go to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged In, but Wrong Role -> Go to "Unauthorized" or Dashboard
  // If allowedRoles is provided, checks if user.role is included.
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
     // Redirect users back to their specific homebases if they wander into the wrong tier
     if (user.role === 'manager' || user.role === 'founder') {
         return <Navigate to="/manager/dashboard" replace />;
     }
     if (user.role === 'admin') {
         return <Navigate to="/admin/dashboard" replace />;
     }
     if (user.role === 'listener') {
         return <Navigate to="/listener/dashboard" replace />;
     }
     
     // Default fallback for regular users
     return <Navigate to="/dashboard" replace />;
  }

  // 3. Authorized -> Render the Page
  return <Outlet />;
};

export default ProtectedRoute;