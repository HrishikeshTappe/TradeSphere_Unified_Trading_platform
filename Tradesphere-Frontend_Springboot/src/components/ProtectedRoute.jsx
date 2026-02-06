import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isAuthenticated, requireAdmin = false, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required
  if (requireAdmin) {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      alert("Access Denied: Admin privileges required.");
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
