import { Link } from "react-router-dom";

// Vista 403 (SDD §15): autenticado pero sin el rol necesario.
export default function Unauthorized() {
  return (
    <main className="page">
      <h1>403 · Acceso no autorizado</h1>
      <p>Tu cuenta no tiene el rol necesario para ver esta sección.</p>
      <Link to="/home">Volver al inicio</Link>
    </main>
  );
}
