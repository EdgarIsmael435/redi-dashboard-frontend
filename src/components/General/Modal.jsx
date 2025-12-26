import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({
  isOpen,
  onClose,
  title,
  subTitle,
  children,
  icon: Icon,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`
              relative w-full ${sizeClasses[size]}
              max-h-[90vh]           /* 🔑 5% arriba + 5% abajo */
              bg-slate-800/90
              border border-white/10
              rounded-2xl
              shadow-xl
              flex flex-col          /* 🔑 layout vertical */
            `}
          >
            {/* ================= HEADER (FIJO) ================= */}
            <div className="flex items-center gap-3 p-6 pb-4 border-b border-white/10 shrink-0">
              {Icon && (
                <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="absolute inset-1 bg-black/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}

              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-white">
                    {title}
                  </h3>
                )}
                {subTitle && (
                  <p className="text-xs text-gray-400">{subTitle}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="ml-auto text-white/70 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* ================= BODY (SCROLL) ================= */}
            <div
              className="
                flex-1
                overflow-y-auto
                p-6
                scrollbar-redi
              "
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
