import { Navigate } from "react-router-dom";
import { useAuth, type Role } from "@/context/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({ children, role }: { children: ReactNode; role?: Role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}
