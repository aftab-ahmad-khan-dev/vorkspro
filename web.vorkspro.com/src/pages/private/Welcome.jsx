import React, { useState, useEffect } from 'react';

export default function Welcome() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="w-[86vw] h-[101.5vh] relative overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--gradient)] to-[var(--background)] -m-10">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Interactive cursor glow */}
            <div
                className="pointer-events-none fixed w-96 h-96 rounded-full opacity-0 transition-opacity duration-300"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                }}
            ></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
                {/* Animated wave text background effect */}
                <div className="mb-8">
                    <div className="inline-block relative">
                        {/* Glow effect behind emoji */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-400 rounded-full blur-3xl opacity-30 scale-150 animate-pulse"></div>
                        {/* <span className="relative text-8xl animate-bounce inline-block" style={{ animationDuration: '1s' }}>
              👋
            </span> */}
                    </div>
                </div>

                {/* Main heading with staggered animation */}
                <div className="space-y-4 text-center max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-7xl font-black bg-clip-text text-blue-600 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-500 dark:via-blue-400 dark:to-blue-500  animate-fade-in" style={{ animationDuration: '1s' }}>
                        Welcome to Your Dashboard
                    </h1>

                    {/* Animated subtitle */}
                    <p className="text-xl md:text-2xl text-gray-50 font-light animate-fade-in mt-6" style={{ animationDelay: '0.3s' }}>
                        Unlock your potential and discover amazing features
                    </p>
                </div>

                {/* Floating cards decoration */}
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-blue-300/20 rounded-2xl backdrop-blur-md border border-blue-100/10 animate-float"></div>
                <div className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-blue-400/20 rounded-3xl backdrop-blur-md border border-blue-100/10 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}