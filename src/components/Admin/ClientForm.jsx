import { useState, useEffect } from "react";
import api from "../../services/api";
import Select from "react-select";
import { Trash, DollarSign, Phone, User, Users, AlertCircle, CheckCircle, Loader2, Plus, Flag } from "lucide-react";

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

const ClientForm = ({ cliente, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    numero_whatsapp: "",
    nombre_cliente: "",
    nombre_distribuidor: "",
    id_prioridad_cliente: 1,
    activo: 1,
    montos: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});

  const isEditMode = Boolean(cliente);

  // Opciones para el select de prioridad
  const priorityOptions = [
    { value: 1, label: "Alta" },
    { value: 2, label: "Media" },
    { value: 3, label: "Baja" }
  ];

  // Validaciones
  const isValid = {
    numero_whatsapp: formData.numero_whatsapp.trim().length >= 10,
    nombre_cliente: formData.nombre_cliente.trim().length >= 2,
  };

  const isFormValid = isValid.numero_whatsapp && isValid.nombre_cliente;

  useEffect(() => {
    if (cliente) {
      setFormData({
        numero_whatsapp: cliente.numero_whatsapp,
        nombre_cliente: cliente.nombre_cliente,
        nombre_distribuidor: cliente.nombre_distribuidor || "",
        id_prioridad_cliente: cliente.id_prioridad_cliente || 1,
        activo: cliente.activo ? 1 : 0,
        montos: cliente.montos ? cliente.montos.split(",").map(Number) : [],
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (error) setError(null);
  };

  const handlePriorityChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      id_prioridad_cliente: selectedOption.value
    }));
    if (error) setError(null);
  };

  const handleMontoChange = (index, value) => {
    const updated = [...formData.montos];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, montos: updated }));
  };

  const handleAddMonto = () => {
    setFormData((prev) => ({ ...prev, montos: [...prev.montos, ""] }));
  };

  const handleRemoveMonto = (index) => {
    const updated = formData.montos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, montos: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = isEditMode ? "put" : "post";
      const url = isEditMode ? `/clients/${cliente.id_cliente}` : `/clients`;

      await api[method](url, formData);

      onSubmit?.();
      onClose?.();
    } catch (err) {
      console.error("Error guardando cliente:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error al guardar el cliente");
    } finally {
      setLoading(false);
    }

  };

  const selectedPriority = priorityOptions.find(option => option.value === formData.id_prioridad_cliente);

  return (
    <div className="space-y-5 text-white">
      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Información básica */}
        <div className="space-y-4">
          <InputField
            label="Número de WhatsApp"
            name="numero_whatsapp"
            type="tel"
            value={formData.numero_whatsapp}
            onChange={handleChange}
            icon={<Phone className="w-4 h-4" />}
            placeholder="+52 555 123 4567"
            required
            isValid={isValid.numero_whatsapp}
            touched={touched.numero_whatsapp}
            errorMessage="El número debe tener al menos 10 dígitos"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Nombre del Cliente"
              name="nombre_cliente"
              value={formData.nombre_cliente}
              onChange={handleChange}
              icon={<User className="w-4 h-4" />}
              required
              isValid={isValid.nombre_cliente}
              touched={touched.nombre_cliente}
              errorMessage="El nombre debe tener al menos 2 caracteres"
            />
            <InputField
              label="Distribuidor"
              name="nombre_distribuidor"
              value={formData.nombre_distribuidor}
              onChange={handleChange}
              icon={<Users className="w-4 h-4" />}
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* Configuración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-400 uppercase tracking-wide">
              Prioridad del Cliente
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                <Flag className="w-4 h-4" />
              </div>
              <Select
                value={selectedPriority}
                onChange={handlePriorityChange}
                options={priorityOptions}
                styles={customStyles}
                components={{ Option: CustomOption }}
                isSearchable={false}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                placeholder="Seleccionar prioridad"
              />
            </div>
          </div>

          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Cliente activo
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo === 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked ? 1 : 0 }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-red-500 transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
        </div>

        {/* Montos permitidos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Montos Permitidos
            </label>
            <button
              type="button"
              onClick={handleAddMonto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar monto
            </button>
          </div>

          {formData.montos.length === 0 ? (
            <div className="text-center py-6 bg-slate-700/30 rounded-xl border border-dashed border-white/10">
              <DollarSign className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No hay montos configurados</p>
              <p className="text-xs text-gray-500 mt-1">Haz clic en "Agregar monto" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.montos.map((monto, i) => (
                <div key={i} className="flex gap-2 items-center group">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={monto}
                      onChange={(e) => handleMontoChange(i, e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all hover:bg-slate-700/70 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMonto(i)}
                    className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar monto"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 min-w-[110px] disabled:shadow-none"
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

// Componente reutilizable para inputs con iconos
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
                ? 'border-green-500/50 focus:ring-red-500 focus:border-transparent'
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

export default ClientForm;