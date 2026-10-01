import { useState } from "react";
import { FileSpreadsheet, Download } from "lucide-react";
import Select from "react-select";
import * as XLSX from "xlsx";
import api from "../../services/api";
import { HeaderContainer } from "./HeaderContainer";
import { customStyles, CustomOption } from "../Recharges/Filter";
import { companyOptions, statusOptions } from "../../constants/recharges";

// Fecha local en formato YYYY-MM-DD
const hoy = () => new Date().toLocaleDateString("sv-SE");

const formatFecha = (fecha, conHora = false) => {
    if (!fecha) return "";
    return new Date(fecha).toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(conHora && { hour: "2-digit", minute: "2-digit" }),
    });
};

const textoEnrolamiento = (r) => {
    if (r.Compania?.toLowerCase() !== "movistar") return "";
    if (r.Enrolado === 1 || r.Enrolado === true) return "Vinculada";
    if (r.Enrolado === 0 || r.Enrolado === false) return "No vinculada";
    return "Sin verificar";
};

// Mismas columnas que el panel de recargas (+ cliente, operador y fechas)
const toFila = (r) => ({
    "ID": r.id_ticketRecarga,
    "Estado": r.Estado,
    "Compañía": r.Compania,
    "Producto": r.Producto || "",
    "Mayorista": r.Mayorista || "",
    "Monto": Number(r.Monto) || 0,
    "Número": r.Numero,
    "Enrolamiento": textoEnrolamiento(r),
    "Fecha Panza": formatFecha(r.FechaPanza),
    "Folio": r.Folio || (r.FolioAuto ? `1104${r.id_ticketRecarga}` : ""),
    "Prioridad": r.PrioridadCliente,
    "Cliente": r.Cliente,
    "Distribuidor": r.Distribuidor,
    "Operador": r.Operador || "",
    "Fecha Solicitud": formatFecha(r.FechaSolicitud, true),
    "Fecha Folio": formatFecha(r.FechaFolio, true),
});

const Reports = () => {
    const [desde, setDesde] = useState(hoy());
    const [hasta, setHasta] = useState(hoy());
    const [todo, setTodo] = useState(false);
    const [filterCompany, setFilterCompany] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const selectedCompany = companyOptions.find((o) => o.value === filterCompany) || companyOptions[0];
    const selectedStatus = statusOptions.find((o) => o.value === filterStatus) || statusOptions[0];

    const handleDescargar = async () => {
        if (!todo && desde > hasta) {
            setMensaje({ tipo: "error", texto: "La fecha Desde no puede ser mayor que Hasta" });
            return;
        }

        setLoading(true);
        setMensaje(null);

        try {
            const { data } = await api.get("/tickets/reporte", { params: todo ? {} : { desde, hasta } });

            const rows = (data.data || []).filter((r) => {
                const matchesCompany = filterCompany === "all" || r.Compania?.toLowerCase() === filterCompany;
                const matchesStatus = filterStatus === "all" || r.Estado === filterStatus;
                return matchesCompany && matchesStatus;
            });

            if (rows.length === 0) {
                setMensaje({ tipo: "info", texto: "No hay registros con esos filtros" });
                return;
            }

            const sheet = XLSX.utils.json_to_sheet(rows.map(toFila));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Recargas");

            const nombre = todo
                ? "Recargas_todo.xlsx"
                : desde === hasta ? `Recargas_${desde}.xlsx` : `Recargas_${desde}_a_${hasta}.xlsx`;
            XLSX.writeFile(workbook, nombre);

            setMensaje({ tipo: "ok", texto: `Se descargaron ${rows.length} registros` });
        } catch (err) {
            console.error("Error generando reporte:", err);
            setMensaje({ tipo: "error", texto: "No se pudo generar el reporte" });
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-3 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg text-white focus:outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-900/50 transition-all text-xs [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed";

    const mensajeClasses = {
        ok: "text-green-300",
        info: "text-gray-300",
        error: "text-red-300",
    };

    return (
        <div className="space-y-6">
            <HeaderContainer
                icon={FileSpreadsheet}
                title="Reportes"
                subtitle="Descarga la lista de recargas en Excel"
                variant="default"
            />

            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Desde</label>
                        <input type="date" value={desde} max={hasta} disabled={todo} onChange={(e) => setDesde(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Hasta</label>
                        <input type="date" value={hasta} min={desde} disabled={todo} onChange={(e) => setHasta(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Compañía</label>
                        <Select
                            value={selectedCompany}
                            onChange={(o) => setFilterCompany(o.value)}
                            options={companyOptions}
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            isSearchable={false}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Estado</label>
                        <Select
                            value={selectedStatus}
                            onChange={(o) => setFilterStatus(o.value)}
                            options={statusOptions}
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            isSearchable={false}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-3 mt-4">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none md:mr-auto">
                        <input
                            type="checkbox"
                            checked={todo}
                            onChange={(e) => setTodo(e.target.checked)}
                            className="w-4 h-4 accent-red-600 cursor-pointer"
                        />
                        Todo (sin fechas)
                    </label>
                    {mensaje && (
                        <span className={`text-xs ${mensajeClasses[mensaje.tipo]}`}>{mensaje.texto}</span>
                    )}
                    <button
                        type="button"
                        onClick={handleDescargar}
                        disabled={loading || (!todo && (!desde || !hasta))}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 shadow-md text-xs"
                    >
                        {loading ? (
                            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Descargar Excel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
