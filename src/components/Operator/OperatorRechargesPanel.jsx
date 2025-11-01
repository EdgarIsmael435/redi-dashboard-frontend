import { useState, useEffect, useRef } from "react";
import { Clock, CheckCircle, Zap } from "lucide-react";
import { io } from "socket.io-client";
import { HeaderContainer } from "../General/HeaderContainer";
import { TableRecharges } from "../Recharges/TableRecharges";

const LogoIcon = ({ company }) => (
  <div className="flex items-center justify-center text-xs font-bold text-white">
    {company.charAt(0)}
  </div>
);

const OperatorRechargesPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterStatus, setFilterStatus] = useState("PENDIENTE");
  const [recharges, setRecharges] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);

  //Configuración de colores e íconos por compañía
  const companyConfig = {
    virgin: {
      leftBorder: "border-l-4 border-red-500",
      bg: "bg-red-500/10",
      icon: <LogoIcon company="Virgin" />,
      legendColor: "bg-red-500",
    },
    unefon: {
      leftBorder: "border-l-4 border-yellow-500",
      bg: "bg-yellow-500/10",
      icon: <LogoIcon company="Unefon" />,
      legendColor: "bg-yellow-500",
    },
    movistar: {
      leftBorder: "border-l-4 border-green-500",
      bg: "bg-green-500/10",
      icon: <LogoIcon company="Movistar" />,
      legendColor: "bg-green-500",
    },
    att: {
      leftBorder: "border-l-4 border-blue-500",
      bg: "bg-blue-500/10",
      icon: <LogoIcon company="ATT" />,
      legendColor: "bg-blue-500",
    },
  };

  //Conexión WebSocket con autenticación
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    //Crear conexión con token JWT
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
    });

    socket.on("recharges", (data) => {
      setRecharges(data);
    });

    socket.on("new-recharge", (rec) => {
      setRecharges((prev) => [...prev, rec]);
    });

    socket.on("recharge-updated", (updated) => {
      setSendingId(null);
      setRecharges((prev) =>
        prev.map((r) =>
          r.id_ticketRecarga === updated.id_ticketRecarga ? updated : r
        )
      );
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  //Reconexion automática al renovar token (desde interceptor)
  useEffect(() => {
    const handleTokenUpdate = () => {
      const newToken = localStorage.getItem("token");
      if (socketRef.current && newToken) {
        socketRef.current.auth = { token: newToken };
        socketRef.current.connect();
      }
    };

    window.addEventListener("tokenUpdated", handleTokenUpdate);
    return () => window.removeEventListener("tokenUpdated", handleTokenUpdate);
  }, []);

  const pendingRecharges = recharges.filter((r) => r.Estado === "PENDIENTE").length;

  const handleFolioChange = (id_ticketRecarga, value) => {
    setRecharges((prev) =>
      prev.map((r) =>
        r.id_ticketRecarga === id_ticketRecarga
          ? { ...r, Folio: value }
          : r
      )
    );
  };

  const handleSend = (id_ticketRecarga, folioAuto, operador) => {
    if (sendingId === id_ticketRecarga) return;
    setSendingId(id_ticketRecarga);

    const recharge = recharges.find(
      (r) => r.id_ticketRecarga === id_ticketRecarga
    );
    if (!recharge?.Folio) {
      setSendingId(null);
      return;
    }

    if (socketRef.current) {
      socketRef.current.emit("process-recharge", {
        ticketId: id_ticketRecarga,
        folio: recharge.Folio,
        esFolioFalso: folioAuto,
        nombreOperador: operador,
      });
    }
  };

  const filteredRecharges = recharges.filter((r) => {
    const number = r.Numero;
    const company = r.Compania.toLowerCase();
    const status = r.Estado;

    const matchesSearch =
      number.includes(searchTerm) ||
      company.includes(searchTerm.toLowerCase());
    const matchesCompany =
      filterCompany === "all" || company === filterCompany.toLowerCase();
    const matchesStatus =
      filterStatus === "all" || status === filterStatus;

    return matchesSearch && matchesCompany && matchesStatus;
  });

  const StatusIcon = ({ status }) =>
    status === "PENDIENTE" ? (
      <Clock className="w-4 h-4 text-amber-400" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-400" />
    );

  const PriorityBadge = ({ priority }) => {
    const colors = {
      alta: "bg-red-500/20 text-red-200 border-red-500/30",
      media: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
      baja: "bg-gray-500/20 text-gray-200 border-gray-500/30",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-lg border backdrop-blur-sm ${
          colors[priority?.toLowerCase()] || colors.baja
        } font-medium`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="flex flex-col space-y-6">
      <HeaderContainer
        icon={Zap}
        title="Panel de Recargas"
        subtitle="Gestión de recargas móviles en tiempo real"
        status={isConnected ? "online" : "error"}
        variant="default"
        showBadge
        badge={pendingRecharges === 0 ? "" : String(pendingRecharges)}
      />

      <TableRecharges
        recharges={recharges}
        filteredRecharges={filteredRecharges}
        companyConfig={companyConfig}
        handleFolioChange={handleFolioChange}
        handleSend={handleSend}
        sendingId={sendingId}
        PriorityBadge={PriorityBadge}
        StatusIcon={StatusIcon}
        LogoIcon={LogoIcon}
        userData={user}
      />
    </div>
  );
};

export default OperatorRechargesPanel;
