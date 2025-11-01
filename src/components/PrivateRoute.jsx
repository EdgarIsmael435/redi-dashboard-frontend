import { Navigate } from "react-router-dom";
import { getSession } from "../services/auth";

/**
 * Ruta privada que protege el acceso y permite filtrar por roles
 * @param {ReactNode} children - componente hijo (vista protegida)
 * @param {number[1, 2]} allowedRoles - lista de roles permitidos
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const session = getSession();

  // Si no hay sesión activa, redirige al login
  if (!session) return <Navigate to="/" replace />;

  const { user } = session;

  // Si hay roles definidos y el usuario no pertenece a ellos bloquear
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todo ok renderiza el componente protegido
  return children;
};

export default PrivateRoute;
