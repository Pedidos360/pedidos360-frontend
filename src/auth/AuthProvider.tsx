import { useState, useEffect, type ReactNode } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [msalInstance, setMsalInstance] =
    useState<PublicClientApplication | null>(null);

  useEffect(() => {
    const initializeMsal = async () => {
      const instance = new PublicClientApplication(msalConfig);

      await instance.initialize();

      setMsalInstance(instance);
    };

    initializeMsal();
  }, []);

  if (!msalInstance) {
    return <div>Cargando autenticación...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}