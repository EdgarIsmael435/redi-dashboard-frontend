import { useRef } from "react";

export const BackContainer = ({ children }) => {
    const particlesRef = useRef(
        [...Array(50)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 2}s`,
            duration: `${2 + Math.random() * 3}s`,
        }))
    );
    return <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-black-800 to-black">
        {/* Formas de fondo animadas */}
        <div className="absolute inset-0">
            <div className="absolute top-20 left-300 w-72 h-72 bg-red-600/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-75"></div>
            <div className="absolute -bottom-20 left-40 w-80 h-80 bg-red-800/15 rounded-full blur-3xl animate-pulse delay-150"></div>
            <div className="absolute bottom-40 right-40 w-64 h-64 bg-gray-600/10 rounded-full blur-3xl animate-pulse delay-300"></div>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute inset-0">
            {particlesRef.current.map((p) => (
                <div
                    key={p.id}
                    className="absolute w-1 h-1 bg-white/70 rounded-full animate-pulse z-11"
                    style={{
                        left: p.left,
                        top: p.top,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}
        </div>

        <div className="relative z-10">
            {children}
        </div>
    </div>;
}