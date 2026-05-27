import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Key, Mail, Loader2, ArrowRight, ShieldCheck, Server, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axiosConfig';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1); setEmail(''); setToken(''); setPassword(''); setPasswordConfirmation('');
      }, 300);
    }
  }, [isOpen]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/password/forgot', { email });
      setToken(res.data.data.token);
      toast.success(res.data.message || 'Reset link generated successfully');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found or error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/password/reset', { 
        email, token, password, password_confirmation: passwordConfirmation 
      });
      toast.success('Password reset successfully! You can now login.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Reset Password</h2>
              <p className="text-slate-400 text-sm font-light">
                {step === 1 ? 'Enter your operational email to generate a secure reset token.' : 'Enter your new secure credentials.'}
              </p>
            </div>
            {step === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm" placeholder="operator@disasterrelief.gov" />
                </div>
                <button type="submit" disabled={loading} className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex justify-center items-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate Token'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">New Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                  <input type="password" required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading} className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex justify-center items-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Reset'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TacticalMapBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#020617]">
      {/* Ambient Lighting & Fog */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-slate-900/20 to-[#020617] opacity-90 mix-blend-screen" />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-900/40 blur-[120px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-cyan-900/20 blur-[150px]" 
      />

      {/* Grid Topology */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTM5IDQwaC0xVjFoLTM4di0xaDQwdjQwcyIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] opacity-70" />

      {/* Map Paths & Nodes */}
      <svg className="absolute inset-0 w-full h-full opacity-80 mix-blend-screen" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="route1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="route2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Connection Routes */}
        <motion.path 
          d="M 100 700 Q 300 400 700 300 T 900 100" 
          fill="none" 
          stroke="url(#route1)" 
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.path 
          d="M 50 200 Q 400 300 600 700 T 800 900" 
          fill="none" 
          stroke="url(#route2)" 
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2 }}
        />
        {/* Static Background Routes */}
        <path d="M 700 200 Q 500 400 200 800" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="1" strokeDasharray="4,4" />
        <path d="M 150 300 Q 500 500 850 600" fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="1" strokeDasharray="2,6" />

        {/* Tactical Nodes */}
        {[
          { cx: 100, cy: 700, color: '#10b981' },
          { cx: 700, cy: 300, color: '#22d3ee' },
          { cx: 50, cy: 200, color: '#10b981' },
          { cx: 600, cy: 700, color: '#10b981' },
          { cx: 400, cy: 450, color: '#10b981' },
          { cx: 800, cy: 200, color: '#ef4444', isEmergency: true }, // Emergency pulse
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.cx} cy={node.cy} r="3" fill={node.color} />
            <motion.circle 
              cx={node.cx} cy={node.cy} r="15" 
              fill="none" stroke={node.color} strokeWidth="1"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: node.isEmergency ? 3 : 2, opacity: 0 }}
              transition={{ duration: node.isEmergency ? 1.2 : 3, repeat: Infinity, delay: i * 0.4 }}
            />
            {node.isEmergency && (
              <text x={node.cx + 25} y={node.cy + 5} fill="#ef4444" fontSize="10" fontFamily="monospace" opacity="0.8">SOS_DETECTED</text>
            )}
          </g>
        ))}
      </svg>

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] blur-[0.5px]"
          style={{ 
            width: Math.random() * 2 + 1, 
            height: Math.random() * 2 + 1, 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%` 
          }}
          animate={{ y: [0, -80, 0], opacity: [0, 0.4, 0] }}
          transition={{ duration: Math.random() * 15 + 10, repeat: Infinity, ease: "linear", delay: -Math.random() * 20 }}
        />
      ))}

      {/* Scan Line */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent border-b border-emerald-500/10"
        animate={{ y: ["-100vh", "150vh"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* HUD Overlays */}
      <div className="absolute top-12 right-12 flex flex-col gap-2 items-end z-10">
        <div className="text-[10px] font-mono text-emerald-400 tracking-widest border border-emerald-500/30 bg-emerald-950/50 px-2 py-1 rounded backdrop-blur-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SYS.CORE.ONLINE
        </div>
        <div className="text-[10px] font-mono text-slate-500 tracking-widest bg-slate-900/50 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm">
          LAT: 26.1445 LONG: 91.7362
        </div>
      </div>
      
      {/* Rotating Radar Overlay */}
      <div className="absolute bottom-12 right-12 w-48 h-48 border-[0.5px] border-emerald-900/30 rounded-full flex items-center justify-center opacity-40 mix-blend-screen">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-full h-full border-t-2 border-l-2 border-emerald-500/20 rounded-full"
        />
        <div className="absolute w-full h-[1px] bg-emerald-900/40" />
        <div className="absolute w-[1px] h-full bg-emerald-900/40" />
        <div className="absolute w-2 h-2 bg-emerald-500/50 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]" />
      </div>

      {/* Inner Vignette / Shadow */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(2,6,23,1)] pointer-events-none" />
    </div>
  );
};

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '', remember: false });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      // First get CSRF cookie for Sanctum
      await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
      
      const res = await api.post('/login', { email: credentials.email, password: credentials.password });
      dispatch(loginSuccess({
        user: res.data.data.user,
        token: res.data.data.access_token
      }));
      toast.success('Successfully authenticated.');
      const userRole = res.data.data.user.role?.slug;
      
      if (userRole === 'citizen') {
        navigate('/portal/home');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Authentication Failed'));
      toast.error('Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row font-sans text-zinc-200 relative overflow-hidden">
      
      {/* Left Panel: Branding & Operational Overview */}
      <div className="hidden md:flex flex-col w-1/2 lg:w-[55%] p-10 lg:p-16 relative overflow-hidden border-r border-white/5 bg-[#020617] z-10 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        
        {/* The new Cinematic Background */}
        <TacticalMapBackground />

        {/* Branding Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex items-center gap-3 mb-16"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md">
            <ShieldAlert className="text-emerald-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Relief<span className="text-emerald-500">Hub</span></h1>
            <p className="text-[10px] font-bold tracking-widest text-emerald-500/70 uppercase mt-0.5 font-mono">Disaster Management</p>
          </div>
        </motion.div>

        {/* Value Proposition & Description */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="relative z-10 max-w-xl mb-16"
        >
          <h2 className="text-6xl lg:text-7xl font-black text-white mb-6 leading-[0.95] tracking-tighter drop-shadow-2xl">
            National Disaster Relief<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Coordination Platform
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed font-light max-w-lg bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 backdrop-blur-md">
            Centralized operational command system for deploying resources, managing relief camps, and tracking volunteer networks during critical emergency responses.
          </p>
        </motion.div>

        {/* Mini Operational Statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="relative z-10 grid grid-cols-2 gap-4 max-w-lg mt-auto mb-8"
        >
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">Active Crises</span>
            <span className="text-3xl font-black text-white mt-1">12</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">Deployed Resources</span>
            <span className="text-3xl font-black text-white mt-1">45.2K</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">Active Personnel</span>
            <span className="text-3xl font-black text-white mt-1">842</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-emerald-500/30 p-5 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
            <span className="text-[10px] font-bold tracking-widest text-emerald-500/80 uppercase font-mono relative z-10">System Uptime</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 relative z-10">99.9%</span>
          </div>
        </motion.div>

      </div>

      {/* Right Panel: Authentication Form */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 bg-bg-base">
        
        <motion.div 
          initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md glass-panel p-8 sm:p-10 border border-white/5"
        >
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <ShieldAlert className="text-emerald-500" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Relief<span className="text-emerald-500">Hub</span></h1>
              <p className="text-[10px] font-semibold tracking-wide text-zinc-400 uppercase mt-0.5">Disaster Management</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
            <p className="text-sm text-zinc-400 mt-1.5 font-light">Enter your operational credentials to access the system.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                  placeholder="operator@disasterrelief.gov"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key size={18} className="text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={credentials.remember}
                    onChange={(e) => setCredentials({ ...credentials, remember: e.target.checked })}
                    className="peer w-4 h-4 rounded border-slate-600 bg-slate-900/50 checked:bg-emerald-500 checked:border-emerald-500 focus:ring-0 focus:ring-offset-0 appearance-none transition-colors cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 left-0.5 top-0.5 pointer-events-none text-slate-900 opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
              </label>
              <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Forgot password?</button>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full mt-6 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex justify-center items-center">
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2">Initialize Session <ArrowRight size={16} /></span>
              )}
            </button>
          </form>
        </motion.div>

        {/* Security / Status Footer */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute bottom-8 flex flex-wrap justify-center gap-4 text-[10px] sm:text-xs text-zinc-600 font-medium px-6 text-center font-mono"
        >
          <div className="flex items-center gap-1.5"><Lock size={12} /> SECURE_TUNNEL</div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-1.5"><ShieldCheck size={12} /> RBAC_ENFORCED</div>
          <span className="hidden sm:inline opacity-30">•</span>
          <div className="flex items-center gap-1.5"><Server size={12} /> NET_ENCRYPTED</div>
        </motion.div>

      </div>
      
      {/* Modals */}
      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
};

export default Login;
