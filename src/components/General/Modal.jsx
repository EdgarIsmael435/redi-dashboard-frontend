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

  // Permitir cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-wrapper"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* Contenedor interno estático */}
          <div className="flex justify-center items-center w-full">
            <motion.div
              key="modal-content"
              className={`bg-slate-800/90 border border-white/10 rounded-2xl shadow-xl p-6 w-full ${sizeClasses[size]} relative`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`flex items-center gap-3 pb-3 mb-3 ${
                  size !== "sm" ? "border-b border-white/10" : ""
                }`}
              >
                {Icon && (
                  <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="absolute inset-1 bg-black/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}
                <div>
                  {title && (
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                  )}
                  {subTitle && (
                    <p className="text-xs text-gray-400">{subTitle}</p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-all"
              >
                ✕
              </button>

              {/* Wrapper estático para el contenido dinámico */}
              <div key="modal-body" className="pt-2">
                {children}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
