import './App.css'

const ROLES = ['Admin', 'Operador', 'Cliente'] as const

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">Pedidos360</span>
        <nav className="app-nav">
          {ROLES.map((role) => (
            <span key={role} className="role-pill">
              {role}
            </span>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <h1>Bienvenido a Pedidos360</h1>
        <p>
          Base visual del frontend, sin autenticación todavía. El login
          corporativo con Azure AD (MSAL) y las rutas protegidas por rol se
          integran en las siguientes fases.
        </p>
      </main>

      <footer className="app-footer">
        <p>DSY1107 — Desarrollo Cloud Native I</p>
      </footer>
    </div>
  )
}

export default App
