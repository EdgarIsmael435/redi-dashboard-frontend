import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { IconRedi } from './General/IconRedi';
import { BackContainer } from './General/BackContainer';
import { login, saveSession } from "../services/auth";
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrors({}); // resetear errores

        const cleanUser = user.trim();
        const cleanPassword = password.trim();

        const newErrors = {};
        if (!cleanUser) newErrors.user = "El usuario es requerido";
        if (!cleanPassword) newErrors.password = "La contraseña es requerida";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const data = await login(cleanUser, cleanPassword);

            // Guarda la sesión de forma centralizada
            saveSession(data.usuario, data.token);

            // Redirige según el rol
            switch (data.usuario.rol) {
                case 1:
                    navigate("/admin");
                    break;
                case 2:
                    navigate("/operator");
                    break;
                default:
                    navigate("/");
                    break;

            }
        } catch (err) {
            const msg = err.response?.data?.error || "Error en servidor";
            setErrors({ general: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BackContainer>
            <div className='flex items-center justify-center min-h-screen p-4'>
                {/* Glass container */}
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
                                <IconRedi
                                    isValid={Object.keys(errors).length === 0}
                                    size="md"
                                />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
                                Bienvenido de Regreso
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Inicia sesión para continuar
                            </p>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* User Field */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nombre de usuario
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={user}
                                        onChange={(e) => {
                                            setUser(e.target.value.trimStart());
                                            if (errors.user) setErrors({ ...errors, user: "" });
                                        }
                                        }
                                        className={`w-full px-4 py-3 bg-white/5 backdrop-blur-xl border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 group-hover:bg-white/10
                                        ${errors.user ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/50" : "border-white/20 focus:border-gray-950 focus:ring-2 focus:ring-gray-900/50"}`}
                                        placeholder="Ingresa tu nombre de usuario"
                                        required
                                    />
                                </div>
                                {errors.user && <p className="text-red-400 text-xs mt-1">{errors.user}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="group">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({ ...errors, password: "" });
                                        }}
                                        className={`w-full px-4 py-3 bg-white/5 backdrop-blur-xl border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 group-hover:bg-white/10
                                        ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/50" : "border-white/20 focus:border-gray-950 focus:ring-2 focus:ring-gray-900/50"}`}
                                        placeholder="Ingresa tu contraseña"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        </div>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </span>
                            </button>
                            {errors.general && (
                                <p className="font-bold text-red-500 text-sm text-center mt-1">{errors.general}</p>
                            )}
                        </div>

                        {/* Footer */}
                        {/*  <div className="mt-8 text-center">
                            <p className="text-sm text-gray-400">
                                ¿Olvidaste tu contraseña?{' '}
                                <a
                                    href="#"
                                    className="text-red-400 hover:text-red-300 font-medium transition-colors duration-300"
                                >
                                    Click aquí
                                </a>
                            </p>
                        </div> */}
                    </div>

                    {/* Additional glass effect at bottom */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            © 2025 <b>Redi</b> by Red Comunicación Movil. Todos los derechos reservados
                        </p>
                    </div>
                </div>
            </div>
        </BackContainer>
    );
};

export default LoginForm;