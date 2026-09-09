// Vista de pedidos (SDD §11.1, Paso 16).
// El consumo real de GET /pedidos vía API Gateway se implementa en la Fase 4
// (cliente HTTP con JWT). Por ahora es el contenedor de la vista.
export default function Pedidos() {
  return (
    <main className="page">
      <h1>Pedidos</h1>
      <p>Listado de pedidos (pendiente de conectar con el backend en la Fase 4).</p>
    </main>
  );
}
