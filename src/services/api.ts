import axios, { AxiosError } from "axios";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalInstance } from "../auth/msalInstance";
import { apiRequest, loginRequest } from "../auth/authConfig";

// Cliente HTTP centralizado (SDD §16).
// baseURL apunta al API Gateway mediante variable de entorno (Paso 20).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de request: adquiere el token silenciosamente y adjunta
// el header Authorization: Bearer <JWT> en cada llamada (SDD §16, Pasos 18-19).
api.interceptors.request.use(async (config) => {
  const account =
    msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

  if (account) {
    try {
      const result = await msalInstance.acquireTokenSilent({
        ...apiRequest,
        account,
      });
      config.headers.set("Authorization", `Bearer ${result.accessToken}`);
    } catch (error) {
      // Si la sesión ya no permite renovar el token de forma silenciosa,
      // se fuerza una interacción (redirect al login).
      if (error instanceof InteractionRequiredAuthError) {
        await msalInstance.acquireTokenRedirect(loginRequest);
      }
      throw error;
    }
  }

  return config;
});

// Interceptor de response: manejo centralizado de errores HTTP (SDD §38, Paso 21).
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        // Token ausente/ inválido/ expirado: la sesión no es válida.
        console.warn("401 No autorizado: token ausente o inválido.");
        break;
      case 403:
        // Autenticado pero sin el rol necesario.
        console.warn("403 Prohibido: no tienes permisos para esta operación.");
        break;
      case 500:
        console.error("500 Error interno del servidor.");
        break;
    }

    return Promise.reject(error);
  }
);
