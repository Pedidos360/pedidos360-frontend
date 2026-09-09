import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

// Instancia única de MSAL, compartida entre el AuthProvider (React)
// y el cliente HTTP (interceptor), para poder adquirir el token
// silenciosamente fuera del árbol de componentes (SDD §16).
export const msalInstance = new PublicClientApplication(msalConfig);
