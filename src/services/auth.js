import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

//Login al backend
export const login = async (nombreUsuario, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { nombreUsuario, password });
  return res.data;
};

//Guardar sesión en localStorage
export const saveSession = (user, token) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
};

//Obtener sesión (usuario + token)
export const getSession = () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!userStr || !token) return null;

  try {
    const user = JSON.parse(userStr);
    return { user, token };
  } catch (err) {
    return null;
  }
};

//Eliminar sesión (logout)
export const clearSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

//Verificar autenticación
export const isAuthenticated = () => {
  const session = getSession();
  return !!session?.token;
};
