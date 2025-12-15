import { useState, useEffect, useRef } from "react";
import { Clock, CheckCircle, Zap } from "lucide-react";
import { io } from "socket.io-client";
import { HeaderContainer } from "../General/HeaderContainer";
import { Filter } from "../Recharges/Filter";
import { TableRecharges } from "../Recharges/TableRecharges";
import { companyConfig, companyOptions, statusOptions, LogoIcon } from "../../constants/recharges";


const AdminRechargesPanel = () => {
  const audioRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [recharges, setRecharges] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);


  //Audio notificación
  useEffect(() => {
    const audio = new Audio('/sounds/redi_notificacion.mp3');

    audio.addEventListener('canplaythrough', () => {
      audioRef.current = audio;
    });

    audio.load();
  }, []);

  //Conectar socket con autenticación
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    //Enviar token en el handshake
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
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
      setRecharges((prev) => [...prev, rec]);
    });

    socket.on("recharge-updated", (updated) => {
      setSendingId(null);
      setRecharges((prev) =>
        prev.map((r) => (r.id_ticketRecarga === updated.id_ticketRecarga ? updated : r))
      );
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  //Reconectar con nuevo token si se renueva (interceptor Axios)
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
      prev.map((r) => (r.id_ticketRecarga === id_ticketRecarga ? { ...r, Folio: value } : r))
    );
  };

  const handleSend = (id_ticketRecarga, folioAuto, id_usuario_redi, operador) => {
    if (sendingId === id_ticketRecarga) return;
    setSendingId(id_ticketRecarga);

    const recharge = recharges.find((r) => r.id_ticketRecarga === id_ticketRecarga);
    if (!recharge?.Folio) {
      setSendingId(null);
      return;
    }

    if (socketRef.current) {
      socketRef.current.emit("process-recharge", {
        ticketId: id_ticketRecarga,
        folio: recharge.Folio,
        id_usuario_redi: id_usuario_redi,
        esFolioFalso: folioAuto,
        nombreOperador: operador,
      });
    }
  };

  const filteredRecharges = recharges.filter((r) => {
    const number = r.Numero;
    const company = r.Compania.toLowerCase();
    const status = r.Estado;
    const matchesSearch = number.includes(searchTerm) || company.includes(searchTerm.toLowerCase());
    const matchesCompany = filterCompany === "all" || company === filterCompany.toLowerCase();
    const matchesStatus = filterStatus === "all" || status === filterStatus;
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
      baja: "bg-blue-500/40 text-blue-200 border-gray-500/30",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-lg border backdrop-blur-sm ${colors[priority?.toLowerCase()] || colors.baja
          } font-medium`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <HeaderContainer
        icon={Zap}
        title="Panel de Recargas"
        subtitle="Gestión de recargas móviles en tiempo real"
        status={isConnected ? "online" : "error"}
        variant="default"
        showBadge
        badge={pendingRecharges === 0 ? "" : String(pendingRecharges)}
      />
      <Filter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCompany={filterCompany}
        setFilterCompany={setFilterCompany}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        companyOptions={companyOptions}
        statusOptions={statusOptions}
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

export default AdminRechargesPanel;
