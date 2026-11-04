import { api } from "./api";

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
}

type CatalogoPayload = Producto[] | { productos?: Producto[]; content?: Producto[]; data?: Producto[] };

export async function getCatalogo(): Promise<Producto[]> {
  const { data } = await api.get<CatalogoPayload>("/catalog");
  const lista: unknown = Array.isArray(data)
    ? data
    : data?.productos ?? data?.content ?? data?.data;

  if (!Array.isArray(lista)) {
    throw new Error("El catálogo no devolvió una lista de productos.");
  }
  if (!lista.every((item: unknown) =>
    typeof item === "object" && item !== null &&
    typeof (item as Producto).id === "number" &&
    typeof (item as Producto).nombre === "string" &&
    typeof (item as Producto).categoria === "string" &&
    typeof (item as Producto).precio === "number"
  )) {
    throw new Error("La respuesta del catálogo contiene productos con formato inválido.");
  }
  return lista as Producto[];
}
