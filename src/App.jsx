import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import LoginForm from "./components/LoginForm";
import DashboardOperator from "./components/Operator/DashboardOperator";
import DashboardAdmin from "./components/Admin/DashboardAdmin";
import Unauthorized from "./components/Unauthorized";
import PublicRoute from "./components/PublicRoute";
import { clearSession } from "./services/auth";
import Modal from "./components/General/Modal";
import { LogOut } from "lucide-react";
import { onSessionExpired } from "./services/sessionEvents";

function App() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        const now = Math.floor(Date.now() / 1000);

        // Si el token ya expiró → muestra modal
        if (decoded.exp && decoded.exp < now) {
          setSessionExpired(true);
        } 
        // Si aún no expira → programa revisión justo antes del vencimiento
        else if (decoded.exp) {
          const remaining = (decoded.exp - now) * 1000;
          setTimeout(checkTokenExpiration, remaining + 1000);
        }
      } catch (error) {
      }
    };

    // Ejecutar una vez al montar
    checkTokenExpiration();

    // Escuchar expiración desde el interceptor (401)
    onSessionExpired(() => setSessionExpired(true));
  }, []);

  const handleCloseSession = () => {
    clearSession();
    setSessionExpired(false);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />

        <Route
          path="/operator/*"
          element={
            <PrivateRoute allowedRoles={[2]}>
              <DashboardOperator />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={[1]}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>

      {/* 🟥 Modal de sesión expirada */}
      <Modal
        isOpen={sessionExpired}
        onClose={handleCloseSession}
        title="Sesión expirada"
        subTitle="Por seguridad, tu sesión ha finalizado"
        icon={LogOut}
        size="sm"
      >
        <div className="text-center text-gray-300 space-y-3">
          <p>Tu sesión ha expirado por tiempo o inactividad.</p>
          <p>Por favor vuelve a iniciar sesión para continuar.</p>

          <button
            onClick={handleCloseSession}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all"
          >
            Iniciar sesión nuevamente
          </button>
        </div>
      </Modal>
    </BrowserRouter>
  );
}

export default App;