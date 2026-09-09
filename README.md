# Pedidos360 — Frontend

Frontend del sistema **Pedidos360**, evaluación parcial N°1 del ramo DSY1107 —
Desarrollo Cloud Native I. Ver el [SDD](./SDD_Pedidos360.md) para el diseño
completo.

## Nota sobre el framework

La pauta original de la evaluación especifica **Angular**. Este proyecto se
implementa en **React + TypeScript + Vite** en su lugar, manteniendo
equivalentes funcionales a cada elemento pedido: rutas protegidas en vez de
`MsalGuard`, un cliente HTTP con interceptor en vez de `MsalInterceptor`
(SDD §51).

## Stack

- React + TypeScript + Vite
- `@azure/msal-browser` / `@azure/msal-react` para login corporativo
  (Microsoft Entra ID)
- React Router para rutas protegidas
- Axios como cliente HTTP con adjunto automático del JWT
- Autorización por rol: `Admin`, `Operador`, `Cliente`

## Variables de entorno

Crear un `.env` local (no se commitea; ver `.env.example`):

```
VITE_CLIENT_ID=<Application (client) ID del App Registration>
VITE_TENANT_ID=<Directory (tenant) ID>
VITE_REDIRECT_URI=http://localhost:5173
VITE_API_URL=http://localhost:8080
# Opcional, cuando el BFF exponga su scope:
# VITE_API_SCOPE=api://<client-id>/access_as_user
```

`clientId` y `tenantId` no son secretos (son identificadores públicos de la
SPA), pero se mantienen fuera del código fuente por buenas prácticas (SDD §32).

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5173
```

## Configuración en Microsoft Entra ID (App Roles)

Los roles del sistema (SDD §9) se definen como **App Roles** en el App
Registration; el frontend los lee del claim `roles` del id token. Los valores
deben coincidir exactamente con los que espera el código
(`src/auth/authService.ts`).

1. **Authentication** → agregar plataforma **Single-page application (SPA)**
   con el Redirect URI `http://localhost:5173`.
2. **App roles** → crear un rol por cada uno (campo *Value* exacto):

   | Display name | Value      | Allowed member types |
   | ------------ | ---------- | -------------------- |
   | Admin        | `Admin`    | Users/Groups         |
   | Operador     | `Operador` | Users/Groups         |
   | Cliente      | `Cliente`  | Users/Groups         |

3. **Enterprise applications → Users and groups** → asignar cada usuario de
   prueba a su rol.
4. Verificar en [jwt.ms](https://jwt.ms) que el id token trae, por ejemplo,
   `"roles": ["Admin"]`.

## Docker

La imagen hace el build de la SPA y la sirve con Nginx en el puerto 80
(SDD §7, §27, §30). Las variables `VITE_*` se embeben en tiempo de build:

```bash
docker build \
  --build-arg VITE_CLIENT_ID=<client-id> \
  --build-arg VITE_TENANT_ID=<tenant-id> \
  --build-arg VITE_REDIRECT_URI=http://localhost \
  --build-arg VITE_API_URL=http://localhost:8080 \
  -t pedidos360-frontend .

docker run --rm -p 80:80 pedidos360-frontend   # http://localhost
```

> Nota: al desplegar en EC2, `VITE_REDIRECT_URI` debe ser la URL pública y ese
> mismo valor debe estar registrado como Redirect URI (SPA) en Entra ID.

## Rutas

| Ruta            | Acceso                        |
| --------------- | ----------------------------- |
| `/login`        | Público                       |
| `/home`         | Autenticado                   |
| `/pedidos`      | Autenticado                   |
| `/admin`        | Rol `Admin`                   |
| `/unauthorized` | 403 (rol insuficiente)        |

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción (tsc + vite)
npm run lint      # oxlint
npm run preview   # previsualizar el build
```
