# Contrato pendiente: administración de disponibilidad

El frontend de la rama `feat/admin-estado-productos` incorpora una interfaz de administración de productos y presenta al cliente solo los activos. **Para que funcione de extremo a extremo, el BFF y MS Catalog desplegados deben implementar los endpoints y persistencia siguientes**.

## Endpoints del BFF

| Método | Ruta | Permiso | Respuesta |
|---|---|---|---|
| GET | `/catalog` | Admin, Operador, Cliente | Lista de productos con campo `activo: boolean`. Idealmente incluir todos los productos y dejar que la vista cliente filtre, o responder solo activos para clientes, siempre con protección backend al comprar. |
| GET | `/admin/productos` | Solo Admin | **Todos** los productos (incluidos inactivos) |
| PATCH | `/admin/productos/{id}/estado` | Solo Admin | Body `{ "activo": false }`; responder 2xx tras persistir o 404 si no existe |

Representación de ejemplo:

```json
{ "id": 1, "nombre": "Monitor", "categoria": "Pantallas", "precio": 89990, "activo": true }
```

## MS Catalog

- Agregar `activo` como boolean persistido (`NOT NULL DEFAULT TRUE`) y mantenerlo en lecturas.
- Crear operación de actualización atómica de disponibilidad (sin permitir edición de otros campos con este endpoint).
- Revisar el perfil actual `local`: si usa H2 `create-drop`, los cambios se perderán al recrear el contenedor. Migrar a una base persistente antes de considerar la función disponible en producción.
- Proteger por rol **en el BFF**, además de la ruta del frontend. No confiar en parámetros de rol enviados por el navegador.
- Revisar la validación de compra del MS Pedidos: debe rechazar un producto desactivado incluso si el usuario envía un POST directamente.

## Comportamiento de interfaz

- Administrador: ver, filtrar, buscar y activar/desactivar, reconsultando al servidor tras cada cambio.
- Cliente: consultar `/catalog` al entrar y periódicamente cada 30 segundos cuando la pestaña está visible; retirar del carrito los productos ya inactivos y volver a validar antes de comprar.
- Hasta que el backend implemente el contrato, el panel mostrará un error explícito (404/405) y **no simulará persistencia**.
