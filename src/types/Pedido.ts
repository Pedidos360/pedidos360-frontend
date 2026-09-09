// Modelo de pedido (SDD §18). Los campos exactos pueden adaptarse
// al modelo definido por el equipo de backend.
export interface Pedido {
  id: number;
  cliente: string;
  fecha: string;
  estado: string;
}
