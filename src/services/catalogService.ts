import { api } from "./api";

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
}

export async function getCatalogo(): Promise<Producto[]> {
  const { data } = await api.get<unknown>("/catalog");

  if (!Array.isArray(data)) {
    console.error("Formato inesperado en GET /catalog", data);
    throw new Error(
      "GET /catalog no devolvió un arreglo de productos. Revisa el proxy de Vite y el túnel SSH al BFF."
    );
  }

  return data as Producto[];
}
