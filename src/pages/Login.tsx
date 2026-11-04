import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/authService";

export default function Login() {
  const { isAuthenticated, login } = useAuth();

  // Si ya hay sesión, no tiene sentido mostrar el login.
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="login">
      <div className="login-card">
        <div className="login-logo" aria-hidden="true">P<span>●</span></div>
        <h1>Pedidos360</h1>
        <p>Tu espacio para comprar y gestionar pedidos de forma simple.</p>
        <button className="btn btn-primary btn-lg" onClick={login}>
          Continuar con Microsoft →
        </button>
        <p className="login-hint">Acceso corporativo con Microsoft Entra ID</p>
      </div>
    </main>
  );
}
