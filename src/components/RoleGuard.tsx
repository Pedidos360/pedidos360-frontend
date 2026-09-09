import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type Role } from "../auth/authService";

interface Props {
  allowed: Role[];
  children: ReactNode;
}

// Guard por rol (SDD §15, §23): autenticado + rol correcto → vista;
// autenticado + rol incorrecto → 403 / Unauthorized.
export default function RoleGuard({ allowed, children }: Props) {
  const { hasRole } = useAuth();

  if (!hasRole(...allowed)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
