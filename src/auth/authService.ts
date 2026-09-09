import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

// Roles del sistema (SDD §9).
export type Role = "Admin" | "Operador" | "Cliente";

// Hook central de autenticación (SDD §11.1 - auth/authService).
// Expone estado de sesión, roles y acciones de login/logout basadas en MSAL.
export function useAuth() {
  const { instance, accounts } = useMsal();
  const account = accounts[0] ?? null;

  // Los roles vienen en el claim "roles" del id token (SDD §9, §10).
  const claims = account?.idTokenClaims as
    | { roles?: string[] }
    | undefined;
  const roles = (claims?.roles ?? []) as Role[];

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      // Si el redirect falla antes de navegar, se ve aquí en consola.
      console.error("Error al iniciar loginRedirect:", error);
    }
  };

  const logout = () => {
    instance.logoutRedirect();
  };

  const hasRole = (...allowed: Role[]) =>
    allowed.some((role) => roles.includes(role));

  return {
    isAuthenticated: accounts.length > 0,
    account,
    roles,
    hasRole,
    login,
    logout,
  };
}
