import {
  LogLevel,
  type Configuration,
} from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "28cc3d1b-1fa0-4909-b352-3f6bf2efec1b",
    authority: "https://login.microsoftonline.com/3be234d1-0c64-484a-bc77-9478be48280f",
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173",
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