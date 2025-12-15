
//Config de compañías
export const LogoIcon = ({ company }) => (
  <div className="flex items-center justify-center text-xs font-bold text-white">
    {company.charAt(0)}
  </div>
);

export const companyConfig = {
    virgin: { leftBorder: "border-l-4 border-red-500", bg: "bg-red-500/10", icon: <LogoIcon company="Virgin" />, legendColor: "bg-red-500" },
    unefon: { leftBorder: "border-l-4 border-yellow-500", bg: "bg-yellow-500/10", icon: <LogoIcon company="Unefon" />, legendColor: "bg-yellow-500" },
    movistar: { leftBorder: "border-l-4 border-green-500", bg: "bg-green-500/10", icon: <LogoIcon company="Movistar" />, legendColor: "bg-green-500" },
    att: { leftBorder: "border-l-4 border-blue-500", bg: "bg-blue-500/10", icon: <LogoIcon company="ATT" />, legendColor: "bg-blue-500" },
    telcel: { leftBorder: "border-l-4 border-blue-900", bg: "bg-blue-900/10", icon: <LogoIcon company="TELCEL" />, legendColor: "bg-blue-900" },
    bait: { leftBorder: "border-l-4 border-black-900", bg: "bg-black", icon: <LogoIcon company="BAIT" />, legendColor: "bg-black" },
};

export const companyOptions = [
    { value: "all", label: "Todas las compañías" },
    { value: "virgin", label: "Virgin Mobile" },
    { value: "unefon", label: "Unefon" },
    { value: "movistar", label: "Movistar" },
    { value: "att", label: "AT&T" },
    { value: "telcel", label: "Telcel" },
    { value: "bait", label: "Bait" },
];

export const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "COMPLETADO", label: "Completado" },
];