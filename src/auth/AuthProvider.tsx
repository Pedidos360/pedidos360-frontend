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

      // Si ya hay una cuenta en caché, la marcamos como activa.
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }

      // Al completarse un login, fijamos la cuenta activa para que
      // el interceptor pueda adquirir el token silenciosamente.
      msalInstance.addEventCallback((event) => {
        if (
          event.eventType === EventType.LOGIN_SUCCESS &&
          event.payload
        ) {
          const payload = event.payload as AuthenticationResult;
          msalInstance.setActiveAccount(payload.account);
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
