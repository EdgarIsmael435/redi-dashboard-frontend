import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import SideBar from "../General/SideBar";
import { BackContainer } from "../General/BackContainer";
import OperatorRechargesPanel from "./OperatorRechargesPanel";
import NotFound from "../General/NotFound";

export default function DashboardOperator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  // Redirige a /operator/panel si entra directo a /operator
  useEffect(() => {
    if (location.pathname === "/operator") {
      navigate("/operator/panel", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <BackContainer>
      <div className="flex items-center justify-center min-h-screen p-4">
        {userData && (
          <SideBar
            isExpanded={isExpanded}
            toggleExpand={() => setIsExpanded(!isExpanded)}
            badge=""
            userData={userData}
          />
        )}

        <main
          className={`h-[calc(100vh-7rem)] max-w-100/100 ml-auto flex flex-col space-y-6
            w-full overflow-y-auto scrollbar scrollbar-thumb-red-600 scrollbar-track-transparent scrollbar-thin
            ${isExpanded ? "md:w-80/100" : "md:w-94/100"}`}
        >
          <Routes>
            <Route path="panel" element={<OperatorRechargesPanel />} />
            <Route path="*" element={<NotFound/>} />
          </Routes>
        </main>
      </div>
    </BackContainer>
  );
}
