import { useState, useEffect, type ReactNode } from "react";
import { EventType, type AuthenticationResult } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msalInstance";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await msalInstance.initialize();

      // Procesa la respuesta de un redirect (vuelta desde Microsoft).
      // Si Microsoft devolvió un error, se ve aquí en consola.
      try {
        const result = await msalInstance.handleRedirectPromise();
        if (result?.account) {
          msalInstance.setActiveAccount(result.account);
        }
      } catch (error) {
        console.error("Error procesando el redirect de MSAL:", error);
      }

      // Si ya hay una cuenta en caché, la marcamos como activa.
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
        msalInstance.setActiveAccount(accounts[0]);
      }

      // Al completarse (o fallar) un login, lo reflejamos / lo mostramos.
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload as AuthenticationResult;
          msalInstance.setActiveAccount(payload.account);
        }
        if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
          console.error("Fallo de autenticación MSAL:", event.error);
        }
      });

      setReady(true);
    };

    initialize();
  }, []);

  if (!ready) {
    return <div>Cargando autenticación...</div>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
