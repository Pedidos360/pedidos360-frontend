import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/authService";

// Navbar segÃºn rol (SDD Â§11.1, Paso 15): muestra enlaces de acuerdo a los
// roles del usuario y permite cerrar sesiÃ³n.
export default function Navbar() {
  const { isAuthenticated, account, roles, hasRole, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const nombre = account?.name ?? account?.username ?? "Usuario";
  const inicial = nombre.trim().charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="brand-dot" aria-hidden="true"></span>
        Pedidos360
      </div>

      <nav className="navbar__links">
        <NavLink to="/home">Inicio</NavLink>
        <NavLink to="/pedidos">Pedidos</NavLink>
        <NavLink to="/flujo">Flujo en vivo</NavLink>
        {hasRole("Admin") && <NavLink to="/admin">AdministraciÃ³n</NavLink>}
      </nav>

      <div className="navbar__user">
        <span className="avatar" aria-hidden="true">{inicial}</span>
        <div className="who">
          <span className="who__name">{nombre}</span>
          {roles.length > 0 && <span className="role-badge">{roles.join(" Â· ")}</span>}
        </div>
        <button className="btn btn-ghost" onClick={logout}>Salir</button>
      </div>
    </header>
  );
}

