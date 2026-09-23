import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getPedidos } from "../services/pedidosService";
import type { Pedido } from "../types/Pedido";

// Vista de pedidos (SDD §11.1, Paso 16): consume GET /pedidos a través del
// cliente HTTP centralizado y maneja los errores 401/403/500 (SDD §38).
export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPedidos()
      .then((data) => {
        if (!cancelled) setPedidos(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err instanceof AxiosError ? err.response?.status : undefined;
        switch (status) {
          case 401:
            setError("No autorizado (401). Vuelve a iniciar sesión.");
            break;
          case 403:
            setError("No tienes permisos para ver los pedidos (403).");
            break;
          default:
            setError("No se pudieron cargar los pedidos. Intenta nuevamente.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const badgeClass = (estado: string) =>
    "badge badge--" + estado.toLowerCase().replace(/\s+/g, "_");

  return (
    <section>
      <div className="page-head">
        <h1>Pedidos</h1>
        <p>Listado de pedidos obtenido desde el backend.</p>
      </div>

      {loading && (
        <div className="card">
          <div className="state">
            <div className="spinner" aria-hidden="true"></div>
            <span>Cargando pedidos…</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="alert" role="alert">
          <strong>Error.</strong> {error}
        </div>
      )}

      {!loading && !error && (
        pedidos.length === 0 ? (
          <div className="card">
            <div className="state">No hay pedidos registrados.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="id">#{pedido.id}</td>
                    <td>{pedido.cliente}</td>
                    <td>{pedido.fecha}</td>
                    <td><span className={badgeClass(pedido.estado)}>{pedido.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
}
