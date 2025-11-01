import { useState, useEffect } from 'react';

export const HeaderContainer = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    status = 'online',
    showBadge = false,
    badge = '',
    variant = 'default',
    animated = true
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Configuraciones de status
    const statusConfig = {
        online: { dots: ['bg-green-400', 'bg-yellow-400', 'bg-red-400'], pulse: false },
        loading: { dots: ['bg-white/70', 'bg-white/70', 'bg-white/70'], pulse: true },
        error: { dots: ['bg-red-500', 'bg-red-400', 'bg-red-300'], pulse: true },
        success: { dots: ['bg-green-500', 'bg-green-400', 'bg-green-300'], pulse: false },
        warning: { dots: ['bg-yellow-500', 'bg-orange-400', 'bg-red-400'], pulse: true }
    };

    // Variantes de estilo
    const variants = {
        default: {
            container: 'bg-white/5 backdrop-blur-2xl border border-white/10',
            glow: 'bg-white/5'
        },
        primary: {
            container: 'bg-white/8 backdrop-blur-3xl border-white/15 hover:bg-white/12 hover:border-white/25',
            glow: 'bg-red-500/10'
        },
        dark: {
            container: 'bg-black/20 backdrop-blur-2xl border-red-500/20 hover:bg-black/30 hover:border-red-500/30',
            glow: 'bg-red-500/15'
        }
    };

    const currentVariant = variants[variant] || variants.default;
    const currentStatus = statusConfig[status] || statusConfig.online;

    return (
        <>
            {/* VERSIÓN ESCRITORIO */}
            <div 
                className={`hidden md:block ${currentVariant.container} border shadow-2xl rounded-2xl p-6 transition-all duration-300 ease-in-out group select-none ${mounted && animated ? 'animate-fade-in' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}            
            >
                {/* Efecto de luz de fondo dinámico */}
                <div className={`absolute inset-0 ${currentVariant.glow} opacity-0 transition-opacity duration-500 rounded-2xl`}></div>
                
                <div className="relative flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Contenedor del icono */}
                        <div className="relative">
                            {/* Anillo decorativo */}
                            <div className="absolute inset-0 w-12 h-12 border border-red-500/20 rounded-2xl rotate-45 group-hover:rotate-[60deg] transition-transform duration-700"></div>
                            
                            {/* Icono principal */}
                            <div className={`relative w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg transform ${isHovered ? 'rotate-6 scale-105' : 'rotate-3'} transition-all duration-300`}>
                                {/* Fondo negro interno */}
                                <div className="absolute inset-1 bg-black/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Icon className="w-6 h-6 text-white drop-shadow-lg" />
                                </div>
                                
                                {/* Badge opcional */}
                                {showBadge && badge && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full border-2 border-gray-800 shadow-lg animate-pulse">
                                        {badge}
                                    </div>
                                )}
                            </div>
                            
                            {/* Glow effect */}
                            <div className={`absolute inset-0 bg-red-500/30 rounded-2xl blur-md -z-10 transition-all duration-300 ${isHovered ? 'scale-125 bg-red-500/40' : 'scale-100'}`}></div>
                            
                            {/* Sparkle effects */}
                            {isHovered && animated && (
                                <>
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-300 rounded-full animate-ping"></div>
                                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse delay-300"></div>
                                </>
                            )}
                        </div>
                        
                        {/* Contenido de texto */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <h2 className="text-xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
                                    {title}
                                </h2>
                                {status === 'loading' && (
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
                                        <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                                {subtitle}
                            </p>
                            
                            {/* Línea decorativa que aparece en hover */}
                            <div className="mt-2 h-px bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        </div>
                    </div>
                    
                    {/* Dots de estados */}
                    <div className="flex flex-col items-end space-y-2">
                        <div className="flex space-x-1.5">
                            {currentStatus.dots.map((color, index) => (
                                <div 
                                    key={index}
                                    className={`w-2.5 h-2.5 ${color} rounded-full shadow-sm transition-all duration-300 ${currentStatus.pulse ? 'animate-pulse' : ''} ${isHovered ? 'scale-110' : ''}`}
                                    style={{ animationDelay: `${index * 0.2}s` }}
                                ></div>
                            ))}
                        </div>
                        
                        {/* Status text */}
                        <span className={`text-xs font-medium transition-opacity duration-300 ${
                            status === 'online' ? 'text-green-400' :
                            status === 'loading' ? 'text-white/70' :
                            status === 'error' ? 'text-red-400' :
                            status === 'success' ? 'text-green-400' :
                            status === 'warning' ? 'text-yellow-400' :
                            'text-gray-400'
                        } ${isHovered ? 'opacity-100' : 'opacity-70'}`}>
                            {status === 'loading' ? 'Cargando...' :
                             status === 'error' ? 'Error' :
                             status === 'success' ? 'Completado' :
                             status === 'warning' ? 'Advertencia' :
                             'En línea'}
                        </span>
                    </div>
                </div>
            </div>
            {/* VERSIÓN MÓVIL */}
            <div 
                className={`md:hidden ${currentVariant.container} mt-10 border shadow-2xl rounded-xl p-4 transition-all duration-300 ease-in-out select-none ${mounted && animated ? 'animate-fade-in' : ''}`}
            >
                {/* Efecto de luz de fondo */}
                <div className={`absolute inset-0 ${currentVariant.glow} opacity-0 transition-opacity duration-500 rounded-xl`}></div>
                
                <div className="relative flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {/* Icono móvil */}
                            <div className="relative flex-shrink-0">
                                <div className="relative w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <div className="absolute inset-0.5 bg-black/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                        <Icon className="w-5 h-5 text-white drop-shadow-lg" />
                                    </div>
                                    
                                    {showBadge && badge && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-gray-800 shadow-lg animate-pulse">
                                            {badge}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-red-500/30 rounded-xl blur-md -z-10"></div>
                            </div>
                            
                            {/* Texto móvil */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-0.5">
                                    <h2 className="text-base font-bold text-white truncate">
                                        {title}
                                    </h2>
                                    {status === 'loading' && (
                                        <div className="flex space-x-1 flex-shrink-0">
                                            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
                                            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Status text móvil*/}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-xs text-gray-500 font-medium">Estado</span>
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold ${
                                status === 'online' ? 'text-green-400' :
                                status === 'loading' ? 'text-white/80' :
                                status === 'error' ? 'text-red-400' :
                                status === 'success' ? 'text-green-400' :
                                status === 'warning' ? 'text-yellow-400' :
                                'text-gray-400'
                            }`}>
                                {status === 'loading' ? 'Cargando...' :
                                 status === 'error' ? 'Error' :
                                 status === 'success' ? 'Completado' :
                                 status === 'warning' ? 'Advertencia' :
                                 'En línea'}
                            </span>
                            {/* Indicador visual */}
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                status === 'online' ? 'bg-green-400' :
                                status === 'loading' ? 'bg-white/80 animate-pulse' :
                                status === 'error' ? 'bg-red-400' :
                                status === 'success' ? 'bg-green-400' :
                                status === 'warning' ? 'bg-yellow-400' :
                                'bg-gray-400'
                            }`}></div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default HeaderContainer;