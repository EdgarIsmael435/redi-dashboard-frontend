import { Search } from "lucide-react";
import Select from "react-select";


// Componente para opciones con iconos
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

// Estilos customizados
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

export const Filter = ({
    searchTerm,
    setSearchTerm,
    filterCompany,
    setFilterCompany,
    filterStatus,
    setFilterStatus,
    companyOptions,
    statusOptions
}) => {
    const selectedCompany =
        companyOptions.find((o) => o.value === filterCompany) || companyOptions[0];
    const selectedStatus =
        statusOptions.find((o) => o.value === filterStatus) || statusOptions[0];

    return (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-3 items-center">
                {/* Buscador */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <input
                        type="text"
                        placeholder="Buscar número o compañía..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-950 focus:ring-1 focus:ring-gray-900/50 transition-all text-xs"
                    />
                </div>

                {/* Selects */}
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="w-full md:w-44">
                        <Select
                            value={selectedCompany}
                            onChange={(o) => setFilterCompany(o.value)}
                            options={companyOptions}
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            isSearchable={false}
                            isClearable={false}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                    <div className="w-full md:w-40">
                        <Select
                            value={selectedStatus}
                            onChange={(o) => setFilterStatus(o.value)}
                            options={statusOptions}
                            styles={customStyles}
                            components={{ Option: CustomOption }}
                            isSearchable={false}
                            isClearable={false}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
