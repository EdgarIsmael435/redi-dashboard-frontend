import { useState, useEffect } from "react";
import Tabla from "../General/Table";
import api from "../../services/api";
import Modal from "../General/Modal";
import UserForm from "./UserForm";
import { UserCircle, UserPlus } from "lucide-react";
import { HeaderContainer } from "../General/HeaderContainer";

const UsersAdmin = () => {

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Al hacer clic en editar:
  const handleEdit = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setOpenEdit(true);
  };

  // Al hacer clic en eliminar:
  const handleDeleteModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setOpenDelete(true);
  };


  const handleDelete = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`);
      setOpenDelete(false);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error.response?.data || error.message);
    }
  };


  const obtenerUsuarios = async () => {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const columns = [
    {
      header: 'Usuario',
      accessor: 'nombre_usuario',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500/80 backdrop-blur-xl rounded-lg flex items-center justify-center text-white font-medium text-xs border border-white/20">
            {item.nombre_usuario.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-white">{item.nombre_usuario}</span>
        </div>
      )
    },
    { header: 'Nombre', accessor: 'nombre', sortable: true },
    { header: 'Apellido', accessor: 'apellido', sortable: true },
    {
      header: 'Rol',
      accessor: 'id_rol',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm border ${item.id_rol === 1
            ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
            : 'bg-green-500/20 text-green-200 border-green-500/30'
            }`}
        >
          {item.id_rol === 1 ? 'Admin' : 'Operador'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: 'activo',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm border ${item.activo
            ? 'bg-green-500/20 text-green-200 border-green-500/30'
            : 'bg-red-500/20 text-red-200 border-red-500/30'
            }`}
        >
          {item.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  const filters = [
    {
      key: 'id_rol',
      placeholder: 'Filtrar por rol',
      options: [
        { value: 1, label: 'Admin' },
        { value: 2, label: 'Operador' },
      ],
    },
    {
      key: 'activo',
      placeholder: 'Filtrar por estado',
      options: [
        { value: 1, label: 'Activos' },
        { value: 2, label: 'Inactivos' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <HeaderContainer
        icon={UserCircle}
        title="Gestión de Usuarios"
        subtitle="Gestión de usuarios para acceder al sistema"
        status="online"
        variant="default"
        showBadge={false}
      />

      <Tabla
        data={usuarios}
        columns={columns}
        filters={filters}
        itemsPerPage={5}
        onEdit={handleEdit}
        onDelete={handleDeleteModal}
        emptyMessage="No hay usuarios registrados"
        loading={loading}
        headerAction={(
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-xl shadow-lg transition-all border border-red-500/30"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      />

      <Modal
        isOpen={openEdit || openCreate}
        onClose={() => {
          setOpenEdit(false);
          setOpenCreate(false);
          setUsuarioSeleccionado(null);
        }}
        title={usuarioSeleccionado ? "Editar Usuario" : "Nuevo Usuario"}
        subTitle={
          usuarioSeleccionado
            ? "Actualiza la información del usuario"
            : "Completa los datos del nuevo usuario"
        }
        icon={UserCircle}
        size="lg"
      >
        <UserForm
          usuario={usuarioSeleccionado}
          onSubmit={obtenerUsuarios}
          onClose={() => {
            setOpenEdit(false);
            setOpenCreate(false);
            setUsuarioSeleccionado(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        <p className="text-white">
          ¿Seguro que deseas eliminar al usuario <b>{usuarioSeleccionado?.nombre_usuario}</b>?
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setOpenDelete(false)}
            className="px-4 py-2 rounded-lg bg-slate-700/50 text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm border border-white/10 hover:border-white/20"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleDelete(usuarioSeleccionado?.id_usuario_redi)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r text-gray-300 from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-lg min-w-[110px]"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersAdmin;