import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { IconRedi } from './General/IconRedi';
import { BackContainer } from './General/BackContainer';

const Unauthorized = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoLogin = () => {
        navigate('/login');
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
                                    isValid={false}
                                    size="md"
                                />
                            </div>
                            
                            {/* 401 Number */}
                            <div className="mb-4">
                                <h1 className="text-8xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                                    401
                                </h1>
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-2">
                                <ShieldAlert className="text-red-400" size={24} />
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                                    No Autorizado
                                </h2>
                            </div>
                            
                            <p className="text-gray-400 text-sm">
                                No tienes permisos para acceder a este recurso
                            </p>
                        </div>

                        {/* Message */}
                        <div className="mb-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <p className="text-gray-300 text-center text-sm leading-relaxed">
                                Tu sesión puede haber expirado o no cuentas con los permisos necesarios. 
                                Por favor, inicia sesión nuevamente o contacta al administrador.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">                            
                            {/* Go Home Button */}
                            <button
                                type="button"
                                onClick={handleGoHome}
                                className="w-full bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 flex items-center justify-center gap-2"
                            >
                                <Home size={20} />
                                Volver al Inicio
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-400">
                                ¿Necesitas ayuda?{' '}
                                <a
                                    href="https://wa.me/+525542269350"
                                    className="text-red-400 hover:text-red-300 font-medium transition-colors duration-300"
                                >
                                    Contacta soporte
                                </a>
                            </p>
                        </div>
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

export default Unauthorized;