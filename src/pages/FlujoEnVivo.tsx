import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { api } from "../services/api";
import type { Pedido } from "../types/Pedido";
import "./FlujoEnVivo.css";

type StepState = "pending" | "running" | "confirmed" | "unverified" | "failed";
type Step = { title: string; detail: string; state: StepState };

const initialSteps: Step[] = [
  { title: "React + MSAL", detail: "Solicitud autenticada con access token", state: "pending" },
  { title: "BFF en AWS", detail: "Valida JWT y rol; reenvía el pedido", state: "pending" },
  { title: "MS Pedidos", detail: "Registra el pedido y devuelve HTTP 201", state: "pending" },
  { title: "RabbitMQ Operaciones", detail: "pedidos.exchange → pedidos.notify.queue", state: "pending" },
  { title: "MS Notificaciones", detail: "Consume el evento pedido.creado", state: "pending" },
];

const stateLabel: Record<StepState, string> = {
  pending: "Pendiente", running: "Procesando", confirmed: "Confirmado",
  unverified: "Por verificar", failed: "Error",
};

function currentDate() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function FlujoEnVivo() {
  const [cliente, setCliente] = useState("Prueba flujo visual");
  const [fecha, setFecha] = useState(currentDate);
  const [estado, setEstado] = useState("PENDIENTE");
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [working, setWorking] = useState(false);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<Array<{ id: number; nombre: string; precio: number }>>([]);
  const [catalogError, setCatalogError] = useState("");
  const [events, setEvents] = useState<Array<{ at: string; message: string }>>([]);

  const log = (message: string) => setEvents(prev => [{ at: new Date().toLocaleTimeString(), message }, ...prev]);

  useEffect(() => {
    let active = true;
    api.get<Array<{ id: number; nombre: string; precio: number }>>( "/catalog")
      .then(({ data }) => { if (active) setCatalog(data); })
      .catch(() => { if (active) setCatalogError("No fue posible consultar el catálogo."); });
    return () => { active = false; };
  }, []);

  async function crearPedido(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working || !cliente.trim()) return;
    setWorking(true);
    setPedido(null);
    setError("");
    setEvents([]);
    setSteps(initialSteps.map((s, i) => ({ ...s, state: i === 0 ? "running" : "pending" })));
    log("Solicitando POST /pedidos mediante el cliente HTTP autenticado");

    try {
      const response = await api.post<Pedido>("/pedidos", { cliente: cliente.trim(), fecha, estado });
      if (response.status !== 201 || typeof response.data?.id !== "number") {
        throw new Error("La API no devolvió HTTP 201 con un ID de pedido válido.");
      }
      const created = response.data;
      setPedido(created);
      setSteps(initialSteps.map((s, i) => ({
        ...s,
        state: i <= 2 ? "confirmed" : "unverified",
        detail: i === 2 ? `Pedido #${created.id} creado (HTTP ${response.status})` : s.detail,
      })));
      log(`HTTP ${response.status}: pedido #${created.id} guardado por MS Pedidos`);
      log("RabbitMQ y MS Notify: pendientes de comprobar en RabbitMQ Management / logs");
    } catch (cause) {
      const status = cause instanceof AxiosError ? cause.response?.status : undefined;
      const message = status ? `Error HTTP ${status}. Revisa la sesión, el túnel SSH y el BFF.`
        : cause instanceof Error ? cause.message : "No fue posible crear el pedido.";
      setError(message);
      setSteps(initialSteps.map((s, i) => ({ ...s, state: i === 0 ? "failed" : "pending" })));
      log(message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="flow-page">
      <div className="page-head">
        <span className="flow-eyebrow">OBSERVABILIDAD · PRUEBAS</span>
        <h1>Flujo de pedidos</h1>
        <p>Crea un pedido real y observa qué etapas están confirmadas y cuáles necesitan evidencia del broker.</p>
      </div>

      <div className="flow-banner">
        <span className="flow-dot" />
        <span>Modo real · usa el <strong>VITE_API_URL</strong> configurado y tu sesión MSAL</span>
      </div>

      <div className="flow-layout">
        <div className="card flow-form-card">
          <h2>Nuevo pedido</h2>
          <p>Se enviará a POST /pedidos del BFF. Este botón sí crea un registro.</p>
          <form onSubmit={crearPedido} className="flow-form">
            <label>Cliente<input value={cliente} onChange={e => setCliente(e.target.value)} required maxLength={120} /></label>
            <label>Fecha<input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required /></label>
            <label>Estado<select value={estado} onChange={e => setEstado(e.target.value)}>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="ENTREGADO">Entregado</option>
            </select></label>
            <button className="btn btn-primary" disabled={working} type="submit">{working ? "Creando..." : "Crear pedido y ejecutar flujo"}</button>
          </form>
          {error && <div className="alert" role="alert">{error}</div>}
          {pedido && <div className="flow-created" role="status"><strong>Pedido #{pedido.id} creado</strong><span>{pedido.cliente} · {pedido.estado}</span></div>}
          <div className="flow-subtle">Esta acción altera los datos de prueba del microservicio. H2 es temporal y puede reiniciarse.</div>
        </div>

        <div className="card flow-steps-card">
          <div className="flow-section-head"><h2>Recorrido técnico</h2><span>5 etapas</span></div>
          <div className="flow-steps">
            {steps.map((step, index) => (
              <div className={`flow-step flow-step--${step.state}`} key={step.title}>
                <div className="flow-step-number">{index + 1}</div>
                <div className="flow-step-body"><strong>{step.title}</strong><span>{step.detail}</span></div>
                <span className="flow-step-state">{stateLabel[step.state]}</span>
              </div>
            ))}
          </div>
          <div className="flow-note"><strong>Importante:</strong> HTTP 201 confirma la creación del pedido, pero no demuestra por sí solo la entrega o consumo en RabbitMQ. Los pasos 4 y 5 solo se marcarán como confirmados cuando haya telemetría real del backend.</div>
        </div>
      </div>

      <div className="flow-layout flow-secondary">
        <div className="card"><div className="flow-section-head"><h2>Eventos de esta prueba</h2><span>Cliente web</span></div>
          {events.length === 0 ? <p className="flow-empty">Crea un pedido para comenzar.</p> : <div className="flow-log">{events.map((event, i) => <div key={`${event.at}-${i}`}><time>{event.at}</time><span>{event.message}</span></div>)}</div>}
        </div>
        <div className="card"><div className="flow-section-head"><h2>Catálogo</h2><span>GET /catalog</span></div>
          {catalogError && <p className="flow-empty">{catalogError}</p>}
          {!catalogError && catalog.length === 0 && <p className="flow-empty">Consultando productos…</p>}
          <div className="flow-products">{catalog.map(p => <div key={p.id}><span>{p.nombre}</span><strong>${p.precio.toLocaleString("es-CL")}</strong></div>)}</div>
        </div>
      </div>
      <div className="card flow-manual"><h2>Comprobación de RabbitMQ</h2>
        <p>Después de crear el pedido, abre RabbitMQ Management y revisa <code>pedidos.notify.queue</code>. En la EC2 de microservicios consulta los logs de <code>ms-notify</code> para buscar el ID del nuevo pedido.</p>
        <code>docker logs --since=5m pedidos360-microservices-ms-notify-1</code>
        <p>Para automatizar la confirmación visual de las últimas dos etapas necesitaremos un endpoint de observabilidad autenticado en el backend, no credenciales de RabbitMQ en React.</p>
      </div>
    </section>
  );
}
