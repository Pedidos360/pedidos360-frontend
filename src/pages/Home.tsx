import { useAuth } from "../auth/authService";

export default function Home() {
  const { account, roles } = useAuth();
  const nombre = account?.name ?? account?.username ?? "Usuario";

  return (
    <section>
      <div className="page-head">
        <h1>Bienvenido, {nombre.split(" ")[0]} 👋</h1>
        <p>Este es el panel de Pedidos360. Usa el menú para consultar los pedidos.</p>
      </div>

      <div className="card">
        <h3>Tu sesión</h3>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>{account?.username}</p>
        {roles.length > 0 ? (
          <div className="chips">
            {roles.map((r) => (
              <span className="chip" key={r}>{r}</span>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)", marginTop: 10 }}>
            Tu cuenta no tiene roles asignados.
          </p>
        )}
      </div>
    </section>
  );
}
