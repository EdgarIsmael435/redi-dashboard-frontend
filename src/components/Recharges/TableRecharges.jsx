import { Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

export const TableRecharges = ({
    recharges,
    filteredRecharges,
    companyConfig,
    handleFolioChange,
    handleSend,
    sendingId,
    PriorityBadge,
    StatusIcon,
    LogoIcon,
    userData
}) => {
    const [copiedStates, setCopiedStates] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const copyNumber = async (number, id) => {
        try {
            await navigator.clipboard.writeText(number);
            setCopiedStates((prev) => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedStates((prev) => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            console.error("Error al copiar:", err);
        }
    };

    // Paginación
    const totalPages = Math.ceil(filteredRecharges.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRecharges = useMemo(() => {
        return filteredRecharges.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRecharges, startIndex, itemsPerPage]);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Resetear página cuando cambian los filtros
    useMemo(() => {
        setCurrentPage(1);
    }, [filteredRecharges.length]);

    return (
        <>
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                {/* Tabla */}
                <div className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden mb-4">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/10 backdrop-blur-xl">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Estado</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Compañía</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Monto</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Número</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Folio</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Prioridad</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRecharges.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-3 py-6 text-center text-gray-400 text-sm">
                                            {recharges.length === 0 ? "Nada que mostrar" : "Esperando recargas..."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecharges.map((r) => {
                                        const id = r.id_ticketRecarga;
                                        const status = r.Estado;
                                        const company = r.Compania.toLowerCase();
                                        const number = r.Numero;
                                        const amount = r.Monto;
                                        const priority = r.PrioridadCliente;
                                        const folioAuto = r.FolioAuto || 0;

                                        return (
                                            <tr
                                                key={id}
                                                className={`
                        ${companyConfig[company]?.leftBorder || "border-l-4 border-gray-500/60"} 
                        ${companyConfig[company]?.bg || "bg-gray-500/10"} 
                        hover:bg-white/10 transition-all duration-300 border-b
                      `}
                                            >
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-white/10 backdrop-blur-xl rounded-lg flex items-center justify-center text-white font-medium text-xs border border-white/20">
                                                            {id}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border ${status === "PENDIENTE"
                                                        ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
                                                        : "bg-green-500/20 text-green-200 border-green-500/30"
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 ${companyConfig[company]?.legendColor} backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/20`}>
                                                            {companyConfig[company]?.icon || <LogoIcon company={company} />}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-2">
                                                    <span className="text-xs font-medium text-white">${amount}</span>
                                                </td>

                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-2 py-1 font-mono text-xs text-gray-200">
                                                            {number}
                                                        </div>
                                                        <button
                                                            onClick={() => copyNumber(number, id)}
                                                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-xl"
                                                            title="Copiar número"
                                                        >
                                                            {copiedStates[id] ? (
                                                                <Check className="w-3 h-3 text-green-400" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={r.Folio || ""}
                                                        onChange={(e) => handleFolioChange(id, e.target.value)}
                                                        disabled={status === "COMPLETADO"}
                                                        placeholder="Folio..."
                                                        className={
                                                            `w-full rounded-lg px-2 py-1 backdrop-blur-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-900/50 disabled:bg-white/5 transition-all duration-300 text-xs
                                                        ${folioAuto && !r.Folio ? 'animate-pulse border border-red-600 bg-red-600/20' : 'border border-white/20 bg-white/5'}`}
                                                    />
                                                </td>

                                                <td className="px-3 py-2">
                                                    <PriorityBadge priority={priority} />
                                                </td>

                                                <td className="px-3 py-2">
                                                    {status === "PENDIENTE" ? (
                                                        <button
                                                            onClick={() => handleSend(id, folioAuto, userData?.id, userData?.nombreUsuario)}
                                                            disabled={!r.Folio || sendingId === id}
                                                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-red-500/50 shadow-md text-xs backdrop-blur-xl"
                                                        >
                                                            {sendingId === id ? (
                                                                <span className="inline-block w-2 h-2 border-5 border-white border-t-transparent rounded-full animate-spin"></span>
                                                            ) : (
                                                                "Procesar"
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <StatusIcon status={status} />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cards - Mobile (tipo notificación compacta) */}
                <div className="md:hidden space-y-2 mb-4">
                    {paginatedRecharges.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                            <p className="text-gray-400 text-xs">
                                {recharges.length === 0 ? "Nada que mostrar" : "Esperando recargas..."}
                            </p>
                        </div>
                    ) : (
                        paginatedRecharges.map((r) => {
                            const id = r.id_ticketRecarga;
                            const status = r.Estado;
                            const company = r.Compania.toLowerCase();
                            const number = r.Numero;
                            const amount = r.Monto;
                            const priority = r.PrioridadCliente;
                            const folioAuto = r.FolioAuto || 0;

                            return (
                                <div
                                    key={id}
                                    className={`
                                    ${companyConfig[company]?.leftBorder || "border-l-4 border-gray-500/60"} 
                                    bg-white/5 backdrop-blur-xl border rounded-lg p-3 shadow-lg
                                `}
                                >
                                    {/* Header compacto */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-white/10 backdrop-blur-xl rounded-md flex items-center justify-center text-white font-medium text-xs border border-white/20">
                                                {id}
                                            </div>
                                            <div className={`w-6 h-6 ${companyConfig[company]?.legendColor} backdrop-blur-xl rounded-md flex items-center justify-center border border-white/20 text-xs`}>
                                                {companyConfig[company]?.icon || <LogoIcon company={company} />}
                                            </div>
                                            <span className="text-xs font-semibold text-white">${amount}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-sm border ${status === "PENDIENTE"
                                            ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
                                            : "bg-green-500/20 text-green-200 border-green-500/30"
                                            }`}>
                                            {status}
                                        </span>
                                    </div>

                                    {/* Número con botón de copiar */}
                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-md px-2 py-1 font-mono text-xs text-gray-200">
                                            {number}
                                        </div>
                                        <button
                                            onClick={() => copyNumber(number, id)}
                                            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-xl"
                                            title="Copiar"
                                        >
                                            {copiedStates[id] ? (
                                                <Check className="w-3 h-3 text-green-400" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </button>
                                        <div className="ml-1">
                                            <PriorityBadge priority={priority} />
                                        </div>
                                    </div>

                                    {/* Folio y acción en una línea */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={r.Folio || ""}
                                            onChange={(e) => handleFolioChange(id, e.target.value)}
                                            disabled={status === "COMPLETADO"}
                                            placeholder="Folio"
                                            className={`flex-1 rounded-md px-2 py-1 backdrop-blur-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-900/50 disabled:bg-white/5 transition-all duration-300 text-xs 
                                        ${folioAuto && !r.Folio ? 'animate-pulse border border-red-600 bg-red-600/20' : 'border border-white/20 bg-white/5 '}`}
                                        />
                                        {status === "PENDIENTE" ? (
                                            <button
                                                onClick={() => handleSend(id, folioAuto, userData?.id, userData?.nombreUsuario)}
                                                disabled={!r.Folio || sendingId === id}
                                                className="px-3 py-1 rounded-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 shadow-md text-xs backdrop-blur-xl whitespace-nowrap"
                                            >
                                                {sendingId === id ? (
                                                    <span className="inline-block w-2 h-2 border-5 border-white border-t-transparent rounded-full animate-spin"></span>
                                                ) : (
                                                    "Procesar"
                                                )}
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <StatusIcon status={status} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Paginación */}
                {filteredRecharges.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                        <div className="text-gray-400">
                            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRecharges.length)} de {filteredRecharges.length}
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-xl"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => goToPage(i + 1)}
                                    className={`px-3 py-1 rounded-lg border transition-all font-medium backdrop-blur-xl ${currentPage === i + 1
                                        ? 'bg-red-500/80 text-white border-red-400'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-300 border-white/20 hover:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-xl"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Leyenda de compañías - Compacta y Responsiva */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-2.5 sm:p-3">
                {/* Versión móvil - Grid 2x2 ultra compacto */}
                <div className="grid grid-cols-2 gap-2 sm:hidden">
                    {Object.entries(companyConfig).map(([key, config]) => (
                        <div
                            key={key}
                            className="flex items-center gap-1.5 bg-white/5 rounded-md p-1.5 border border-white/5"
                        >
                            <div className={`w-5 h-5 ${config.legendColor} backdrop-blur-xl rounded-md border border-white/20 flex items-center justify-center flex-shrink-0`}>
                                <span className="text-[10px]">{config.icon}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-200 truncate">
                                {key.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Versión desktop - Inline compacto */}
                <div className="hidden sm:flex items-center gap-2 md:gap-3 justify-center flex-wrap">
                    {Object.entries(companyConfig).map(([key, config]) => (
                        <div
                            key={key}
                            className="inline-flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1 border border-white/5 transition-all duration-200"
                        >
                            <div className={`w-5 h-5 ${config.legendColor} backdrop-blur-xl rounded-md border border-white/20 flex items-center justify-center transition-all duration-200`}>
                                <span className="text-xs">{config.icon}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors duration-200 whitespace-nowrap">
                                {key.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};