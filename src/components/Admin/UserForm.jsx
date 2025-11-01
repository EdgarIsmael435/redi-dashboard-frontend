import { useState, useEffect } from "react";
import api from "../../services/api";
import Select from "react-select";
import { User, Lock, UserCircle, Shield, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

// Componente para opciones personalizadas
const CustomOption = ({ innerRef, innerProps, isFocused, isSelected, data }) => {
    return (
        <div
            ref={innerRef}
            {...innerProps}
            className={`flex items-center px-4 py-2.5 cursor-pointer transition-all duration-200
                ${isFocused ? "bg-white/10" : ""}
                ${isSelected ? "bg-red-600/20 font-medium" : ""}
            `}
        >
            <span className="text-white text-sm">{data.label}</span>
        </div>
    );
};

// Estilos personalizados para react-select
const customStyles = {
    control: (base, state) => ({
        ...base,
        background: "rgba(51, 65, 85, 0.5)",
        backdropFilter: "blur(12px)",
        border: state.isFocused
            ? "1px solid rgb(239, 68, 68)"
            : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        minHeight: "42px",
        padding: "0 6px",
        boxShadow: state.isFocused
            ? "0 0 0 2px rgba(239, 68, 68, 0.5)"
            : "none",
        transition: "all 0.3s ease",
        "&:hover": {
            background: "rgba(51, 65, 85, 0.7)",
            border: "1px solid rgba(255,255,255,0.2)"
        }
    }),

    valueContainer: (base) => ({
        ...base,
        padding: "0 6px 0 32px",
        fontSize: "0.875rem",
        color: "white"
    }),

    singleValue: (base) => ({
        ...base,
        color: "white",
        fontSize: "0.875rem"
    }),

    placeholder: (base) => ({
        ...base,
        color: "rgb(107, 114, 128)",
        fontSize: "0.875rem"
    }),

    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
        fontFamily: "inherit"
    }),

    menu: (base) => ({
        ...base,
        background: "rgba(17,24,39,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        zIndex: 9999
    }),

    option: (base, state) => ({
        ...base,
        background: state.isFocused
            ? "rgba(255,255,255,0.1)"
            : state.isSelected
                ? "rgba(239,68,68,0.2)"
                : "transparent",
        color: "white",
        cursor: "pointer",
        fontSize: "0.875rem",
        padding: "10px 14px",
        transition: "all 0.2s ease"
    }),

    dropdownIndicator: (base, state) => ({
        ...base,
        color: "rgba(156,163,175,1)",
        padding: "0 8px",
        transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        "&:hover": {
            color: "rgba(239,68,68,0.8)"
        }
    }),

    indicatorSeparator: () => ({ display: "none" })
};

