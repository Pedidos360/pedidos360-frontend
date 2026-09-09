import { useMsal } from "@azure/msal-react";

export function useAuth() {
  const { instance, accounts } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["User.Read"],
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  };

  return {
    isAuthenticated: accounts.length > 0,
    account: accounts[0] || null,
    login: handleLogin,
    logout: handleLogout,
  };
}