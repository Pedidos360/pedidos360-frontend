import { Link } from "react-router-dom";

// Vista 403 (SDD §15): autenticado pero sin el rol necesario.
export default function Unauthorized() {
  return (
    <main className="login">
      <div className="login-card">
        <div className="login-logo" aria-hidden="true" style={{ background: "var(--err)" }}>!</div>
        <h1>403</h1>
        <p>Tu cuenta no tiene el rol necesario para ver esta sección.</p>
        <Link className="btn btn-primary btn-lg" to="/home">Volver al inicio</Link>
      </div>
    </main>
  );
}