const UserForm = ({ usuario = null, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        nombreUsuario: "",
        nombre: "",
        apellido: "",
        contraseniaUsuario: "",
        id_rol: 2,
        activo: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [touched, setTouched] = useState({});

    const isEditMode = Boolean(usuario);

    // Validaciones
    const isValid = {
        nombreUsuario: formData.nombreUsuario.trim().length >= 3,
        nombre: formData.nombre.trim().length >= 2,
        apellido: formData.apellido.trim().length >= 2,
        contraseniaUsuario: isEditMode || formData.contraseniaUsuario.length >= 6,
    };

    const isFormValid = isValid.nombreUsuario && isValid.nombre && isValid.apellido && isValid.contraseniaUsuario;

    // Opciones para el select de roles
    const roleOptions = [
        { value: 1, label: "Administrador" },
        { value: 2, label: "Operador" }
    ];

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombreUsuario: usuario.nombreUsuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                contraseniaUsuario: "",
                id_rol: usuario.id_rol,
                activo: usuario.activo,
            });
        }
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setTouched((prev) => ({ ...prev, [name]: true }));
        if (error) setError(null);
    };

    const handleRoleChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            id_rol: selectedOption.value
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = isEditMode
                ? `/usuarios/${usuario.id_usuarioRedi}`
                : `/usuarios`;

            const method = isEditMode ? "put" : "post";

            const dataToSend = { ...formData };
            if (isEditMode && !dataToSend.contraseniaUsuario) {
                delete dataToSend.contraseniaUsuario;
            }

            await api[method](url, dataToSend); // 👈 el token y expiración se manejan automáticamente

            onSubmit?.();
            onClose?.();
        } catch (err) {
            console.error("Error guardando usuario:", err.response?.data || err.message);
            setError(err.response?.data?.error || err.response?.data?.message || "Error al guardar el usuario");
        } finally {
            setLoading(false);
        }

    };

    const selectedRole = roleOptions.find(option => option.value === formData.id_rol);

    return (
        <div className="space-y-5 text-white">
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Campos principales */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Usuario"
                            name="nombreUsuario"
                            value={formData.nombreUsuario}
                            onChange={handleChange}
                            icon={<User className="w-4 h-4" />}
                            required
                            isValid={isValid.nombreUsuario}
                            touched={touched.nombreUsuario}
                            errorMessage="El usuario debe tener al menos 3 caracteres"
                        />
                        <InputField
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            icon={<UserCircle className="w-4 h-4" />}
                            required
                            isValid={isValid.nombre}
                            touched={touched.nombre}
                            errorMessage="El nombre debe tener al menos 2 caracteres"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            icon={<UserCircle className="w-4 h-4" />}
                            required
                            isValid={isValid.apellido}
                            touched={touched.apellido}
                            errorMessage="El apellido debe tener al menos 2 caracteres"
                        />
                        <InputField
                            label={`Contraseña${isEditMode ? " (opcional)" : ""}`}
                            type="password"
                            name="contraseniaUsuario"
                            value={formData.contraseniaUsuario}
                            onChange={handleChange}
                            icon={<Lock className="w-4 h-4" />}
                            placeholder={isEditMode ? "Dejar en blanco para mantener" : ""}
                            required={!isEditMode}
                            isValid={isValid.contraseniaUsuario}
                            touched={touched.contraseniaUsuario}
                            errorMessage="La contraseña debe tener al menos 6 caracteres"
                        />
                    </div>
                </div>

                {/* Configuración */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                    <div>
                        <label className="block text-xs font-medium mb-2 text-gray-400 uppercase tracking-wide">
                            Rol del Usuario
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                                <Shield className="w-4 h-4" />
                            </div>
                            <Select
                                value={selectedRole}
                                onChange={handleRoleChange}
                                options={roleOptions}
                                styles={customStyles}
                                components={{ Option: CustomOption }}
                                isSearchable={false}
                                isClearable={false}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                placeholder="Seleccionar rol"
                            />
                        </div>
                    </div>

                    <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" />
                                Usuario activo
                            </span>
                            <div className="relative">
                                <input
                                    id="activo"
                                    type="checkbox"
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-red-500 transition-all"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-2.5 pt-5 border-t border-white/5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-slate-700/50 text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm border border-white/10 hover:border-white/20"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-lg min-w-[110px] disabled:shadow-none"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Guardando
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-1.5">
                                {isEditMode ? "Actualizar" : "Crear"}
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Componente reutilizable para inputs con iconos y validación
const InputField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    required = false,
    placeholder = "",
    icon,
    isValid = true,
    touched = false,
    errorMessage = ""
}) => {
    const showError = required && touched && !isValid;
    const showSuccess = required && touched && isValid && value.length > 0;

    return (
        <div>
            <label className="block text-xs font-medium mb-2 text-gray-400 uppercase tracking-wide">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${showError ? 'text-red-400' : showSuccess ? 'text-green-400' : 'text-gray-400'
                        }`}>
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-slate-700/50 border rounded-xl ${icon ? 'pl-10' : 'pl-4'} ${showSuccess ? 'pr-10' : 'pr-4'
                        } py-2.5 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-gray-500 hover:bg-slate-700/70 ${showError
                            ? 'border-red-500/50 focus:ring-red-500 focus:border-transparent'
                            : showSuccess
                                ? 'border-green-500/50 focus:ring-green-500 focus:border-transparent'
                                : 'border-white/10 focus:ring-red-500 focus:border-transparent'
                        }`}
                />
                {showSuccess && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                )}
                {showError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                )}
            </div>
            {showError && errorMessage && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400"></span>
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default UserForm;