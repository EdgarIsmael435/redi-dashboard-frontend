import { useState, useEffect } from "react";
import { Zap, User, LogOut, Settings, BookUser } from "lucide-react";
import { IconRedi } from "./IconRedi";
import { useNavigate, useLocation } from "react-router-dom";
import { clearSession } from "../../services/auth";

const SideBar = ({ isExpanded, toggleExpand, badge = "", userData }) => {
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        const path = location.pathname.split("/").pop();
        return path || "panel";
    });

    useEffect(() => {
        const path = location.pathname.split("/").pop();
        setActiveTab(path || "panel");
    }, [location.pathname]);

    const menuItems =
        userData?.rol === 1
            ? [
                { id: "panel", icon: Zap, label: "Recargas", badge, active: activeTab === "panel" },
                { id: "operadores", icon: User, label: "Administrar Operadores", active: activeTab === "operadores" },
                { id: "clientes", icon: BookUser, label: "Administrar Clientes", active: activeTab === "clientes" },
            ]
            : [
                { id: "panel", icon: Zap, label: "Recargas", badge, active: activeTab === "panel" },
            ];

    const handleLogout = () => {
        clearSession();
        navigate("/");
    };

    return (
        <>
            {/* Vista Desktop */}
            <div
                className={`hidden md:flex fixed top-4 left-4 h-[calc(100vh-2rem)] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl transition-all duration-300 ease-in-out ${isExpanded ? "w-72" : "w-20"
                    } flex-col z-20 overflow-hidden`}
            >
                {/* Header */}
                <div className="relative bg-black/80 p-6">
                    <div className="absolute inset-0 bg-white/5"></div>

                    {isExpanded ? (
                        <div
                            className="relative flex items-center space-x-3 cursor-pointer"
                            onClick={toggleExpand}
                        >
                            <div className="relative">
                                <IconRedi isValid="true" size="sm" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg">Panel de Control</h1>
                                <p className="text-red-100 text-sm opacity-90">
                                    {userData?.rol == 2 ? "Operador" : "Administrador"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="relative flex flex-col items-center cursor-pointer"
                            onClick={toggleExpand}
                        >
                            <IconRedi isValid="true" size="sm" />
                        </div>
                    )}
                </div>

                {/* Menu Items */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item, i) => (
                        <div
                            key={i}
                            className="relative"
                            onMouseEnter={() => setHoveredItem(i)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <a
                                href="#"
                                className={`relative flex items-center ${isExpanded ? "space-x-3 px-4 py-3" : "justify-center px-2 py-3"
                                    } rounded-r-2xl transition-all duration-200 group ${item.active
                                        ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-lg shadow-red-500/25"
                                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                                    }`}
                                title={!isExpanded ? item.label : ""}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    const basePath = userData?.rol === 1 ? "admin" : "operator";
                                    navigate(`/${basePath}/${item.id}`);
                                }}
                            >
                                {item.active && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white"></div>
                                )}
                                <item.icon
                                    className={`w-5 h-5 ${item.active ? "text-white" : "text-gray-400 group-hover:text-red-400"
                                        } transition-colors`}
                                />
                                {isExpanded && (
                                    <div className="flex items-center justify-between flex-1">
                                        <span className="font-medium">{item.label}</span>
                                        {item.badge && (
                                            <span className="bg-black text-white text-xs px-2 py-1 rounded-full min-w-[1.25rem] text-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </a>

                            {!isExpanded && hoveredItem === i && (
                                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-700 whitespace-nowrap z-50">
                                    {item.label}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="border-t border-gray-700/50 p-4">
                    <div
                        className={`flex items-center ${isExpanded ? "space-x-3 px-2 py-3" : "justify-center py-2"
                            } text-gray-300 hover:text-white transition-colors`}
                    >
                        <div className="relative">
                            <User className="w-8 h-8 p-1.5 bg-gray-700 rounded-full" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border border-gray-800 rounded-full"></div>
                        </div>
                        {isExpanded && (
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                    {userData?.nombreUsuario || "Invitado"}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {userData?.rol == 2 ? "Operador de Recargas" : "Administrador"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700/50">
                    <button
                        className={`flex items-center w-full ${isExpanded ? "space-x-3 px-4 py-3" : "justify-center px-2 py-3"
                            } bg-gradient-to-r from-gray-700 to-gray-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 group shadow-lg`}
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        {isExpanded && <span className="text-white font-medium">Cerrar Sesión</span>}
                    </button>
                </div>
            </div>

            {/* Vista Mobile */}
            <div className="md:hidden">
                {/* Header con engrane */}
                <div className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-2xl p-4 shadow-lg z-30 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <IconRedi isValid="true" size="sm" />
                        <div>
                            <h1 className="text-white font-bold text-lg">Panel de Control</h1>
                            <p className="text-red-100 text-sm opacity-90">
                                {userData?.rol == 2 ? "Operador" : "Administrador"}
                            </p>
                        </div>
                    </div>

                    {/* Engrane + overlay */}
                    <div className="relative z-40">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 shadow-lg"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {/* Overlay + menú */}
                {isMobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-30"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>
                        <div className="absolute top-14 right-4 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 w-40 z-40">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-red-600 rounded-lg"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </>
                )}

                {/* Dock inferior dinámico */}
                <div className="fixed bottom-0 left-0 right-0 z-30">
                    <div className="flex justify-around items-center h-14 
                  bg-white/5 backdrop-blur-2xl 
                  border-t border-white/10 shadow-lg relative">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    const basePath = userData?.rol === 1 ? "admin" : "operator";
                                    navigate(`/${basePath}/${item.id}`);
                                }}
                                className="relative flex flex-col items-center justify-center flex-1 h-full"
                            >
                                {/* Línea arriba del icono */}
                                {item.active && (
                                    <span className="absolute top-0 w-10 h-0.5 bg-red-500 rounded-full"></span>
                                )}

                                {/* Icono */}
                                <item.icon
                                    className={`w-6 h-6 transition-colors ${item.active ? "text-red-500" : "text-white"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideBar;
