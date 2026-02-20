import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";

// valid roles: ['user', 'listener', 'admin']
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
       <div className="h-screen flex items-center justify-center">
          Loading authentication...
       </div>
    );
  }

  // 1. Not Logged In -> Go to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged In, but Wrong Role -> Go to "Unauthorized" or Dashboard
  // If allowedRoles is provided, checks if user.role is included.
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
     // Optional: You can create a dedicated /unauthorized page
     // For now, let's just bounce them to their appropriate dashboard
     if (user.role === 'listener') return <Navigate to="/listener/dashboard" replace />;
     if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
     return <Navigate to="/dashboard" replace />;
  }

  // 3. Authorized -> Render the Page
  return <Outlet />;
};

export default ProtectedRoute;