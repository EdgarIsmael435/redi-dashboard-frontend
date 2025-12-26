import { useState } from "react";
import Select from "react-select";
import * as XLSX from "xlsx";
import api from "../../services/api";

/* =========================
   Select custom
========================= */
const CustomOption = ({ innerRef, innerProps, isFocused, isSelected, data }) => (
    <div
        ref={innerRef}
        {...innerProps}
        className={`flex items-center px-4 py-2.5 cursor-pointer transition-all duration-200
            ${isFocused ? "bg-white/10" : ""}
            ${isSelected ? "bg-red-600/20 font-medium" : ""}
        `}
    >
        <span className="text-white text-xs">{data.label}</span>
    </div>
);

const customStyles = {
    control: (base, state) => ({
        ...base,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: state.isFocused
            ? "1px solid rgb(17, 24, 39)"
            : "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        minHeight: "36px",
        padding: "0 4px",
        boxShadow: state.isFocused
            ? "0 0 0 1px rgba(17, 24, 39, 0.5)"
            : "none",
        transition: "all 0.3s ease",
        fontSize: "0.75rem",
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0 6px",
        fontSize: "0.75rem",
        color: "white",
    }),
    singleValue: (base) => ({
        ...base,
        color: "white",
        fontSize: "0.75rem",
    }),
    placeholder: (base) => ({
        ...base,
        color: "rgb(156, 163, 175)",
        fontSize: "0.75rem",
    }),
    input: (base) => ({
        ...base,
        color: "white",
        fontSize: "0.75rem",
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    menu: (base) => ({
        ...base,
        background: "rgba(17,24,39,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        fontSize: "0.75rem",
    }),
    option: (base, state) => ({
        ...base,
        background: state.isFocused
            ? "rgba(255,255,255,0.1)"
            : state.isSelected
                ? "rgba(59,130,246,0.2)"
                : "transparent",
        color: "white",
        cursor: "pointer",
        fontSize: "0.75rem",
        padding: "8px 12px",
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: "rgba(156,163,175,1)",
        padding: "0 6px",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
    }),
    indicatorSeparator: () => ({ display: "none" }),
};

const prioridadOptions = [
    { value: 1, label: "Alta" },
    { value: 2, label: "Media" },
    { value: 3, label: "Baja" },
];

/* =========================
   Component
========================= */
const ClientsBulkUpload = ({ onSuccess, onCancel }) => {
    const [file, setFile] = useState(null);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);

    const [prioridadGlobal, setPrioridadGlobal] = useState(1);
    const [montosGlobales, setMontosGlobales] = useState([100]);
    const [nuevoMonto, setNuevoMonto] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resultMsg, setResultMsg] = useState(null);

    const numerosRepetidos = (() => {
        const count = {};
        rows.forEach(r => {
            const num = String(r.numero_whatsapp || "").replace(/\D/g, "");
            if (!num) return;
            count[num] = (count[num] || 0) + 1;
        });
        return new Set(
            Object.keys(count).filter(num => count[num] > 1)
        );
    })();

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            const payload = {
                prioridad: prioridadGlobal,
                montos: montosGlobales,
                clientes: preview.map(r => ({
                    numero_whatsapp: "521" + r.numero_whatsapp,
                    nombre_cliente: r.nombre_cliente.toUpperCase(),
                    nombre_distribuidor: r.nombre_distribuidor.toUpperCase(),
                    nombre_grupo_wp: r.nombre_grupo_wp.toUpperCase(),
                })),
            };

            console.log("Payload enviado:", payload);

            const { data } = await api.post("/clients/bulk", payload);

            setResultMsg(
                data.message ||
                `Carga completada: ${data.inserted} insertados, ${data.skipped} omitidos`
            );

            onSuccess?.(); // refresca tabla
            onCancel?.();  // cierra modal
        } catch (err) {
            console.error(err);

            setResultMsg(
                err.response?.data?.message || "Error al cargar clientes"
            );
        } finally {
            setSubmitting(false);
        }
    };


    /* =========================
       Leer Excel
    ========================= */
    const handleFile = (file) => {
        setError(null);
        setRows([]);

        if (!file) return;

        if (!file.name.match(/\.(xlsx|csv)$/i)) {
            setError("Formato de archivo no permitido");
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, {
                    defval: "",
                    raw: false,
                });

                if (!json.length) {
                    setError("El archivo esta vacio");
                    return;
                }

                if (!json[0].numero_whatsapp || !json[0].nombre_cliente) {
                    setError(
                        "El archivo debe contener las columnas: numero_whatsapp y nombre_cliente"
                    );
                    return;
                }

                setRows(json);
            } catch {
                setError("No se pudo leer el archivo");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    /* =========================
       Preview
    ========================= */
    const preview = rows.map((r, i) => {
        const numero_whatsapp = String(r.numero_whatsapp || "").replace(/\D/g, "");
        const nombre_cliente = (r.nombre_cliente || "").trim();
        const nombre_distribuidor = (r.nombre_distribuidor || "").trim();
        const nombre_grupo_wp = (r.nombre_grupo_wp || "").trim();

        const esDuplicado = numerosRepetidos.has(numero_whatsapp);

        const valido =
            numero_whatsapp.length > 0 &&
            nombre_cliente.length > 0 &&
            nombre_distribuidor.length > 0 &&
            nombre_grupo_wp.length > 0 &&
            !esDuplicado;

        return {
            index: i + 1,
            numero_whatsapp,
            nombre_cliente,
            nombre_distribuidor,
            nombre_grupo_wp,
            montos: montosGlobales,
            esDuplicado,
            valido,
        };
    });

    const hasInvalidRows = preview.some(r => !r.valido);

    const addMonto = () => {
        const m = Number(nuevoMonto);
        if (!m || montosGlobales.includes(m)) return;
        setMontosGlobales([...montosGlobales, m]);
        setNuevoMonto("");
    };

    const removeMonto = (m) => {
        if (montosGlobales.length === 1) return;
        setMontosGlobales(montosGlobales.filter((x) => x !== m));
    };

    return (
        <div className="space-y-6">
            {/* Subida */}
            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center">
                <input
                    type="file"
                    accept=".xlsx,.csv"
                    id="bulkFile"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files[0];
                        setFile(f);
                        handleFile(f);
                    }}
                />
                <label
                    htmlFor="bulkFile"
                    className="cursor-pointer px-4 py-2 rounded-lg bg-slate-700/50 text-sm text-gray-200"
                >
                    Seleccionar archivo
                </label>

                {file && (
                    <p className="mt-2 text-xs text-green-400">
                        {file.name} · {rows.length} registros
                    </p>
                )}
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            </div>

            {/* Opciones */}
            {rows.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                            Prioridad
                        </label>
                        <Select
                            value={prioridadOptions.find(
                                (o) => o.value === prioridadGlobal
                            )}
                            onChange={(opt) => setPrioridadGlobal(opt.value)}
                            options={prioridadOptions}
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            isSearchable={false}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                            Montos permitidos
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={nuevoMonto}
                                onChange={(e) => setNuevoMonto(e.target.value)}
                                className="w-full bg-slate-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 text-white focus:ring-red-500 focus:border-transparent transition-all hover:bg-slate-700/70 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                onClick={addMonto}
                                className="px-3 py-2 rounded-lg bg-green-600/20 text-green-300 text-sm"
                            >
                                Agregar
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {montosGlobales.map((m) => (
                                <span
                                    key={m}
                                    className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400"
                                >
                                    ${m}
                                    <button
                                        onClick={() => removeMonto(m)}
                                        className="ml-2"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* =========================
               Preview (WRAPPER + INNER)
            ========================= */}
            {preview.length > 0 && (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="max-h-[320px] overflow-auto scrollbar-redi">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-800/80 sticky top-0 text-white border-b-2">
                                <tr>
                                    <th className="px-3 py-2">#</th>
                                    <th className="px-3 py-2">WhatsApp</th>
                                    <th className="px-3 py-2">Cliente</th>
                                    <th className="px-3 py-2">Distribuidor</th>
                                    <th className="px-3 py-2">Grupo</th>
                                    <th className="px-3 py-2">Montos</th>
                                    <th className="px-3 py-2">Validación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((r) => (
                                    <tr key={r.index} className={`border-t border-white/5 text-white ${!r.valido ? "bg-red-500/10" : ""}`}>
                                        <td className="px-3 py-2">{r.index}</td>
                                        <td className="px-3 py-2 text-green-400">
                                            {r.numero_whatsapp}
                                        </td>
                                        <td className="px-3 py-2">{r.nombre_cliente}</td>
                                        <td className="px-3 py-2">
                                            {r.nombre_distribuidor}
                                        </td>
                                        <td className="px-3 py-2">
                                            {r.nombre_grupo_wp}
                                        </td>
                                        <td className="px-3 py-2">
                                            {r.montos.map((m) => (
                                                <span key={m}>${m} </span>
                                            ))}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-center">
                                            {r.valido ? (
                                                <span className="text-green-400">OK</span>
                                            ) : r.esDuplicado ? (
                                                <span className="text-red-400">Duplicado</span>
                                            ) : (
                                                <span className="text-red-400">Campos incompletos</span>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {resultMsg && (
                <p className="text-sm text-green-400 text-right">
                    {resultMsg}
                </p>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3">
                <button onClick={onCancel} className="px-4 py-2 text-white bg-slate-700/50 rounded-lg text-sm">
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={
                        submitting ||
                        !preview.length ||
                        montosGlobales.length === 0 ||
                        hasInvalidRows
                    }
                    className="px-4 py-2 rounded-lg
                            bg-gradient-to-r from-red-500 to-red-600
                            text-white text-sm font-medium
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            flex items-center gap-2">
                    {submitting && (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    {submitting ? "Procesando..." : "Continuar"}
                </button>
            </div>
        </div>
    );
};

export default ClientsBulkUpload;
