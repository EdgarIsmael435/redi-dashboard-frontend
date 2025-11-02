import { useState, useEffect } from "react";
import api from "../../services/api";
import Tabla from "../General/Table";
import Modal from "../General/Modal";
import { HeaderContainer } from "../General/HeaderContainer";
import { BookUser, UserPlus } from "lucide-react";
import ClientForm from "./ClientForm";


const ClientsAdmin = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    //Cargar clientes
    const obtenerClientes = async () => {
        try {
            const res = await api.get("/clients");
            setClientes(res.data);
        } catch (err) {
            console.error(" Error al obtener clientes:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        obtenerClientes();
    }, []);

    //Abrir modal de edición
    const handleEdit = (cliente) => {
        setClienteSeleccionado(cliente);
        setOpenEdit(true);
    };

    //Confirmación de borrado
    const handleDeleteModal = (cliente) => {
        setClienteSeleccionado(cliente);
        setOpenDelete(true);
    };

    // Eliminar cliente
    const handleDelete = async (id) => {
        try {
            await api.delete(`/clients/${id}`);
            setOpenDelete(false);
            obtenerClientes();
        } catch (error) {
            console.error("Error eliminando cliente:", error.response?.data || error.message);
        }
    };


    //Columnas de la tabla
    const columns = [
        {
            header: "WhatsApp",
            accessor: "numero_whatsapp",
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2">
                    <span className="p-1 text-xs bg-green-500/80 rounded-lg font-medium text-white">{item.numero_whatsapp}</span>
                </div>
            ),
        },
        { header: "Cliente", accessor: "nombre_cliente", sortable: true },
        { header: "Distribuidor", accessor: "nombre_distribuidor", sortable: true },
        {
            header: "Prioridad",
            accessor: "prioridad",
            render: (item) => (
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm border ${item.id_prioridad_cliente === 1
                        ? "bg-blue-500/20 text-blue-200 border-blue-500/30"//Baja
                        : item.id_prioridad_cliente === 2
                            ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"// Media
                            : "bg-red-500/20 text-red-200 border-red-500/30"// Alta
                        }`}
                >
                    {item.prioridad || "Normal"}
                </span>

            ),
        },
        {
            header: "Montos",
            accessor: "montos",
            render: (item) =>
                item.montos ? (
                    <div className="flex flex-wrap gap-1">
                        {item.montos.split(",").map((monto, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 text-[11px] font-medium rounded-full 
                       bg-gradient-to-r from-blue-500/20 to-blue-600/20 
                       text-blue-200 border border-blue-500/30 
                       backdrop-blur-sm shadow-sm"
                            >
                                ${monto}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-400 text-xs">Sin Montos</span>
                ),
        },
        {
            header: "Estado",
            accessor: "activo",
            render: (item) => (
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm border ${item.activo
                        ? "bg-green-500/20 text-green-200 border-green-500/30"
                        : "bg-red-500/20 text-red-200 border-red-500/30"
                        }`}
                >
                    {item.activo ? "Activo" : "Inactivo"}
                </span>
            ),
        },
    ];

    //Filtros (opcional)
    const filters = [
        {
            key: "id_prioridad_cliente",
            placeholder: "Filtrar por prioridad",
            options: [
                { value: 1, label: "Normal" },
                { value: 2, label: "Alta" },
                { value: 3, label: "Crítica" },
            ],
        },
        {
            key: "activo",
            placeholder: "Filtrar por estado",
            options: [
                { value: 1, label: "Activos" },
                { value: 0, label: "Inactivos" },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            <HeaderContainer
                icon={BookUser}
                title="Directorio de Clientes"
                subtitle="Directorio de clientes y montos permitidos"
                status="online"
                variant="default"
                showBadge={false}
            />

            <Tabla
                data={clientes}
                columns={columns}
                filters={filters}
                itemsPerPage={5}
                onEdit={handleEdit}
                onDelete={handleDeleteModal}
                emptyMessage="No hay clientes registrados"
                loading={loading}
                headerAction={
                    <button
                        onClick={() => setOpenCreate(true)}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-xl shadow-lg transition-all border border-green-500/30"
                    >
                        <UserPlus className="w-4 h-4" />
                        Nuevo Cliente
                    </button>
                }
            />

            {/* Modal Crear / Editar */}
            <Modal
                isOpen={openEdit || openCreate}
                onClose={() => {
                    setOpenEdit(false);
                    setOpenCreate(false);
                    setClienteSeleccionado(null);
                }}
                title={clienteSeleccionado ? "Editar Cliente" : "Nuevo Cliente"}
                subTitle={
                    clienteSeleccionado
                        ? "Actualiza la información del cliente"
                        : "Completa los datos del nuevo cliente"
                }
                icon={BookUser}
                size="lg"
            >
                <ClientForm
                    cliente={clienteSeleccionado}
                    onSubmit={obtenerClientes}
                    onClose={() => {
                        setOpenEdit(false);
                        setOpenCreate(false);
                        setClienteSeleccionado(null);
                    }}
                />
            </Modal>

            {/* Modal Eliminar */}
            <Modal
                isOpen={openDelete}
                onClose={() => setOpenDelete(false)}
                title="Confirmar eliminación"
                size="sm"
            >
                <p className="text-white">
                    ¿Seguro que deseas eliminar al cliente{" "}
                    <b>{clienteSeleccionado?.nombre_cliente}</b>?
                </p>
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={() => setOpenDelete(false)}
                        className="px-4 py-2 rounded-lg bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-white/10 hover:border-white/20 text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => handleDelete(clienteSeleccionado?.id_cliente)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-gray-200 font-medium text-sm min-w-[110px]"
                    >
                        Eliminar
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ClientsAdmin;
