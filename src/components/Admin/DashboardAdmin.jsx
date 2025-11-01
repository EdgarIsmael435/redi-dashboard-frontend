import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import SideBar from "../General/SideBar";
import { BackContainer } from "../General/BackContainer";
import AdminRechargesPanel from "./AdminRechargesPanel";
import UsersAdmin from "./UsersAdmin";
import ClientsAdmin from "./ClientsAdmin";
import NotFound from "../General/NotFound";


export default function DashboardAdmin() {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUserData(JSON.parse(storedUser));
    }, []);

    // Redirige a /admin/panel si entras solo a /admin
    useEffect(() => {
        if (location.pathname === "/admin") {
            navigate("/admin/panel", { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <BackContainer>
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Sidebar igual que antes */}
                {userData && (
                    <SideBar
                        isExpanded={isExpanded}
                        toggleExpand={() => setIsExpanded(!isExpanded)}
                        badge=""
                        userData={userData}
                    />
                )}

                {/* Contenedor central (igual diseño que el Dashboard original) */}
                <div
                    className={`h-[calc(100vh-7rem)] max-w-100/100 ml-auto flex flex-col 
              w-full overflow-y-auto 
              ${isExpanded ? "md:w-80/100" : "md:w-94/100"}`}
                >
                    <Routes>
                        <Route path="panel" element={<AdminRechargesPanel />} />
                        <Route path="operadores" element={<UsersAdmin />} />
                        <Route path="clientes" element={<ClientsAdmin />} />
                        <Route path="*" element={<NotFound/>} />
                    </Routes>
                </div>
            </div>
        </BackContainer>
    );
}
