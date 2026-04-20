import { useAuth } from "../context/AuthContext";
import NotFound from "../pages/NotFound";

function ProtectedRoute({ children, minRole }) {
  const { user } = useAuth();

  // ❌ Not logged in → show NotFound
  if (!user) {
    return <NotFound />;
  }

  // ❌ Role not allowed → show NotFound
  if (minRole && user.roleLevel < minRole) {
    return <NotFound />;
  }

  // ✅ Allowed
  return children;
}

export default ProtectedRoute;