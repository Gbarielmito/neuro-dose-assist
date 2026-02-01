import { useState, useEffect, useMemo } from "react";

// CSS-based animated background for Dashboard - no Three.js dependencies
export default function DashboardBackground() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Generate random particles once on mount
    const particles = useMemo(() => {
        return [...Array(40)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: 2 + Math.random() * 4,
            duration: 4 + Math.random() * 6,
            delay: Math.random() * 5,
            color: Math.random() > 0.5 ? 'teal' : 'violet'
        }));
    }, []);

    // Generate neural nodes
    const nodes = useMemo(() => {
        return [...Array(15)].map((_, i) => ({
            id: i,
            left: 10 + Math.random() * 80,
            top: 10 + Math.random() * 80,
            size: 4 + Math.random() * 6,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
            color: i % 3 === 0 ? '#4ECDC4' : i % 3 === 1 ? '#7C3AED' : '#06B6D4'
        }));
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: 0.7 }}>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-violet-500/5" />

            {/* Large animated orbs */}
            <div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-teal-400/10 to-cyan-400/5 blur-3xl"
                style={{ animation: 'orbFloat1 8s ease-in-out infinite' }}
            />
            <div
                className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-violet-400/10 to-purple-400/5 blur-3xl"
                style={{ animation: 'orbFloat2 10s ease-in-out infinite' }}
            />
            <div
                className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-gradient-to-bl from-cyan-400/8 to-teal-400/5 blur-3xl"
                style={{ animation: 'orbFloat3 12s ease-in-out infinite' }}
            />

            {/* Floating particles */}
            {particles.map((particle) => (
                <div
                    key={`particle-${particle.id}`}
                    className={`absolute rounded-full ${particle.color === 'teal' ? 'bg-teal-400/60' : 'bg-violet-400/60'
                        }`}
                    style={{
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        width: particle.size,
                        height: particle.size,
                        animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}

            {/* Neural network nodes with pulse */}
            {nodes.map((node) => (
                <div
                    key={`node-${node.id}`}
                    className="absolute rounded-full"
                    style={{
                        left: `${node.left}%`,
                        top: `${node.top}%`,
                        width: node.size,
                        height: node.size,
                        backgroundColor: node.color,
                        boxShadow: `0 0 ${node.size * 2}px ${node.color}`,
                        animation: `nodePulse ${node.duration}s ease-in-out infinite`,
                        animationDelay: `${node.delay}s`,
                    }}
                />
            ))}

            {/* Central wave rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                    className="absolute w-20 h-20 rounded-full border-2 border-teal-400/30"
                    style={{ animation: 'waveExpand 4s ease-out infinite' }}
                />
                <div
                    className="absolute w-20 h-20 rounded-full border-2 border-violet-400/30"
                    style={{ animation: 'waveExpand 4s ease-out infinite 1.33s' }}
                />
                <div
                    className="absolute w-20 h-20 rounded-full border-2 border-cyan-400/30"
                    style={{ animation: 'waveExpand 4s ease-out infinite 2.66s' }}
                />
            </div>

            {/* Neural network SVG connections */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                    <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="lineGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.2" />
                    </linearGradient>
                </defs>

                {/* Animated connection lines */}
                <line x1="20%" y1="30%" x2="45%" y2="50%" stroke="url(#lineGradient1)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
                </line>
                <line x1="45%" y1="50%" x2="70%" y2="35%" stroke="url(#lineGradient2)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite" />
                </line>
                <line x1="45%" y1="50%" x2="60%" y2="70%" stroke="url(#lineGradient1)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3.5s" repeatCount="indefinite" />
                </line>
                <line x1="30%" y1="60%" x2="45%" y2="50%" stroke="url(#lineGradient2)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2.5s" repeatCount="indefinite" />
                </line>
                <line x1="70%" y1="35%" x2="85%" y2="55%" stroke="url(#lineGradient1)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4.5s" repeatCount="indefinite" />
                </line>
                <line x1="15%" y1="45%" x2="30%" y2="60%" stroke="url(#lineGradient2)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
                </line>
                <line x1="60%" y1="70%" x2="80%" y2="75%" stroke="url(#lineGradient1)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="5s" repeatCount="indefinite" />
                </line>
                <line x1="25%" y1="25%" x2="40%" y2="40%" stroke="url(#lineGradient2)" strokeWidth="1">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3.2s" repeatCount="indefinite" />
                </line>
            </svg>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes orbFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 30px) scale(0.95); }
                }
                
                @keyframes orbFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-40px, -30px) scale(1.1); }
                }
                
                @keyframes orbFloat3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, 40px) scale(0.9); }
                    75% { transform: translate(-30px, -20px) scale(1.05); }
                }
                
                @keyframes particleFloat {
                    0%, 100% { 
                        transform: translateY(0) translateX(0); 
                        opacity: 0.3;
                    }
                    50% { 
                        transform: translateY(-30px) translateX(15px); 
                        opacity: 0.8;
                    }
                }
                
                @keyframes nodePulse {
                    0%, 100% { 
                        transform: scale(1); 
                        opacity: 0.5;
                    }
                    50% { 
                        transform: scale(1.5); 
                        opacity: 1;
                    }
                }
                
                @keyframes waveExpand {
                    0% { 
                        transform: translate(-50%, -50%) scale(1); 
                        opacity: 0.5;
                    }
                    100% { 
                        transform: translate(-50%, -50%) scale(8); 
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
