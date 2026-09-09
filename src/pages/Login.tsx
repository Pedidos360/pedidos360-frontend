import { useAuth } from "../auth/authService";

export default function Login() {
  const { isAuthenticated, account, login, logout } = useAuth();

  return (
    <main className="login">
      <h1>Pedidos360</h1>

      {isAuthenticated ? (
        <>
          <p>Sesión iniciada como {account?.name ?? account?.username}</p>
          <button onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <>
          <p>Inicia sesión con tu cuenta corporativa (Microsoft Entra ID).</p>
          <button onClick={login}>Iniciar sesión</button>
        </>
      )}
    </main>
  );
}
