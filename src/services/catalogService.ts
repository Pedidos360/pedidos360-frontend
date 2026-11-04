import { api } from "./api";

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  activo?: boolean;
}

type CatalogoPayload = Producto[] | { productos?: Producto[]; content?: Producto[]; data?: Producto[] };

function normalizarCatalogo(data: CatalogoPayload): Producto[] {
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
    typeof (item as Producto).precio === "number" &&
    ((item as Producto).activo === undefined || typeof (item as Producto).activo === "boolean")
  )) {
    throw new Error("La respuesta del catálogo contiene productos con formato inválido.");
  }
  return lista as Producto[];
}

export async function getCatalogo(): Promise<Producto[]> {
  const { data } = await api.get<CatalogoPayload>("/catalog");
  return normalizarCatalogo(data);
}

// Contrato del BFF: solo Admin; debe devolver activos e inactivos.
export async function getCatalogoAdmin(): Promise<Producto[]> {
  const { data } = await api.get<CatalogoPayload>("/admin/productos");
  const productos = normalizarCatalogo(data);
  if (productos.some((producto) => typeof producto.activo !== "boolean")) {
    throw new Error("El catálogo administrativo debe incluir el campo 'activo' de cada producto.");
  }
  return productos;
}

// La modificación se guarda en el backend, no en localStorage ni solo en React.
export async function cambiarEstadoProducto(id: number, activo: boolean): Promise<void> {
  await api.patch(`/admin/productos/${id}/estado`, { activo });
}
