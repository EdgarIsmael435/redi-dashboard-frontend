import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, LoaderCircle } from 'lucide-react';

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
      <span className="text-white text-xs">{data.label}</span>
    </div>
  );
};

// Estilos personalizados para react-select
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
    "&:hover": {
      border: "1px solid rgba(255,255,255,0.3)",
      background: "rgba(255,255,255,0.08)"
    }
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
    fontSize: "0.75rem",
    color: "white"
  }),

  singleValue: (base) => ({
    ...base,
    color: "white",
    fontSize: "0.75rem"
  }),

  placeholder: (base) => ({
    ...base,
    color: "rgb(156, 163, 175)",
    fontSize: "0.75rem"
  }),

  input: (base) => ({
    ...base,
    color: "white",
    fontSize: "0.75rem"
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
    zIndex: 9999,
    fontSize: "0.75rem"
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
    transition: "all 0.2s ease"
  }),

  dropdownIndicator: (base, state) => ({
    ...base,
    color: "rgba(156,163,175,1)",
    padding: "0 6px",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.2s ease",
    "&:hover": {
      color: "rgba(59,130,246,0.8)"
    }
  }),

  indicatorSeparator: () => ({ display: "none" })
};

const Tabla = ({
  data = [],
  columns = [],
  filters = [],
  itemsPerPage = 5,
  onEdit,
  onDelete,
  onView,
  customActions,
  emptyMessage = "No hay datos para mostrar",
  className = "",
  loading,
  headerAction = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Función para ordenar
  const handleSort = (key) => {
    if (!key) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Búsqueda general
      const matchesSearch = searchTerm === '' || columns.some(col => {
        const value = col.accessor ? item[col.accessor] : '';
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

      // Filtros específicos
      const matchesFilters = filters.every(filter => {
        const filterValue = filterValues[filter.key];
        if (!filterValue || filterValue === 'all') return true;

        const itemValue = item[filter.key];
        if (filter.transform) {
          return filter.transform(itemValue) === filterValue;
        }
        return String(itemValue) === String(filterValue);
      });

      return matchesSearch && matchesFilters;
    });

    // Ordenar
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filterValues, sortConfig, columns, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  const getVisiblePages = () => {
    const delta = 2; // Páginas a mostrar a cada lado de la actual
    const pages = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Siempre mostrar primera página
    pages.push(1);

    // Agregar "..." si hay un salto
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Agregar páginas del rango
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Agregar "..." si hay un salto
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Siempre mostrar última página (si hay más de una)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Resetear página cuando cambian filtros
  const handleFilterChange = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }) => {
    if (!columnKey || sortConfig.key !== columnKey) {
      return <ChevronUp className="w-3 h-3 text-gray-400/40" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-3 h-3 text-red-400" />
      : <ChevronDown className="w-3 h-3 text-red-400" />;
  };

  return (
    <div className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl ${className}`}>
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 w-full">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-900/50 transition-all text-xs"
          />
        </div>

        {/* Filtros personalizados con react-select */}
        {filters.map((filter) => {
          const filterOptions = [
            { value: "all", label: filter.placeholder || "Todos" },
            ...filter.options,
          ];

          const selectedOption =
            filterOptions.find(
              (opt) => opt.value === (filterValues[filter.key] || "all")
            ) || filterOptions[0];

          return (
            <div key={filter.key} className="flex-1 min-w-[160px]">
              <Select
                value={selectedOption}
                onChange={(option) => handleFilterChange(filter.key, option.value)}
                options={filterOptions}
                styles={customStyles}
                components={{ Option: CustomOption }}
                isSearchable={false}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                placeholder={filter.placeholder || "Seleccionar..."}
              />
            </div>
          );
        })}
        {headerAction && (
          <div className="flex justify-end md:ml-4 w-full md:w-auto">
            <div className="w-full md:w-auto">
              {headerAction}
            </div>
          </div>
        )}
      </div>
      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10 backdrop-blur-xl">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.sortable && handleSort(col.accessor)}
                    className={`px-3 py-2 text-left text-xs font-medium text-gray-200 ${col.sortable ? 'cursor-pointer hover:bg-white/10' : ''
                      } transition-colors`}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && <SortIcon columnKey={col.accessor} />}
                    </div>
                  </th>
                ))
                }
                {(onEdit || onDelete || onView || customActions) && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-200">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-3 py-6 text-center text-gray-400 text-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LoaderCircle className="w-4 h-4 animate-spin text-red-500" />
                      <span>Cargando información...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-3 py-6 text-center text-gray-400 text-sm"
                  >
                    {emptyMessage || "No hay registros disponibles"}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-white/10 transition-all duration-300 border-b border-white/5"
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-3 py-2">
                        {col.render ? (
                          col.render(item)
                        ) : (
                          <span className="text-xs text-gray-200">
                            {item[col.accessor]}
                          </span>
                        )}
                      </td>
                    ))}

                    {(onEdit || onDelete || onView || customActions) && (
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="px-2 py-1 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-all"
                            >
                              Ver
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="px-2 py-1 text-xs rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-500/30 transition-all"
                            >
                              Editar
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="px-2 py-1 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-all"
                            >
                              Eliminar
                            </button>
                          )}
                          {customActions && customActions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-2 mb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <LoaderCircle className="w-5 h-5 animate-spin text-red-500 mb-2" />
            <p className="text-sm">Cargando usuarios...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">
            {emptyMessage || "No hay registros disponibles"}
          </p>
        ) : (
          paginatedData.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-lg"
            >
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="mb-2 last:mb-0">
                  <span className="text-xs text-gray-400 font-medium">{col.header}: </span>
                  {col.render ? col.render(item) : (
                    <span className="text-xs text-white">{item[col.accessor]}</span>
                  )}
                </div>
              ))}
              {(onEdit || onDelete || onView || customActions) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="flex-1 px-2 py-1 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-all"
                    >
                      Ver
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="flex-1 px-2 py-1 text-xs rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-500/30 transition-all"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="flex-1 px-2 py-1 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-all"
                    >
                      Eliminar
                    </button>
                  )}
                  {customActions && customActions(item)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {filteredAndSortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length}
          </div>
          <div className="flex gap-1 items-center">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getVisiblePages().map((page, i) =>
              page === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded-lg border transition-all font-medium backdrop-blur-xl ${currentPage === page
                    ? 'bg-red-500/80 text-white border-red-400'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300 border-white/20 hover:text-white'
                    }`}
                >
                  {page}
                </button>
              )
            )}
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
  );
};

export default Tabla;