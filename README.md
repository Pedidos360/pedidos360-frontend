# Pedidos360 — Frontend

Frontend del sistema **Pedidos360**, evaluación parcial N°1 del ramo DSY1107 —
Desarrollo Cloud Native I. Ver el [SDD](./SDD_Pedidos360.md) y el
[plan de desarrollo](./PLAN.md) para el diseño completo y el checklist de fases.

## Nota sobre el framework

La pauta original de la evaluación especifica **Angular**. Este proyecto se
implementa en **React + TypeScript + Vite** en su lugar, manteniendo
equivalentes funcionales a cada elemento pedido: rutas protegidas en vez de
`MsalGuard`, un cliente HTTP con interceptor en vez de `MsalInterceptor`.
Detalle completo de la decisión en el SDD, sección 1.3.

## Stack

- React + TypeScript + Vite
- `@azure/msal-browser` / `@azure/msal-react` para login corporativo (Azure AD)
- Autorización por rol: Admin, Operador, Cliente

## Desarrollo local

```bash
npm install
npm run dev
```

Variables de entorno necesarias (crear un `.env` local, no se commitea):

```
VITE_AZURE_CLIENT_ID=
VITE_AZURE_AUTHORITY=
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

## Estado

Ver `PLAN.md` para el checklist de fases y qué está hecho.
