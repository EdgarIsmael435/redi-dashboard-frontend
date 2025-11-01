export const IconRedi = ({ isValid = true, size = "md" }) => {
    // Configuración de tamaños
    const sizeClasses = {
        xs: {
            container: "w-8 h-8",
            face: "inset-1",
            eyeSpacing: "space-x-1",
            eyeSize: "w-1 h-1",
            eyeText: "text-[6px]",
            smile: "bottom-1 w-3 h-0.5",
            text: "text-[4px] -bottom-0.5",
            roundedCont: "rounded-xl",
            rounded: "rounded-2xl",
            blur: "blur-sm"
        },
        sm: {
            container: "w-12 h-12",
            face: "inset-1.5",
            eyeSpacing: "space-x-1.5",
            eyeSize: "w-1.5 h-1.5",
            eyeText: "text-[8px]",
            smile: "bottom-1.5 w-4 h-0.5",
            text: "text-[6px] -bottom-0.5",
            roundedCont: "rounded-xl",
            rounded: "rounded-xl",
            blur: "blur-md"
        },
        md: {
            container: "w-16 h-16",
            face: "inset-2",
            eyeSpacing: "space-x-2",
            eyeSize: "w-2 h-2",
            eyeText: "text-sm",
            smile: "bottom-2 w-6 h-1",
            text: "text-[8px] -bottom-1",
            roundedCont: "rounded-2xl",
            rounded: "rounded-xl",
            blur: "blur-lg"
        },
        lg: {
            container: "w-20 h-20",
            face: "inset-2.5",
            eyeSpacing: "space-x-2.5",
            eyeSize: "w-2.5 h-2.5",
            eyeText: "text-base",
            smile: "bottom-2.5 w-8 h-1",
            text: "text-[10px] -bottom-1",
            roundedCont: "rounded-2xl",
            rounded: "rounded-xl",
            blur: "blur-xl"
        },
        xl: {
            container: "w-24 h-24",
            face: "inset-3",
            eyeSpacing: "space-x-3",
            eyeSize: "w-3 h-3",
            eyeText: "text-lg",
            smile: "bottom-3 w-10 h-1.5",
            text: "text-xs -bottom-1.5",
            roundedCont: "rounded-2xl",
            rounded: "rounded-xl",
            blur: "blur-2xl"
        }
    };

    const classes = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`relative ${classes.container} bg-gradient-to-br from-red-500 via-red-600 to-red-700 ${classes.roundedCont} shadow-2xl transform rotate-6 hover:rotate-12 transition-transform duration-500`}>
            {/* Robot face */}
            <div className={`absolute ${classes.face} bg-black/80 ${classes.rounded} flex items-center justify-center`}>
                {/* Eyes */}
                <div className={`flex ${classes.eyeSpacing}`}>
                    {!isValid ? (
                        <>
                            <div className={`text-white ${classes.eyeText} animate-pulse font-bold`}>x</div>
                            <div className={`text-white ${classes.eyeText} animate-pulse delay-75 font-bold`}>x</div>
                        </>
                    ) : (
                        <>
                            <div className={`${classes.eyeSize} bg-white rounded-full animate-pulse`}></div>
                            <div className={`${classes.eyeSize} bg-white rounded-full animate-pulse delay-75`}></div>
                        </>
                    )}
                </div>
                {/* Smile */}
                <div className={`absolute ${classes.smile} left-1/2 transform -translate-x-1/2 bg-white/80 rounded-full`}></div>
            </div>
            {/* REDi text */}
            <div className={`absolute ${classes.text} left-1/2 transform -translate-x-1/2 font-bold text-white/90`}>
                REDi
            </div>
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-red-500/30 ${classes.rounded} ${classes.blur} -z-10`}></div>
        </div>
    );
};