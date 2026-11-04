import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { useAuth } from "../auth/authService";
import { getCatalogo, type Producto } from "../services/catalogService";
import { crearCompra } from "../services/compraService";
import "./Productos.css";

type Carrito = Record<number, number>;
const MAX_CANTIDAD = 10;
const MAX_LINEAS = 20;
const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Productos() {
  const { account } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<Carrito>({});
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cliente, setCliente] = useState(account?.name ?? "");
  const [correo, setCorreo] = useState(account?.username ?? "");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");
  const [compraExitosa, setCompraExitosa] = useState("");
  const envioEnCurso = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getCatalogo()
      .then((data) => {
        if (!cancelled) setProductos(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el catálogo. Comprueba el BFF y tu sesión.");
      })
      .finally(() => {
        if (!cancelled) setCargando(false);
      });
    return () => { cancelled = true; };
  }, []);

  const categorias = useMemo(
    () => ["Todas", ...new Set(productos.map((producto) => producto.categoria))],
    [productos]
  );
  const visibles = productos.filter(
    (producto) =>
      (categoria === "Todas" || producto.categoria === categoria) &&
      `${producto.nombre} ${producto.categoria}`
        .toLocaleLowerCase("es-CL")
        .includes(busqueda.toLocaleLowerCase("es-CL"))
  );
  const lineas = productos.filter((producto) => (carrito[producto.id] ?? 0) > 0);
  const cantidad = lineas.reduce((suma, producto) => suma + carrito[producto.id], 0);
  const total = lineas.reduce(
    (suma, producto) => suma + producto.precio * carrito[producto.id], 0
  );

  function cambiarCantidad(id: number, delta: number) {
    if (envioEnCurso.current) return;
    setErrorCompra("");
    setCompraExitosa("");
    const next = { ...carrito };
    const actual = next[id] ?? 0;

    if (delta > 0 && actual === 0 && Object.keys(next).length >= MAX_LINEAS) {
      setErrorCompra("Puedes seleccionar como máximo 20 productos diferentes.");
      return;
    }
    const nueva = Math.max(0, Math.min(MAX_CANTIDAD, actual + delta));
    if (nueva === 0) delete next[id];
    else next[id] = nueva;
    setCarrito(next);
  }

  async function confirmarCompra(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (envioEnCurso.current) return;
    setErrorCompra("");
    setCompraExitosa("");

    if (!cliente.trim() || !correo.trim() || !direccionEntrega.trim()) {
      setErrorCompra("Completa los datos de entrega.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setErrorCompra("Ingresa un correo electrónico válido.");
      return;
    }
    if (!lineas.length || lineas.length > MAX_LINEAS) {
      setErrorCompra("Selecciona entre 1 y 20 productos diferentes.");
      return;
    }
    const items = lineas.map((producto) => ({
      productoId: producto.id,
      cantidad: carrito[producto.id],
    }));
    if (items.some((item) => !Number.isInteger(item.cantidad) ||
      item.cantidad < 1 || item.cantidad > MAX_CANTIDAD)) {
      setErrorCompra("Cada producto debe tener entre 1 y 10 unidades.");
      return;
    }

    envioEnCurso.current = true;
    setEnviando(true);
    try {
      const pedido = await crearCompra({
        cliente: cliente.trim(),
        correo: correo.trim(),
        direccionEntrega: direccionEntrega.trim(),
        items,
      });
      setCarrito({});
      setCompraExitosa(
        `¡Compra registrada! Pedido #${pedido.id}. Estado: ${pedido.estado}.`
      );
    } catch (err) {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      if (status === 400) {
        setErrorCompra("El backend rechazó los productos o datos de la compra.");
      } else if (status === 401) {
        setErrorCompra("Debes iniciar sesión nuevamente.");
      } else if (status === 403) {
        setErrorCompra("Tu cuenta no tiene permisos para realizar esta compra.");
      } else if (status === 404 || status === 405) {
        setErrorCompra("La ruta de compra no está disponible en el BFF desplegado.");
      } else {
        setErrorCompra(
          "No se pudo confirmar el resultado. Revisa la lista de pedidos antes de reintentar para evitar duplicados."
        );
      }
    } finally {
      envioEnCurso.current = false;
      setEnviando(false);
    }
  }

  return (
    <section className="store-page">
      <header className="store-heading">
        <div className="store-heading__copy">
          <span className="store-eyebrow"><span className="store-eyebrow__line" /> COLECCIÓN / 2026</span>
          <h1>Tecnología para<br /><em>hacer más.</em></h1>
          <p>Una selección simple de esenciales para tu espacio de trabajo. Elige lo que necesitas, nosotros nos encargamos del resto.</p>
          <a className="store-heading__link" href="#catalogo">Explorar colección <span aria-hidden="true">↗</span></a>
        </div>
        <div className="store-hero-art" aria-hidden="true">
          <div className="store-hero-art__halo" />
          <div className="store-hero-art__screen"><span>P / 360</span><i /></div>
          <div className="store-hero-art__base" />
          <span className="store-hero-art__label">HECHO PARA TU DÍA A DÍA <span>↗</span></span>
        </div>
      </header>

      <div className="store-layout">
        <div className="store-main" id="catalogo">\n          <div className="store-section-head"><div><span className="store-section-kicker">EXPLORA</span><h2>El catálogo<span className="store-section-dot">.</span></h2></div><span className="store-collection-count">{productos.length} productos disponibles</span></div>
          <div className="store-filters">
            <input
              type="search"
              aria-label="Buscar productos"
              placeholder="Buscar por nombre o categoría..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <select
              aria-label="Filtrar categoría"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
            >
              {categorias.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </div>

          {cargando && <div className="store-empty">Cargando catálogo...</div>}
          {error && <div role="alert" className="store-error">{error}</div>}
          {!cargando && !error && visibles.length === 0 && (
            <div className="store-empty">No encontramos productos con esos filtros.</div>
          )}
          <div className="store-grid">
            {!cargando && !error && visibles.map((producto) => (
              <article className="store-card" key={producto.id}>
                <div className="store-illustration" aria-hidden="true">
                  {producto.categoria.toLocaleLowerCase("es-CL").includes("celular")
                    ? "📱"
                    : producto.categoria.toLocaleLowerCase("es-CL").includes("pantalla")
                      ? "🖥️" : "⌨️"}
                </div>
                <span className="store-category">{producto.categoria}</span>
                <h2>{producto.nombre}</h2>
                <div className="store-card__bottom"><strong>{CLP.format(producto.precio)}</strong><span>Precio unitario</span></div>
                <button
                  type="button"
                  className="store-add"
                  onClick={() => cambiarCantidad(producto.id, 1)}
                  disabled={enviando || (carrito[producto.id] ?? 0) >= MAX_CANTIDAD}
                >
                  Agregar al carrito <span aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="store-cart" aria-label="Carrito de compras">
          <div className="store-cart__head"><div><span className="store-section-kicker">TU SELECCIÓN</span><h2>Mi carrito<span className="store-section-dot">.</span></h2></div><span className="store-cart-count" aria-label={`${cantidad} unidades`}>{cantidad}</span></div>
          {lineas.length === 0
            ? <p className="store-muted">Tu selección está vacía. Agrega algo que te guste para comenzar.</p>
            : (
              <div className="store-cart-lines">
                {lineas.map((producto) => (
                  <div key={producto.id} className="store-cart-line">
                    <div>
                      <strong>{producto.nombre}</strong>
                      <small>{CLP.format(producto.precio)} c/u</small>
                    </div>
                    <div className="store-quantity">
                      <button
                        type="button"
                        disabled={enviando}
                        aria-label={`Quitar una unidad de ${producto.nombre}`}
                        onClick={() => cambiarCantidad(producto.id, -1)}
                      >−</button>
                      <span>{carrito[producto.id]}</span>
                      <button
                        type="button"
                        disabled={enviando || carrito[producto.id] >= MAX_CANTIDAD}
                        aria-label={`Agregar una unidad de ${producto.nombre}`}
                        onClick={() => cambiarCantidad(producto.id, 1)}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          <div className="store-total">
            <span>Total estimado</span>
            <strong>{CLP.format(total)}</strong>
          </div>

          <form className="store-checkout-form" onSubmit={confirmarCompra}>
            <div className="store-checkout-head"><span className="store-section-kicker">ÚLTIMO PASO</span><h3>Datos de entrega</h3><p>Cuéntanos dónde recibirás tu compra.</p></div>
            <label htmlFor="compra-cliente">Nombre del cliente</label>
            <input
              id="compra-cliente"
              required
              maxLength={150}
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              disabled={enviando}
              placeholder="Nombre completo"
            />
            <label htmlFor="compra-correo">Correo electrónico</label>
            <input
              id="compra-correo"
              type="email"
              required
              maxLength={200}
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              disabled={enviando}
              placeholder="correo@ejemplo.cl"
            />
            <label htmlFor="compra-direccion">Dirección de entrega</label>
            <textarea
              id="compra-direccion"
              required
              maxLength={300}
              rows={3}
              value={direccionEntrega}
              onChange={(event) => setDireccionEntrega(event.target.value)}
              disabled={enviando}
              placeholder="Calle, número, comuna y ciudad"
            />
            {errorCompra && <div className="store-error" role="alert">{errorCompra}</div>}
            {compraExitosa && <div className="store-success" role="status">{compraExitosa}</div>}
            <button
              className="store-checkout"
              type="submit"
              disabled={enviando || cargando || Boolean(error) || !lineas.length}
            >
              {enviando ? "Procesando compra..." : "Confirmar pedido →"}
            </button>
            <p className="store-note">
              Compra de demostración. El servidor valida los productos y calcula el total definitivo.
            </p>
          </form>
        </aside>
      </div>
    </section>
  );
}
