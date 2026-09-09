// Vista administrativa (SDD §15, §23): sólo accesible con rol Admin.
export default function Admin() {
  return (
    <main className="page">
      <h1>Administración</h1>
      <p>Sección exclusiva para usuarios con rol Admin.</p>
    </main>
  );
}
