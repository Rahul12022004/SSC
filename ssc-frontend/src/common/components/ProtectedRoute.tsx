import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/common/components/LoadingSpinner";

interface ProtectedRouteProps {
  requiredRole?: string;
  minRole?: number;
}

interface AuthUser {
  roleLevel: number;
  role: string;
}

function ProtectedRoute({ requiredRole, minRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" replace />;

  const authUser = user as AuthUser;

  if (requiredRole === "admin" && authUser.roleLevel < 10) {
    return <Navigate to="/" replace />;
  }

  if (minRole && authUser.roleLevel < minRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
