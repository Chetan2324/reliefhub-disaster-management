import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Home, Heart, Package, MapPin, Bell, User, LogOut, ShieldAlert } from 'lucide-react';
import CitizenBackground from '../ui/CitizenBackground';
import { motion } from 'framer-motion';

const CitizenLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin to dashboard
  if (user.role?.slug !== 'citizen') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = [
    { path: '/portal/home', icon: Home, label: 'Command Center' },
    { path: '/portal/sos', icon: ShieldAlert, label: 'Emergency SOS' },
    { path: '/portal/aid', icon: Package, label: 'Aid Tracking' },
    { path: '/portal/camp', icon: MapPin, label: 'Nearest Camps' },
    { path: '/portal/notifications', icon: Bell, label: 'Tactical Alerts' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans relative flex overflow-hidden">
      <CitizenBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-slate-800/50 bg-slate-900/40 backdrop-blur-xl z-30 relative shrink-0">
        <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-800/50">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Heart size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white drop-shadow-md">Relief<span className="text-emerald-500">Hub</span></h1>
            <p className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">Citizen Portal</p>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${
                location.pathname === item.path 
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {location.pathname === item.path && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              )}
              <item.icon size={18} className={location.pathname === item.path ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50 mt-auto">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
              <User size={14} className="text-slate-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] font-mono text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-20">
        
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Heart size={16} className="text-emerald-400" />
            </div>
            <span className="font-bold tracking-tight text-white">Relief<span className="text-emerald-500">Hub</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-slate-400">
              <Bell size={20} />
              <span className="absolute 0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </button>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400"><LogOut size={18} /></button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 md:mb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === item.path ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              <item.icon size={20} className={location.pathname === item.path ? 'animate-bounce' : ''} />
              <span className="text-[9px] font-medium tracking-tight truncate w-full text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CitizenLayout;
