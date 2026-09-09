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
      <h1>Pedidos360</h1>
      <p>Inicia sesión con tu cuenta corporativa (Microsoft Entra ID).</p>
      <button onClick={login}>Iniciar sesión</button>
    </main>
  );
}
