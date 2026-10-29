import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Pedidos from "./pages/Pedidos";
import Tienda from "./pages/Tienda";
import FlujoEnVivo from "./pages/FlujoEnVivo";
import Admin from "./pages/Admin";
import Unauthorized from "./pages/Unauthorized";

// Layout de las rutas autenticadas: exige sesiÃ³n y muestra el Navbar.
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <div className="app-shell">
        <Navbar />
        <div className="container">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Enrutado y rutas protegidas (SDD Â§15).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/flujo" element={<FlujoEnVivo />} />
          <Route
            path="/admin"
            element={
              <RoleGuard allowed={["Admin"]}>
                <Admin />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


