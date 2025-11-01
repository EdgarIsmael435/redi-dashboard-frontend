import { Navigate } from "react-router-dom";
import { getSession } from "../services/auth";

const PublicRoute = ({ children }) => {
  const session = getSession();

  if (session) {
    const { user } = session;

    // Redirige según el rol
    if (user.rol === 1) return <Navigate to="/admin" replace />;
    if (user.rol === 2) return <Navigate to="/operator" replace />;
  }

  return children;
};

export default PublicRoute;
