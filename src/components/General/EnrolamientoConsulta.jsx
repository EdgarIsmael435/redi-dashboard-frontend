import { useState } from "react";
import { SearchCheck, Search, Upload, Download, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../services/api";
import { HeaderContainer } from "./HeaderContainer";

// Máximo de DNs por petición (igual que el backend)
const TAM_PETICION = 50;

const limpiarDn = (valor) => String(valor ?? "").replace(/\D/g, "");

const estadoEnrol = (r) => {
    if (r.enrolado === true) return { label: "Vinculada", dot: "bg-green-400", classes: "bg-green-500/15 text-green-200 border-green-500/30" };
    if (r.enrolado === false) return { label: "No vinculada", dot: "bg-red-400", classes: "bg-red-500/15 text-red-200 border-red-500/30" };
    return { label: "Sin verificar", dot: "bg-gray-400", classes: "bg-white/5 text-gray-300 border-white/20" };
};

const EnrolBadge = ({ resultado }) => {
    const estado = estadoEnrol(resultado);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium whitespace-nowrap ${estado.classes}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${estado.dot}`}></span>
            {estado.label}
        </span>
    );
};

// Lee la columna de DN del Excel (encabezado DN / Número / Línea, o la primera columna)
const leerDnsDeExcel = (data) => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
    if (!filas.length) return [];

    const encabezado = filas[0].map((c) => String(c).trim().toLowerCase());
    let col = encabezado.findIndex((c) => /^(dn|n[uú]mero|linea|l[ií]nea|telefono|tel[eé]fono)$/.test(c));
    let inicio = 1;

    if (col === -1) {
        col = 0;
        // Si la primera fila no es un número, es encabezado
        inicio = limpiarDn(filas[0][0]).length === 0 ? 1 : 0;
    }

    return filas
        .slice(inicio)
        .map((f) => String(f[col] ?? "").trim())
        .filter((v) => v !== "");
};

const EnrolamientoConsulta = () => {
    // Consulta individual
    const [dn, setDn] = useState("");
    const [consultando, setConsultando] = useState(false);
    const [resultadoIndividual, setResultadoIndividual] = useState(null);
    const [errorIndividual, setErrorIndividual] = useState(null);

    // Consulta masiva
    const [archivo, setArchivo] = useState(null);
    const [dnsArchivo, setDnsArchivo] = useState([]);
    const [errorArchivo, setErrorArchivo] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [resultados, setResultados] = useState([]);

    const handleConsultaIndividual = async (e) => {
        e.preventDefault();
        const limpio = limpiarDn(dn);
        setResultadoIndividual(null);
        setErrorIndividual(null);

        if (limpio.length !== 10) {
            setErrorIndividual("El DN debe tener 10 dígitos");
            return;
        }

        setConsultando(true);
        try {
            const { data } = await api.post("/enrolamiento/consulta", { dns: [limpio] });
            setResultadoIndividual(data.data[0]);
        } catch (err) {
            console.error("Error consultando enrolamiento:", err);
            setErrorIndividual("No se pudo consultar, intenta de nuevo");
        } finally {
            setConsultando(false);
        }
    };

    const handleArchivo = (file) => {
        setErrorArchivo(null);
        setDnsArchivo([]);
        setResultados([]);
        setProgreso(0);
        setArchivo(file || null);

        if (!file) return;
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            setErrorArchivo("Formato de archivo no permitido");
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const dns = leerDnsDeExcel(new Uint8Array(evt.target.result));
                // Quitar duplicados conservando el orden
                const unicos = [...new Map(dns.map((d) => [limpiarDn(d) || d, d])).values()];
                if (!unicos.length) {
                    setErrorArchivo("No se encontraron DNs en el archivo");
                    return;
                }
                setDnsArchivo(unicos);
            } catch {
                setErrorArchivo("No se pudo leer el archivo");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleConsultaMasiva = async () => {
        if (!dnsArchivo.length || procesando) return;
        setProcesando(true);
        setResultados([]);
        setProgreso(0);
        setErrorArchivo(null);

        const acumulados = [];
        try {
            for (let i = 0; i < dnsArchivo.length; i += TAM_PETICION) {
                const tanda = dnsArchivo.slice(i, i + TAM_PETICION);
                try {
                    const { data } = await api.post("/enrolamiento/consulta", { dns: tanda });
                    acumulados.push(...data.data);
                } catch (err) {
                    console.error("Error en tanda de enrolamiento:", err);
                    acumulados.push(...tanda.map((d) => ({ dn: d, enrolado: null, error: "No se pudo verificar" })));
                }
                setResultados([...acumulados]);
                setProgreso(acumulados.length);
            }
        } finally {
            setProcesando(false);
        }
    };

    const descargarResultados = () => {
        const filas = resultados.map((r) => ({
            "DN": r.dn,
            "Enrolamiento": estadoEnrol(r).label,
            "Detalle": r.error || "",
        }));
        const sheet = XLSX.utils.json_to_sheet(filas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "Enrolamiento");
        XLSX.writeFile(workbook, `Enrolamiento_${new Date().toLocaleDateString("sv-SE")}.xlsx`);
    };

    const descargarPlantilla = () => {
        const sheet = XLSX.utils.aoa_to_sheet([["DN"], ["5512345678"]]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "DNs");
        XLSX.writeFile(workbook, "Plantilla_Enrolamiento.xlsx");
    };

    const resumen = {
        vinculadas: resultados.filter((r) => r.enrolado === true).length,
        noVinculadas: resultados.filter((r) => r.enrolado === false).length,
        sinVerificar: resultados.filter((r) => r.enrolado !== true && r.enrolado !== false).length,
    };

    const inputClasses = "w-full px-3 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-900/50 transition-all text-xs";
    const primaryButton = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 shadow-md text-xs";
    const secondaryButton = "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs";
    const spinner = <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>;

    return (
        <div className="space-y-6">
            <HeaderContainer
                icon={SearchCheck}
                title="Consulta Enrolamiento"
                subtitle="Verifica si una línea Movistar está vinculada"
                variant="default"
            />

            {/* Consulta por línea */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Consulta por línea</h3>
                <form onSubmit={handleConsultaIndividual} className="flex flex-col md:flex-row gap-3 md:items-center">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={14}
                        placeholder="DN a 10 dígitos"
                        value={dn}
                        onChange={(e) => setDn(e.target.value)}
                        className={`${inputClasses} md:w-64 font-mono`}
                    />
                    <button type="submit" disabled={consultando || !dn.trim()} className={primaryButton}>
                        {consultando ? spinner : <Search className="w-4 h-4" />}
                        Consultar
                    </button>
                    {resultadoIndividual && (
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-200">{resultadoIndividual.dn}</span>
                            <EnrolBadge resultado={resultadoIndividual} />
                            {resultadoIndividual.error && (
                                <span className="text-[11px] text-gray-400">{resultadoIndividual.error}</span>
                            )}
                        </div>
                    )}
                    {errorIndividual && <span className="text-xs text-red-300">{errorIndividual}</span>}
                </form>
            </div>

            {/* Consulta masiva */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">Consulta masiva</h3>
                    <button type="button" onClick={descargarPlantilla} className={secondaryButton}>
                        <FileDown className="w-4 h-4" />
                        Descargar plantilla
                    </button>
                </div>

                <div className="border border-dashed border-white/20 rounded-xl p-6 text-center">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        id="enrolFile"
                        className="hidden"
                        disabled={procesando}
                        onChange={(e) => {
                            handleArchivo(e.target.files[0]);
                            e.target.value = "";
                        }}
                    />
                    <label
                        htmlFor="enrolFile"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-sm text-gray-200 ${procesando ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-slate-600/50"}`}
                    >
                        <Upload className="w-4 h-4" />
                        Seleccionar Excel
                    </label>
                    <p className="mt-2 text-[11px] text-gray-400">
                        Una columna con el DN (encabezado "DN"). Se ignoran duplicados.
                    </p>
                    {archivo && dnsArchivo.length > 0 && (
                        <p className="mt-2 text-xs text-green-400">
                            {archivo.name} · {dnsArchivo.length} DNs
                        </p>
                    )}
                    {errorArchivo && <p className="mt-2 text-xs text-red-400">{errorArchivo}</p>}
                </div>

                {dnsArchivo.length > 0 && (
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <button type="button" onClick={handleConsultaMasiva} disabled={procesando} className={primaryButton}>
                            {procesando ? spinner : <SearchCheck className="w-4 h-4" />}
                            {procesando ? `Consultando ${progreso}/${dnsArchivo.length}` : `Consultar ${dnsArchivo.length} DNs`}
                        </button>

                        {procesando && (
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 transition-all duration-300"
                                    style={{ width: `${(progreso / dnsArchivo.length) * 100}%` }}
                                ></div>
                            </div>
                        )}

                        {!procesando && resultados.length > 0 && (
                            <>
                                <span className="text-xs text-gray-300">
                                    {resultados.length} consultadas · {resumen.vinculadas} vinculadas · {resumen.noVinculadas} no vinculadas
                                    {resumen.sinVerificar > 0 && ` · ${resumen.sinVerificar} sin verificar`}
                                </span>
                                <button type="button" onClick={descargarResultados} className={`${secondaryButton} md:ml-auto`}>
                                    <Download className="w-4 h-4" />
                                    Descargar resultados
                                </button>
                            </>
                        )}
                    </div>
                )}

                {resultados.length > 0 && (
                    <div className="max-h-96 overflow-y-auto border border-white/10 rounded-xl">
                        <table className="w-full">
                            <thead className="bg-white/10 sticky top-0 backdrop-blur-xl">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">#</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">DN</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Enrolamiento</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((r, i) => (
                                    <tr key={`${r.dn}-${i}`} className="border-b border-white/5">
                                        <td className="px-3 py-1.5 text-xs text-gray-400">{i + 1}</td>
                                        <td className="px-3 py-1.5 font-mono text-xs text-gray-200">{r.dn}</td>
                                        <td className="px-3 py-1.5"><EnrolBadge resultado={r} /></td>
                                        <td className="px-3 py-1.5 text-[11px] text-gray-400">{r.error || ""}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnrolamientoConsulta;
