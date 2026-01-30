import { useState, useEffect } from "react";

// Fallback visual com CSS puro - animação de rede neural
export function NeuralBrainScene() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-violet-500/5 to-transparent" />

            {/* Animated orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-teal-400/20 to-violet-500/20 blur-3xl animate-pulse" />
            </div>

            <div
                className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-cyan-400/15 blur-2xl animate-pulse"
                style={{ animationDelay: "0.5s", animationDuration: "3s" }}
            />

            <div
                className="absolute top-2/3 left-1/3 w-32 h-32 rounded-full bg-violet-400/15 blur-2xl animate-pulse"
                style={{ animationDelay: "1s", animationDuration: "4s" }}
            />

            <div
                className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-teal-300/10 blur-3xl animate-pulse"
                style={{ animationDelay: "1.5s", animationDuration: "5s" }}
            />

            <div
                className="absolute bottom-1/4 right-1/3 w-36 h-36 rounded-full bg-purple-400/15 blur-2xl animate-pulse"
                style={{ animationDelay: "2s", animationDuration: "3.5s" }}
            />

            {/* Neural network pattern - decorative dots */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <radialGradient id="neuronGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="neuronGrad2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Animated nodes - central */}
                <circle cx="50" cy="50" r="4" fill="url(#neuronGrad)">
                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Secondary nodes */}
                <circle cx="30" cy="35" r="2.5" fill="url(#neuronGrad2)">
                    <animate attributeName="r" values="2;3;2" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="70" cy="40" r="2.5" fill="url(#neuronGrad)">
                    <animate attributeName="r" values="2;3;2" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="65" r="2" fill="url(#neuronGrad2)">
                    <animate attributeName="r" values="1.5;2.5;1.5" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="70" r="2" fill="url(#neuronGrad)">
                    <animate attributeName="r" values="1.5;2.5;1.5" dur="3.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="20" cy="55" r="1.5" fill="url(#neuronGrad)">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="80" cy="60" r="1.5" fill="url(#neuronGrad2)">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="45" cy="25" r="1.5" fill="url(#neuronGrad2)">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="55" cy="80" r="1.5" fill="url(#neuronGrad)">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.5s" repeatCount="indefinite" />
                </circle>

                {/* Connection lines - animated */}
                <line x1="50" y1="50" x2="30" y2="35" stroke="#4ECDC4" strokeWidth="0.3">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="50" y1="50" x2="70" y2="40" stroke="#7C3AED" strokeWidth="0.3">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
                </line>
                <line x1="50" y1="50" x2="35" y2="65" stroke="#06B6D4" strokeWidth="0.3">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
                </line>
                <line x1="50" y1="50" x2="65" y2="70" stroke="#8B5CF6" strokeWidth="0.3">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3.5s" repeatCount="indefinite" />
                </line>
                <line x1="30" y1="35" x2="20" y2="55" stroke="#4ECDC4" strokeWidth="0.2">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" />
                </line>
                <line x1="70" y1="40" x2="80" y2="60" stroke="#7C3AED" strokeWidth="0.2">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
                </line>
                <line x1="30" y1="35" x2="45" y2="25" stroke="#06B6D4" strokeWidth="0.2">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3.5s" repeatCount="indefinite" />
                </line>
                <line x1="65" y1="70" x2="55" y2="80" stroke="#8B5CF6" strokeWidth="0.2">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2.5s" repeatCount="indefinite" />
                </line>
            </svg>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-teal-400/40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.7;
          }
        }
      `}</style>
        </div>
    );
}
