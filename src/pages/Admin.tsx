import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { cambiarEstadoProducto, getCatalogoAdmin, type Producto } from "../services/catalogService";
import "./Admin.css";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function mensajeError(error: unknown): string {
  const codigo = error instanceof AxiosError ? error.response?.status : undefined;
  if (codigo === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (codigo === 403) return "Tu cuenta no tiene permisos para administrar productos.";
  if (codigo === 404 || codigo === 405) return "La API de administración aún no está disponible en el BFF.";
  return "No fue posible completar la operación. Comprueba la conexión y vuelve a intentarlo.";
}

export default function Admin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "activos" | "inactivos">("todos");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setProductos(await getCatalogoAdmin());
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const activos = productos.filter((p) => p.activo === true).length;
  const inactivos = productos.filter((p) => p.activo === false).length;
  const visibles = useMemo(() => productos.filter((p) => {
    const coincideEstado = filtro === "todos" || (filtro === "activos" ? p.activo === true : p.activo === false);
    const termino = busqueda.trim().toLocaleLowerCase("es-CL");
    return coincideEstado && `${p.nombre} ${p.categoria} ${p.id}`.toLocaleLowerCase("es-CL").includes(termino);
  }), [productos, filtro, busqueda]);

  async function modificarEstado(producto: Producto) {
    if (actualizando !== null || typeof producto.activo !== "boolean") return;
    setActualizando(producto.id);
    setError("");
    setMensaje("");
    const nuevoEstado = !producto.activo;
    try {
      await cambiarEstadoProducto(producto.id, nuevoEstado);
      // Releer desde el servidor para evitar aparentar un cambio que no persistió.
      const actualizados = await getCatalogoAdmin();
      setProductos(actualizados);
      const guardado = actualizados.find((p) => p.id === producto.id);
      if (guardado?.activo !== nuevoEstado) {
        setError("La API respondió, pero el estado no coincide al volver a consultar. Comprueba el backend.");
      } else {
        setMensaje(`Estado actualizado: ${producto.nombre} ahora está ${nuevoEstado ? "activo" : "inactivo"}.`);
      }
    } catch (err) {
      setError(mensajeError(err));
      void cargar();
    } finally {
      setActualizando(null);
    }
  }

  return (
    <section className="admin-products">
      <div className="admin-products__intro">
        <div>
          <span className="admin-products__eyebrow">P360 / ADMINISTRACIÓN</span>
          <h1>Gestionar productos<span>.</span></h1>
          <p>Consulta todo el inventario y controla qué productos están disponibles para los clientes.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => void cargar()} disabled={cargando || actualizando !== null}>
          {cargando ? "Actualizando..." : "↻ Actualizar"}
        </button>
      </div>

      <div className="admin-products__stats">
        <div><span>Total productos</span><strong>{productos.length}</strong></div>
        <div><span>Activos</span><strong>{activos}</strong></div>
        <div><span>Inactivos</span><strong>{inactivos}</strong></div>
      </div>

      <div className="admin-products__panel">
        <div className="admin-products__toolbar">
          <div>
            <h2>Catálogo completo</h2>
            <p>Los productos inactivos permanecen aquí para que puedas reactivarlos.</p>
          </div>
          <div className="admin-products__filters">
            <input type="search" aria-label="Buscar productos" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            <select aria-label="Filtrar por estado" value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}>
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>
        {error && <div role="alert" className="admin-products__error">{error}</div>}
        {mensaje && <div role="status" className="admin-products__success">{mensaje}</div>}
        {cargando ? <p className="admin-products__empty">Cargando productos...</p> :
          visibles.length === 0 ? <p className="admin-products__empty">No hay productos para mostrar.</p> :
          <div className="admin-products__table-wrap">
            <table className="admin-products__table">
              <thead><tr><th>ID</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>{visibles.map((producto) => (
                <tr key={producto.id}>
                  <td className="admin-products__id">#{producto.id}</td>
                  <td><strong>{producto.nombre}</strong></td>
                  <td>{producto.categoria}</td>
                  <td>{CLP.format(producto.precio)}</td>
                  <td><span className={`admin-products__status ${producto.activo ? "admin-products__status--active" : "admin-products__status--inactive"}`}>
                    {producto.activo ? "Activo" : "Inactivo"}
                  </span></td>
                  <td>
                    <button type="button" className="admin-products__toggle" disabled={actualizando !== null} aria-label={`${producto.activo ? "Desactivar" : "Activar"} ${producto.nombre}`} onClick={() => void modificarEstado(producto)}>
                      {actualizando === producto.id ? "Guardando..." : producto.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>}
      </div>
    </section>
  );
}
