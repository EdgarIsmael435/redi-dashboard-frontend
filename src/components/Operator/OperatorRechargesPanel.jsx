import { useState, useEffect, useRef } from "react";
import { Clock, CheckCircle, XCircle, Zap } from "lucide-react";
import { io } from "socket.io-client";
import { HeaderContainer } from "../General/HeaderContainer";
import { TableRecharges } from "../Recharges/TableRecharges";
import { companyConfig, LogoIcon, companyOptions, statusOptions, enrolOptions, matchesEnrol } from "../../constants/recharges";
import { Filter } from "../Recharges/Filter";

const OperatorRechargesPanel = () => {
  const audioRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterStatus, setFilterStatus] = useState("PENDIENTE");
  const [filterEnrol, setFilterEnrol] = useState("all");
  const [recharges, setRecharges] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [remindingId, setRemindingId] = useState(null);
  const [remindErrorId, setRemindErrorId] = useState(null);
  const [checkingEnrolId, setCheckingEnrolId] = useState(null);
  const [checkingAllEnrol, setCheckingAllEnrol] = useState(false);
  const [enrolSweepResult, setEnrolSweepResult] = useState(null);
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

      // Si el token expiró en el socket
      if (err?.message?.toLowerCase().includes("expir") ||
        err?.message?.toLowerCase().includes("invalid")) {
        window.dispatchEvent(new Event("sessionExpiredSocket"));
      }
    });


    socket.on("recharges", (data) => {
      console.log(data);
      
      setRecharges(data);
    });

    socket.on("new-recharge", (rec) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
      }
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

    socket.on("recharge-enrolamiento", ({ id_ticketRecarga, Enrolado }) => {
      setRecharges((prev) =>
        prev.map((r) => (r.id_ticketRecarga === id_ticketRecarga ? { ...r, Enrolado } : r))
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

  const handleSend = (id_ticketRecarga, folioAuto, id_usuario_redi, operador) => {
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
        id_usuario_redi: id_usuario_redi,
        esFolioFalso: folioAuto,
        nombreOperador: operador,
      });
    }
  };

  const handleRemind = (id_ticketRecarga) => {
    if (remindingId === id_ticketRecarga) return;
    setRemindingId(id_ticketRecarga);
    setRemindErrorId(null);

    if (socketRef.current) {
      socketRef.current.emit("remind-recharge", { ticketId: id_ticketRecarga }, (response) => {
        setRemindingId(null);
        if (!response?.sent) {
          setRemindErrorId(id_ticketRecarga);
          setTimeout(() => {
            setRemindErrorId((current) => (current === id_ticketRecarga ? null : current));
          }, 4000);
        }
      });
    } else {
      setRemindingId(null);
    }
  };

  //Volver a consultar enrolamiento (solo Movistar)
  const handleCheckEnrolamiento = (id_ticketRecarga) => {
    if (checkingEnrolId === id_ticketRecarga) return;
    setCheckingEnrolId(id_ticketRecarga);

    if (socketRef.current) {
      // El valor llega por "recharge-enrolamiento"
      socketRef.current.emit("check-enrolamiento", { ticketId: id_ticketRecarga }, () => {
        setCheckingEnrolId(null);
      });
    } else {
      setCheckingEnrolId(null);
    }
  };

  //Barrido de enrolamiento de todas las Movistar pendientes
  const handleCheckAllEnrolamiento = () => {
    if (checkingAllEnrol || !socketRef.current) return;
    setCheckingAllEnrol(true);
    setEnrolSweepResult(null);

    socketRef.current.emit("check-enrolamiento-pendientes", (resumen) => {
      setCheckingAllEnrol(false);
      setEnrolSweepResult(resumen);
      setTimeout(() => setEnrolSweepResult(null), 6000);
    });
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

    return matchesSearch && matchesCompany && matchesStatus && matchesEnrol(r, filterEnrol);
  });

  const StatusIcon = ({ status }) => {
    if (status === "PENDIENTE") return <Clock className="w-4 h-4 text-amber-400" />;
    if (status === "RECHAZADO") return <XCircle className="w-4 h-4 text-red-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const PriorityBadge = ({ priority }) => {
    const colors = {
      alta: "bg-red-500/20 text-red-200 border-red-500/30",
      media: "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
      baja: "bg-gray-500/20 text-gray-200 border-gray-500/30",
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
      <Filter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCompany={filterCompany}
        setFilterCompany={setFilterCompany}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        companyOptions={companyOptions}
        statusOptions={statusOptions}
        filterEnrol={filterEnrol}
        setFilterEnrol={setFilterEnrol}
        enrolOptions={enrolOptions}
      />
      <TableRecharges
        recharges={recharges}
        filteredRecharges={filteredRecharges}
        companyConfig={companyConfig}
        handleFolioChange={handleFolioChange}
        handleSend={handleSend}
        handleRemind={handleRemind}
        sendingId={sendingId}
        remindingId={remindingId}
        remindErrorId={remindErrorId}
        handleCheckEnrolamiento={handleCheckEnrolamiento}
        checkingEnrolId={checkingEnrolId}
        handleCheckAllEnrolamiento={handleCheckAllEnrolamiento}
        checkingAllEnrol={checkingAllEnrol}
        enrolSweepResult={enrolSweepResult}
        PriorityBadge={PriorityBadge}
        StatusIcon={StatusIcon}
        LogoIcon={LogoIcon}
        userData={user}
      />
    </div>
  );
};

export default OperatorRechargesPanel;
