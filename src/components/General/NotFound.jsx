import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { IconRedi } from './IconRedi';
import { BackContainer } from './BackContainer';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className='flex items-center justify-center'>
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

                        {/* 404 Number */}
                        <div className="mb-4">
                            <h1 className="text-8xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                                404
                            </h1>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-2">
                            <AlertCircle className="text-red-400" size={24} />
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                                Página No Encontrada
                            </h2>
                        </div>
                    </div>

                    {/* Illustration or Message */}
                    <div className="mb-8 p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                        <p className="text-gray-300 text-center text-sm leading-relaxed">
                            La ruta que intentas acceder no está disponible.
                            Verifica la URL o regresa al inicio para continuar navegando.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        {/* Go Home Button */}
                        <button
                            type="button"
                            onClick={handleGoHome}
                            className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <Home size={20} />
                            <span className="relative z-10">Volver al Inicio</span>
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
    );
};

export default NotFound;