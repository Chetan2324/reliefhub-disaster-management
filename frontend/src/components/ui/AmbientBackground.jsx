import { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const WorldMapOverlay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen z-0 opacity-[0.35]">
    <svg viewBox="0 0 1200 800" className="absolute w-[150%] h-[150%] -left-[20%] -top-[10%] object-cover">
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-atmos-crimson)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-atmos-crimson)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="var(--color-atmos-ember)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      
      {/* Topographic Contour Lines */}
      <g className="stroke-white" opacity="0.03" fill="none" strokeWidth="1">
        <path d="M 0 100 Q 200 150 400 100 T 800 200 T 1200 150" />
        <path d="M 0 150 Q 250 200 450 150 T 850 250 T 1200 200" />
        <path d="M 0 200 Q 300 250 500 200 T 900 300 T 1200 250" />
        <path d="M 0 250 Q 350 300 550 250 T 950 350 T 1200 300" />
      </g>

      {/* Base Dotted Topology - Dense Abstract Nodes */}
      <g className="fill-white" opacity="0.04">
        {Array.from({ length: 400 }).map((_, i) => (
          <circle key={`dot-${i}`} cx={Math.random() * 800} cy={Math.random() * 800} r={Math.random() * 1.5 + 0.5} />
        ))}
      </g>

      {/* Animated Connection Arcs - Data Flow */}
      <g className="stroke-[url(#arcGlow)] fill-none" strokeWidth="2">
        <motion.path 
          d="M 100 500 Q 250 300 400 400 T 600 200" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.path 
          d="M 50 200 Q 150 400 300 200 T 500 500" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 2 }}
        />
        <motion.path 
          d="M 200 600 Q 400 350 600 500 T 800 300" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 4 }}
        />
      </g>

      {/* Active Glowing Operational Nodes */}
      <g>
        {/* Node 1 */}
        <motion.circle cx="100" cy="500" r="30" stroke="var(--color-atmos-crimson)" strokeWidth="1" fill="none" initial={{ scale: 0.5, opacity: 0.6 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }} />
        <circle cx="100" cy="500" r="50" fill="url(#nodeGlow)" opacity="0.5" />
        <circle cx="100" cy="500" r="4" fill="var(--color-atmos-crimson)" opacity="0.8" />
        <circle cx="100" cy="500" r="12" stroke="var(--color-atmos-crimson)" strokeWidth="1" fill="none" opacity="0.3" />
        
        {/* Node 2 */}
        <motion.circle cx="400" cy="400" r="40" stroke="var(--color-atmos-crimson)" strokeWidth="1" fill="none" initial={{ scale: 0.5, opacity: 0.6 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 5, repeat: Infinity, ease: 'easeOut', delay: 1 }} />
        <circle cx="400" cy="400" r="70" fill="url(#nodeGlow)" opacity="0.5" />
        <circle cx="400" cy="400" r="6" fill="var(--color-atmos-crimson)" opacity="0.8" />
        <circle cx="400" cy="400" r="18" stroke="var(--color-atmos-crimson)" strokeWidth="1" fill="none" opacity="0.3" />
        
        {/* Node 3 */}
        <motion.circle cx="300" cy="200" r="20" stroke="var(--color-atmos-crimson)" strokeWidth="1" fill="none" initial={{ scale: 0.5, opacity: 0.6 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut', delay: 2 }} />
        <circle cx="300" cy="200" r="40" fill="url(#nodeGlow)" opacity="0.5" />
        <circle cx="300" cy="200" r="5" fill="var(--color-atmos-crimson)" opacity="0.8" />
        
        {/* Node 4 */}
        <motion.circle cx="600" cy="200" r="15" stroke="var(--color-atmos-crimson)" strokeWidth="1" fill="none" initial={{ scale: 0.5, opacity: 0.6 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />
        <circle cx="600" cy="200" r="30" fill="url(#nodeGlow)" opacity="0.5" />
        <circle cx="600" cy="200" r="3" fill="var(--color-atmos-crimson)" opacity="0.8" />
      </g>
    </svg>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-bg-base)_80%)]" />
  </div>
);

