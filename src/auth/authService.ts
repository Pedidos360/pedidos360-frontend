import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

// Hook central de autenticación (SDD §11.1 - auth/authService).
// Expone estado de sesión y acciones de login/logout basadas en MSAL.
export function useAuth() {
  const { instance, accounts } = useMsal();

  const login = () => {
    instance.loginRedirect(loginRequest);
  };

  const logout = () => {
    instance.logoutRedirect();
  };

  return {
    isAuthenticated: accounts.length > 0,
    account: accounts[0] ?? null,
    login,
    logout,
  };
}
