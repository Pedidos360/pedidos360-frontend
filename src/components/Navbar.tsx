import { Link } from "react-router-dom";
import { useAuth } from "../auth/authService";

// Navbar según rol (SDD §11.1, Paso 15): muestra enlaces
// de acuerdo a los roles del usuario y permite cerrar sesión.
export default function Navbar() {
  const { isAuthenticated, account, roles, hasRole, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar__links">
        <Link to="/home">Inicio</Link>
        <Link to="/pedidos">Pedidos</Link>
        {hasRole("Admin") && <Link to="/admin">Administración</Link>}
      </div>

      <div className="navbar__user">
        <span>
          {account?.name ?? account?.username}
          {roles.length > 0 && ` (${roles.join(", ")})`}
        </span>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </nav>
  );
}
