import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/authService";

interface Props {
  children: ReactNode;
}

// Ruta protegida: exige sesión iniciada (SDD §15).
// Si no está autenticado, redirige a /login recordando el destino.
export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
