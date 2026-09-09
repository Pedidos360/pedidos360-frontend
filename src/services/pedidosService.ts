import { api } from "./api";
import type { Pedido } from "../types/Pedido";

// Consumo del endpoint GET /pedidos vía API Gateway (SDD §18, §24).
// El JWT se adjunta automáticamente en el interceptor de api.ts.
export async function getPedidos(): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>("/pedidos");
  return data;
}
