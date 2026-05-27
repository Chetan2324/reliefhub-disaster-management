import { useMemo } from 'react';
import { motion } from 'framer-motion';

const CitizenBackground = () => {
  const PARTICLES = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: `cit-part-${i}`,
      size: Math.random() * 4 + 1, // 1-5px
      x: Math.random() * 100, 
      y: Math.random() * 100,
      duration: Math.random() * 30 + 30, 
      delay: Math.random() * -60,
      opacity: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? 'bg-cyan-300' : 'bg-emerald-300',
      shadowColor: Math.random() > 0.5 ? 'rgba(34,211,238,0.5)' : 'rgba(16,185,129,0.5)',
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617] perspective-[1000px]">
      {/* Deep base glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.15)_0%,transparent_60%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15)_0%,transparent_60%)] mix-blend-screen" />
      
      {/* Subtle Topographic/Grid overlay with Parallax */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM5IDQwaC0xVjFoLTM4di0xaDQwdjQwcyIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" 
      />

      {/* Giant Slow Radar Sweep Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full pointer-events-none mix-blend-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-full h-full rounded-full"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(16,185,129,0.02) 330deg, rgba(34,211,238,0.15) 360deg)'
          }}
        />
      </div>

      {/* Curved glowing timeline lines */}
      <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="emeraldLine" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <motion.path 
          d="M -100 200 Q 400 600 1100 100" 
          fill="none" 
          stroke="url(#cyanLine)" 
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path 
          d="M -100 800 Q 500 200 1100 900" 
          fill="none" 
          stroke="url(#emeraldLine)" 
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />
      </svg>

      {/* Floating soft particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color} blur-[1px]`}
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 15px ${p.shadowColor}`
          }}
          animate={{
            y: [0, -200, 0],
            x: [0, Math.random() * 80 - 40, 0],
            opacity: [0, p.opacity * 1.5, 0]
          }}
          transition={{
            duration: p.duration * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay
          }}
        />
      ))}

      {/* Heavy Cinematic Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(2,6,23,1)] pointer-events-none border-[20px] border-black/20 mix-blend-overlay" />
    </div>
  );
};

export default CitizenBackground;
