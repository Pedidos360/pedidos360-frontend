import { useMemo, useState } from "react";
import "./Tienda.css";

type ProductoDemo = {
  id: string;
  nombre: string;
  marca: string;
  memoria: string;
  color: string;
  precio: number;
  descripcion: string;
  etiqueta?: string;
  tono: string;
};
type ItemCarrito = { productoId: string; cantidad: number };
type PedidoDemo = {
  id: string;
  fecha: string;
  nombre: string;
  correo: string;
  direccion: string;
  total: number;
  items: { nombre: string; cantidad: number; precio: number }[];
  estado: "COMPRA_SIMULADA";
};

// Datos ficticios. Se sustituirán por GET /catalog al conectar ms-catalog.
const PRODUCTOS: ProductoDemo[] = [
  { id: "nova-x", nombre: "Nova X Pro", marca: "Nova", memoria: "256 GB", color: "Grafito", precio: 799990, descripcion: "Pantalla OLED de 6,7 pulgadas · Cámara de 50 MP", etiqueta: "Destacado", tono: "violeta" },
  { id: "orbit-s", nombre: "Orbit S24", marca: "Orbit", memoria: "128 GB", color: "Azul noche", precio: 449990, descripcion: "Pantalla AMOLED · Batería de larga duración", etiqueta: "Popular", tono: "azul" },
  { id: "pulse-lite", nombre: "Pulse Lite 5G", marca: "Pulse", memoria: "128 GB", color: "Plata", precio: 229990, descripcion: "Conectividad 5G · 128 GB de almacenamiento", tono: "plata" },
  { id: "nova-air", nombre: "Nova Air", marca: "Nova", memoria: "256 GB", color: "Verde", precio: 549990, descripcion: "Diseño delgado · Cámara ultra gran angular", tono: "verde" },
  { id: "orbit-max", nombre: "Orbit Max", marca: "Orbit", memoria: "512 GB", color: "Negro", precio: 999990, descripcion: "Pantalla de gran tamaño · Almacenamiento amplio", tono: "negro" },
  { id: "pulse-pro", nombre: "Pulse Pro", marca: "Pulse", memoria: "256 GB", color: "Coral", precio: 359990, descripcion: "Carga rápida · Pantalla de 120 Hz", tono: "coral" },
];
const STORAGE_CART = "pedidos360_demo_cart_v1";
const STORAGE_ORDERS = "pedidos360_demo_orders_v1";
function leer<T>(clave: string, respaldo: T): T {
  try { const valor = localStorage.getItem(clave); return valor ? JSON.parse(valor) as T : respaldo; }
  catch { return respaldo; }
}
const clp = (valor: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(valor);
const codigo = () => `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function Tienda() {
  const [busqueda, setBusqueda] = useState("");
  const [marca, setMarca] = useState("Todas");
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => leer(STORAGE_CART, []));
  const [pedidos, setPedidos] = useState<PedidoDemo[]>(() => leer(STORAGE_ORDERS, []));
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [pedidoFinal, setPedidoFinal] = useState<PedidoDemo | null>(null);
  const [verHistorial, setVerHistorial] = useState(false);

  const filtrados = useMemo(() => PRODUCTOS.filter(p =>
    (marca === "Todas" || p.marca === marca) &&
    `${p.nombre} ${p.marca} ${p.descripcion}`.toLowerCase().includes(busqueda.toLowerCase().trim())
  ), [marca, busqueda]);
  const detalles = carrito.flatMap(item => {
    const producto = PRODUCTOS.find(p => p.id === item.productoId);
    return producto ? [{ ...item, producto }] : [];
  });
  const unidades = carrito.reduce((n, x) => n + x.cantidad, 0);
  const total = detalles.reduce((n, x) => n + x.producto.precio * x.cantidad, 0);

  function guardarCarrito(nuevo: ItemCarrito[]) { setCarrito(nuevo); localStorage.setItem(STORAGE_CART, JSON.stringify(nuevo)); }
  function agregar(id: string) {
    const existe = carrito.find(x => x.productoId === id);
    guardarCarrito(existe ? carrito.map(x => x.productoId === id ? { ...x, cantidad: x.cantidad + 1 } : x) : [...carrito, { productoId: id, cantidad: 1 }]);
    setMostrarCarrito(true);
  }
  function cambiarCantidad(id: string, delta: number) {
    guardarCarrito(carrito.map(x => x.productoId === id ? { ...x, cantidad: x.cantidad + delta } : x).filter(x => x.cantidad > 0));
  }
  function confirmar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!detalles.length || !nombre.trim() || !correo.trim() || !direccion.trim()) return;
    const nuevo: PedidoDemo = {
      id: codigo(), fecha: new Date().toISOString(), nombre: nombre.trim(), correo: correo.trim(), direccion: direccion.trim(),
      total, items: detalles.map(x => ({ nombre: x.producto.nombre, cantidad: x.cantidad, precio: x.producto.precio })),
      estado: "COMPRA_SIMULADA",
    };
    const nuevos = [nuevo, ...pedidos];
    setPedidos(nuevos); localStorage.setItem(STORAGE_ORDERS, JSON.stringify(nuevos));
    guardarCarrito([]); setPedidoFinal(nuevo); setCheckout(false); setMostrarCarrito(false);
  }

  return (
    <div className="shop">
      <div className="shop-notice"><span className="shop-notice-dot" /> DEMOSTRACIÓN ACADÉMICA — Sin compras, pagos ni envíos reales</div>
      <div className="shop-hero">
        <div>
          <div className="shop-eyebrow">PEDIDOS360 / MOBILE STORE</div>
          <h1>Tu próximo celular,<br /><span>en un solo lugar.</span></h1>
          <p>Explora nuestra colección ficticia de smartphones y descubre cómo funciona el proceso de compra de Pedidos360.</p>
          <button className="shop-hero-button" onClick={() => document.getElementById("catalogo-celulares")?.scrollIntoView({ behavior: "smooth" })}>Explorar catálogo →</button>
        </div>
        <div className="shop-hero-art" aria-hidden="true"><div className="shop-device shop-device-back"><div className="shop-cameras">● ●<br />●</div></div><div className="shop-device shop-device-front"><div className="shop-island" /><div className="shop-screen-clock">09:41</div><div className="shop-screen-orb" /></div></div>
      </div>

      <div className="shop-heading" id="catalogo-celulares">
        <div><div className="shop-eyebrow">CATÁLOGO</div><h2>Encuentra tu próximo equipo</h2><p>Modelos y precios ilustrativos para esta simulación.</p></div>
        <div className="shop-heading-actions"><button className="shop-secondary" onClick={() => setVerHistorial(v => !v)}>Mis compras de prueba ({pedidos.length})</button><button className="shop-cart-trigger" onClick={() => { setMostrarCarrito(true); setPedidoFinal(null); }}>🛒 Carrito <span>{unidades}</span></button></div>
      </div>

      {verHistorial && <section className="shop-history" aria-label="Historial de compras de prueba"><h3>Compras guardadas en este navegador</h3>{pedidos.length === 0 ? <p>Aún no tienes compras simuladas.</p> : pedidos.map(p => <div key={p.id} className="shop-history-row"><span><strong>{p.id}</strong><small>{new Date(p.fecha).toLocaleString("es-CL")} · {p.items.length} productos</small></span><span><strong>{clp(p.total)}</strong><small>Compra simulada · Sin envío real</small></span></div>)}</section>}

      <div className="shop-filters"><label className="shop-search"><span>⌕</span><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar celulares..." aria-label="Buscar celulares" /></label><div className="shop-filter-buttons">{["Todas", "Nova", "Orbit", "Pulse"].map(x => <button key={x} className={marca === x ? "active" : ""} onClick={() => setMarca(x)}>{x}</button>)}</div></div>
      <div className="shop-grid">{filtrados.map(p => <article className="shop-product" key={p.id}><div className={`shop-product-art shop-tone-${p.tono}`}>{p.etiqueta && <span className="shop-product-tag">{p.etiqueta}</span>}<div className="shop-phone" aria-hidden="true"><div className="shop-phone-camera">● ●<br />●</div></div></div><div className="shop-product-info"><span className="shop-product-brand">{p.marca.toUpperCase()} · {p.memoria}</span><h3>{p.nombre}</h3><p>{p.descripcion}</p><div className="shop-product-bottom"><div><strong>{clp(p.precio)}</strong><small>{p.color}</small></div><button onClick={() => agregar(p.id)} aria-label={`Agregar ${p.nombre} al carrito`}>Agregar +</button></div></div></article>)}</div>
      {filtrados.length === 0 && <p className="shop-empty">No encontramos equipos para tu búsqueda.</p>}

      {pedidoFinal && <div className="shop-overlay" role="presentation" onMouseDown={e => { if(e.target === e.currentTarget) setPedidoFinal(null); }}><section className="shop-panel shop-success" role="dialog" aria-modal="true" aria-label="Pedido simulado confirmado"><div className="shop-check">✓</div><h2>¡Compra simulada realizada!</h2><p>Tu pedido de demostración fue guardado **solo en este navegador**. No se cobró dinero, no se envió ningún producto ni se mandó un correo.</p><div className="shop-summary-line"><span>Número de pedido</span><strong>{pedidoFinal.id}</strong></div><div className="shop-summary-line"><span>Total ficticio</span><strong>{clp(pedidoFinal.total)}</strong></div><button className="shop-primary shop-full" onClick={() => setPedidoFinal(null)}>Volver a la tienda</button></section></div>}
      {mostrarCarrito && <div className="shop-overlay" role="presentation" onMouseDown={e => { if(e.target === e.currentTarget) { setMostrarCarrito(false); setCheckout(false); } }}><aside className="shop-panel" role="dialog" aria-modal="true" aria-label="Carrito de compras"><div className="shop-panel-top"><div><span className="shop-eyebrow">PEDIDOS360</span><h2>{checkout ? "Finalizar compra ficticia" : "Tu carrito"}</h2></div><button className="shop-close" onClick={() => { setMostrarCarrito(false); setCheckout(false); }} aria-label="Cerrar carrito">×</button></div>{!checkout ? <><div className="shop-panel-content">{detalles.length === 0 ? <p className="shop-empty">Tu carrito está vacío.</p> : detalles.map(x => <div className="shop-cart-item" key={x.productoId}><div className={`shop-cart-thumb shop-tone-${x.producto.tono}`}>📱</div><div className="shop-cart-item-info"><strong>{x.producto.nombre}</strong><small>{x.producto.memoria} · {clp(x.producto.precio)}</small><div className="shop-qty"><button onClick={() => cambiarCantidad(x.productoId, -1)} aria-label="Quitar unidad">−</button><span>{x.cantidad}</span><button onClick={() => cambiarCantidad(x.productoId, 1)} aria-label="Agregar unidad">+</button></div></div><strong>{clp(x.producto.precio * x.cantidad)}</strong></div>)}</div><div className="shop-panel-foot"><div className="shop-total"><span>Total</span><strong>{clp(total)}</strong></div><small>Simulación: sin cobros ni despachos reales.</small><button className="shop-primary shop-full" disabled={!detalles.length} onClick={() => setCheckout(true)}>Continuar compra ficticia →</button></div></> : <form onSubmit={confirmar} className="shop-form"><p>Estos datos se guardan únicamente en el almacenamiento de este navegador. Para probar, utiliza datos ficticios.</p><label>Nombre de prueba<input required maxLength={80} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Cliente de prueba" /></label><label>Correo de prueba<input required type="email" maxLength={120} value={correo} onChange={e => setCorreo(e.target.value)} placeholder="cliente@ejemplo.com" /></label><label>Dirección ficticia<input required maxLength={150} value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Calle Demo 123, Ciudad" /></label><div className="shop-total"><span>Total simulado</span><strong>{clp(total)}</strong></div><button className="shop-primary shop-full" type="submit">Confirmar compra ficticia</button><button className="shop-secondary shop-full" type="button" onClick={() => setCheckout(false)}>Volver al carrito</button></form>}</aside></div>}
    </div>
  );
}
