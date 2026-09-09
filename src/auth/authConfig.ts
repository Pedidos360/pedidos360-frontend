import {
  LogLevel,
  type Configuration,
} from "@azure/msal-browser";

// Client y Tenant se leen desde variables de entorno (SDD §32).
// Nunca se hardcodean en el código fuente.
const clientId = import.meta.env.VITE_CLIENT_ID;
const tenantId = import.meta.env.VITE_TENANT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

if (!clientId || !tenantId || !redirectUri) {
  throw new Error(
    "Faltan variables de entorno MSAL. Revisa tu .env (VITE_CLIENT_ID, VITE_TENANT_ID, VITE_REDIRECT_URI)."
  );
}

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },

  cache: {
    cacheLocation: "sessionStorage",
  },

  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }

        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;

          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};