// SVG Film Grain
const FilmGrain = () => (
  <svg className="pointer-events-none absolute inset-0 z-50 h-full w-full opacity-[0.02] mix-blend-soft-light">
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.2 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const AmbientBackground = ({ variant = 'default' }) => {
  const isCalm = variant === 'calm';
  
  // 3-Tier Particle System
  const PARTICLES = useMemo(() => {
    // Near Layer (Sharp, bright, fast, low count)
    const near = Array.from({ length: 2 }).map((_, i) => ({
      id: `near-${i}`,
      size: Math.random() * 8 + 12, // 12-20px
      x: Math.random() * 100, y: Math.random() * 100,
      duration: Math.random() * 15 + 10, delay: Math.random() * -20,
      opacity: Math.random() * 0.2 + 0.7, // 0.7-0.9
      blur: 'blur-none', speedMult: 1.5,
      color: 'bg-atmos-ember',
      glow: 'shadow-[0_0_50px_rgba(255,120,73,1)]'
    }));

    // Mid Layer (Soft blur, medium glow, diagonal)
    const mid = Array.from({ length: 4 }).map((_, i) => ({
      id: `mid-${i}`,
      size: Math.random() * 5 + 5, // 5-10px
      x: Math.random() * 100, y: Math.random() * 100,
      duration: Math.random() * 20 + 20, delay: Math.random() * -30,
      opacity: Math.random() * 0.2 + 0.5, // 0.5-0.7
      blur: 'blur-[3px]', speedMult: 1,
      color: 'bg-atmos-crimson',
      glow: 'shadow-[0_0_30px_rgba(255,90,95,0.8)]'
    }));

    // Far Layer (Tiny, dim, slow, deep opacity, no blur)
    const far = Array.from({ length: 8 }).map((_, i) => ({
      id: `far-${i}`,
      size: Math.random() * 2 + 3, // 3-5px
      x: Math.random() * 100, y: Math.random() * 100,
      duration: Math.random() * 40 + 40, delay: Math.random() * -40,
      opacity: Math.random() * 0.2 + 0.3, // 0.3-0.5
      blur: 'blur-[6px]', speedMult: 0.3,
      color: 'bg-atmos-magenta',
      glow: 'shadow-none'
    }));

    return [...near, ...mid, ...far];
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 100, mass: 2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const farX = useTransform(smoothX, [-1, 1], [6, -6]);
  const farY = useTransform(smoothY, [-1, 1], [6, -6]);
  const midX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const midY = useTransform(smoothY, [-1, 1], [-12, 12]);
  const nearX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const nearY = useTransform(smoothY, [-1, 1], [-30, 30]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-bg-base">
      <FilmGrain />
      
      {/* Volumetric Fog Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,90,95,0.05)_0%,transparent_50%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(199,44,108,0.05)_0%,transparent_60%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(5,8,16,0.95)_0%,transparent_100%)] mix-blend-multiply" />

      {/* Hero Operational Network (Left Anchored) */}
      <WorldMapOverlay />

      {/* Far Ambient Orbs */}
      <motion.div style={{ x: farX, y: farY }} className="absolute inset-0">
        <motion.div
          animate={{ 
            opacity: isCalm ? [0.1, 0.15, 0.1] : [0.15, 0.2, 0.15],
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-atmos-crimson/10 rounded-full blur-[100px] mix-blend-screen"
        />
        <motion.div
          animate={{ 
            opacity: isCalm ? [0.08, 0.12, 0.08] : [0.1, 0.15, 0.1],
            scale: [1, 1.15, 1],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[10%] right-[10%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-atmos-magenta/10 rounded-full blur-[120px] mix-blend-screen"
        />
      </motion.div>

      {/* 3-Tier Cinematic Particles */}
      <div className="absolute inset-0">
        {PARTICLES.map((p) => {
          const movementX = 40 * p.speedMult;
          const movementY = -60 * p.speedMult;
          const slowDown = isCalm ? 1.5 : 1;
          const pX = p.speedMult > 1 ? nearX : p.speedMult === 1 ? midX : farX;
          const pY = p.speedMult > 1 ? nearY : p.speedMult === 1 ? midY : farY;
          
          return (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}vw`,
                top: `${p.y}vh`,
                x: pX,
                y: pY
              }}
            >
              <motion.div
                className={`rounded-full ${p.color} ${p.glow} ${p.blur}`}
                style={{ width: p.size, height: p.size }}
                animate={{
                  x: [0, movementX, 0],
                  y: [0, movementY, 0],
                  opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4]
                }}
                transition={{
                  duration: p.duration * slowDown,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: p.delay
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Global Cinematic Edge Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(60,10,30,0.15)] mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,0.99)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_20%,rgba(2,4,12,0.98)_100%)] pointer-events-none" />
    </div>
  );
};

export default AmbientBackground;
