import { api } from "./api";

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
}

export async function getCatalogo(): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>("/catalog");
  return data;
}
