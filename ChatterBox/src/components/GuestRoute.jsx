import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const GuestRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  if (user && user.id) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default GuestRoute; 