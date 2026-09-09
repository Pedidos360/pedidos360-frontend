import { useAuth } from "../auth/authService";

export default function Home() {
  const { account, roles } = useAuth();

  return (
    <main className="page">
      <h1>Bienvenido a Pedidos360</h1>
      <p>Sesión iniciada como {account?.name ?? account?.username}.</p>
      <p>
        {roles.length > 0
          ? `Roles: ${roles.join(", ")}`
          : "Tu cuenta no tiene roles asignados."}
      </p>
    </main>
  );
}
