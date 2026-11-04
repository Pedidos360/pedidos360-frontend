import { api } from "./api";

export interface CompraItemRequest {
  productoId: number;
  cantidad: number;
}

export interface CrearCompraRequest {
  cliente: string;
  correo: string;
  direccionEntrega: string;
  items: CompraItemRequest[];
}

export interface CompraResponse {
  id: number;
  cliente: string;
  estado: string;
  fecha?: string;
  total?: number;
}

export async function crearCompra(request: CrearCompraRequest): Promise<CompraResponse> {
  const { data } = await api.post<CompraResponse>("/pedidos/compra", request);
  return data;
}
