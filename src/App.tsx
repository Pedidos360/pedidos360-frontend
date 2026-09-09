import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Pedidos from "./pages/Pedidos";
import Admin from "./pages/Admin";
import Unauthorized from "./pages/Unauthorized";

// Layout de las rutas autenticadas: exige sesión y muestra el Navbar.
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Outlet />
    </ProtectedRoute>
  );
}

// Enrutado y rutas protegidas (SDD §15).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/pedidos" element={<Pedidos />} />
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
