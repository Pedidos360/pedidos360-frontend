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
        if (!cancelled) {
          setPedidos(data);
        }
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
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page">
      <h1>Pedidos</h1>

      {loading && <p>Cargando pedidos...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        pedidos.length === 0 ? (
          <p>No hay pedidos registrados.</p>
        ) : (
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
                  <td>{pedido.id}</td>
                  <td>{pedido.cliente}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </main>
  );
}
