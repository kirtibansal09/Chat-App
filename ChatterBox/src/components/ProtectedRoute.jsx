import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  // Defensive: If user is undefined, don't render or redirect yet
  if (typeof user === 'undefined') return null;

  // If not logged in and not already on login page, redirect
  if ((!user || !user.id) && location.pathname !== "/auth/login") {
    return <Navigate to="/auth/login" replace />;
  }

  // If already on login page, don't redirect again (prevents loop)
  if ((!user || !user.id) && location.pathname === "/auth/login") {
    return null;
  }

  return children;
};

export default ProtectedRoute; 