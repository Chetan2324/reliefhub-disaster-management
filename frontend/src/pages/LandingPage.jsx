import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Activity, Globe, Zap, Users, Package, ArrowRight, Map, CheckCircle2, ChevronRight, BarChart3, Radio, Database, Cpu } from 'lucide-react';

const AnimatedCounter = ({ from, to, duration = 2 }) => {
  const nodeRef = useRef();
  const inView = useInView(nodeRef, { once: true });
  
  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration,
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value).toString();
          }
        }
      });
      return () => controls.stop();
    }
  }, [from, to, duration, inView]);

  return <span ref={nodeRef}>{from}</span>;
};

const MouseGlow = ({ children }) => {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative group overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(16, 185, 129, 0.15), transparent 80%)`
          )
        }}
      />
      {children}
    </div>
  );
};

const ParticleBackground = () => {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * -30,
  }));

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]">
      {/* Vignette Overlay */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(2,6,23,1)] z-10" />

      {/* Ambient Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-900/20 blur-[120px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] rounded-full bg-cyan-900/10 blur-[150px]" 
      />
      
      {/* Animated Perspective Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM5IDQwaC0xVjFoLTM4di0xaDQwdjQwcyIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,transparent_100%)]">
        <motion.div 
          animate={{ backgroundPosition: ['0px 0px', '0px 40px'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM5IDQwaC0xVjFoLTM4di0xaDQwdjQwcyIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,transparent_100%)]"
        />
      </div>

      {/* Floating Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] blur-[1px]"
          style={{ width: p.size, height: p.size, left: `${p.x}vw`, top: `${p.y}vh` }}
          animate={{ y: [0, -150, 0], x: [0, Math.random() * 40 - 20, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
};

const PremiumFeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    <MouseGlow>
      <div className="relative h-full p-8 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/30 transition-colors z-10 shadow-2xl shadow-black/50">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-900/80 to-slate-900 border border-emerald-700/50 rounded-xl flex items-center justify-center mb-6 shadow-inner shadow-emerald-500/20">
          <Icon className="text-emerald-400" size={26} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
      </div>
    </MouseGlow>
  </motion.div>
);

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  // Floating data points parallax
  const float1Y = useTransform(scrollYProgress, [0, 1], ['0%', '-200%']);
  const float2Y = useTransform(scrollYProgress, [0, 1], ['0%', '150%']);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all">
              <Shield className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Relief<span className="text-emerald-400">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">
              System Login
            </Link>
            <Link to="/login" className="relative inline-flex h-10 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 group">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#020617_0%,#10b981_50%,#020617_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-6 py-1 text-sm font-bold text-white backdrop-blur-3xl transition-colors group-hover:bg-slate-900">
                Initialize Portal
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-20 overflow-hidden z-10">
        
        {/* Parallax Floating Data */}
        <motion.div style={{ y: float1Y }} className="absolute top-40 right-[15%] hidden lg:flex items-center gap-3 px-4 py-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center"><Activity size={14} className="text-emerald-400"/></div>
          <div>
            <div className="text-xs text-slate-400 font-mono">SYSTEM_LATENCY</div>
            <div className="text-sm font-bold text-white">12.4ms</div>
          </div>
        </motion.div>

        <motion.div style={{ y: float2Y }} className="absolute bottom-40 left-[10%] hidden lg:flex items-center gap-3 px-4 py-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center"><Globe size={14} className="text-cyan-400"/></div>
          <div>
            <div className="text-xs text-slate-400 font-mono">NODES_ACTIVE</div>
            <div className="text-sm font-bold text-white">4,892</div>
          </div>
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center relative z-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold tracking-widest mb-10 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            OPERATIONAL READINESS: 100%
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05] mb-8"
          >
            Tactical Disaster<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 animate-gradient-x drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              Response Matrix
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12 font-light"
          >
            A high-fidelity logistics and emergency command platform bridging the gap between automated resource dispatch and citizen survival.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] group">
              <Database size={20} className="group-hover:rotate-12 transition-transform" /> Access Command Center
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 text-slate-300 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl group">
              <Users size={20} className="group-hover:-translate-y-1 transition-transform" /> Enter Citizen Portal
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Cinematic Preview Section */}
      <section className="relative z-20 px-6 max-w-6xl mx-auto mb-40">
        <motion.div 
          initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950/80 backdrop-blur-2xl shadow-[0_20px_100px_rgba(0,0,0,0.8)] p-2 group"
        >
          {/* Animated border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50 bg-slate-900/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <div className="ml-4 text-xs font-mono text-emerald-500/70">RELIEF_HUB // TELEMETRY_FEED</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
            <div className="h-56 bg-slate-900/50 rounded-xl border border-slate-800/50 p-8 flex flex-col justify-between relative overflow-hidden group/card hover:bg-slate-800/30 transition-colors">
              <div className="text-sm font-medium text-slate-500 font-mono tracking-wider">SECURE TOKENS</div>
              <div>
                <div className="text-4xl font-black text-white mb-2 font-mono"><AnimatedCounter from={0} to={8429} /></div>
                <div className="text-emerald-400 text-sm flex items-center gap-2 font-mono bg-emerald-950/30 px-3 py-1 rounded-full w-fit">
                  <CheckCircle2 size={14}/> Verified Dispenses
                </div>
              </div>
            </div>
            <div className="h-56 bg-slate-900/50 rounded-xl border border-slate-800/50 p-8 flex flex-col justify-between relative overflow-hidden group/card hover:bg-slate-800/30 transition-colors">
              <div className="text-sm font-medium text-slate-500 font-mono tracking-wider">RESPONSE TIME</div>
              <div>
                <div className="text-4xl font-black text-cyan-400 mb-2 font-mono">1.2<span className="text-2xl text-cyan-700">s</span></div>
                <div className="text-cyan-500/80 text-sm font-mono">Automated SOS Routing</div>
              </div>
            </div>
            <div className="h-56 bg-slate-900/50 rounded-xl border border-slate-800/50 p-8 flex flex-col justify-between relative overflow-hidden group/card hover:bg-slate-800/30 transition-colors">
              <div className="absolute right-[-20%] bottom-[-20%] opacity-5 text-emerald-500"><Map size={200}/></div>
              <div className="text-sm font-medium text-slate-500 font-mono tracking-wider">ACTIVE ZONES</div>
              <div>
                <div className="text-4xl font-black text-emerald-400 mb-2 font-mono"><AnimatedCounter from={0} to={12} /></div>
                <div className="text-slate-400 text-sm font-mono">Camps Operational</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 bg-slate-950/80 backdrop-blur-xl border-y border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Enterprise Architecture. <br/><span className="text-slate-500">Human Impact.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Every module is engineered to accelerate response times, eliminate logistical bottlenecks, and secure data during critical crises.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PremiumFeatureCard delay={0.1} icon={Radio} title="AI Auto-Routing" description="Citizens instantly request aid. Background algorithms calculate Haversine distances to auto-assign victims to the nearest non-full relief camp." />
            <PremiumFeatureCard delay={0.2} icon={Package} title="Cryptographic Logistics" description="Eliminate duplicate allocations. Inventory is dispatched using secure, unique QR tokens verified cryptographically at the last mile." />
            <PremiumFeatureCard delay={0.3} icon={Map} title="Geospatial Telemetry" description="High-fidelity live maps track camp occupancy, active disaster radius, and logistics throughput in real-time." />
            <PremiumFeatureCard delay={0.4} icon={BarChart3} title="Command Dashboards" description="Tactical analytics provide incident commanders with instant operational oversight, aggregated feeds, and resource tracking." />
            <PremiumFeatureCard delay={0.5} icon={Users} title="Citizen Compassion" description="A dedicated, mobile-optimized portal for victims to track their allocated aid, find Google Maps directions, and receive live alerts." />
            <PremiumFeatureCard delay={0.6} icon={Shield} title="Zero-Trust Security" description="Strict Role-Based Access Control (RBAC) ensures rigid boundaries between tactical operations and public-facing data." />
          </div>
        </div>
      </section>

      {/* Workflow Section with Glowing Lines */}
      <section className="relative z-10 py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-24 relative z-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">The Golden Hour Protocol</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Observe the seamless flow of critical data from a citizen in distress to the tactical command center dispatch.</p>
          </div>

          <div className="relative">
            {/* Central Animated Line */}
            <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-800 md:-translate-x-1/2" />
            <motion.div 
              style={{ scaleY: useTransform(scrollYProgress, [0.5, 0.9], [0, 1]) }}
              className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500 via-cyan-400 to-emerald-500 origin-top shadow-[0_0_15px_rgba(16,185,129,0.8)] md:-translate-x-1/2 z-10" 
            />

            {[
              { icon: Radio, title: "SOS Initiated", desc: "Citizen opens the portal and taps the Emergency SOS button, bypassing long forms to provide live geographic coordinates.", align: "right" },
              { icon: Cpu, title: "Algorithmic Assignment", desc: "Backend algorithms process the request instantly, locating the nearest operational Relief Camp with confirmed available capacity.", align: "left" },
              { icon: Activity, title: "Command Alert", desc: "The incident flashes onto the Admin Command Center map. Camp managers receive instant push notification of incoming evacuees.", align: "right" },
              { icon: Package, title: "Secure Dispatch", desc: "Warehouse managers allocate specific inventory to the citizen, generating a unique cryptographic QR token for secure pickup.", align: "left" }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8 }}
                className={`relative flex items-center mb-16 md:mb-32 ${step.align === 'left' ? 'md:flex-row-reverse' : ''} group`}
              >
                <div className="hidden md:block w-1/2" />
                
                {/* Timeline Node */}
                <div className="absolute left-[40px] md:left-1/2 w-12 h-12 rounded-full bg-slate-950 border-4 border-slate-800 group-hover:border-emerald-400 -translate-x-1/2 z-20 flex items-center justify-center transition-colors duration-500 shadow-xl group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <step.icon size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                
                {/* Content */}
                <div className={`w-full pl-28 md:pl-0 md:w-1/2 ${step.align === 'left' ? 'md:pr-24 text-left md:text-right' : 'md:pl-24 text-left'}`}>
                  <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl group-hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
                    <div className="text-emerald-500 font-mono text-xs font-bold tracking-widest mb-3 opacity-80">PHASE 0{idx + 1}</div>
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 pt-40 pb-16 px-6 border-t border-slate-800 bg-[#01030a] overflow-hidden">
        {/* Cinematic Ground Glow */}
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.15)_0%,transparent_60%)] pointer-events-none mix-blend-screen" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, type: "spring" }}
          >
            <Shield className="w-20 h-20 text-emerald-500 mx-auto mb-10 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]" />
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Ready to Deploy.</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the live demonstration of the ReliefHub platform. Explore both the high-fidelity Command Center and the compassionate Citizen Portal.
          </p>
          <Link to="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-950 font-black rounded-xl hover:bg-emerald-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105 group">
            Initialize System <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="mt-40 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600 font-mono">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              ReliefHub Production Core v1.0
            </div>
            <div>Constructed for modern disaster resilience.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
