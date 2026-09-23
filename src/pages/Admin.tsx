// Vista administrativa (SDD §15, §23): sólo accesible con rol Admin.
export default function Admin() {
  return (
    <section>
      <div className="page-head">
        <h1>Administración</h1>
        <p>Sección exclusiva para usuarios con rol Admin.</p>
      </div>
      <div className="card">
        <h3>Panel de administración</h3>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          Si ves esta página, tu token incluye el rol <strong>Admin</strong> y el
          BFF autorizó el acceso.
        </p>
      </div>
    </section>
  );
}
