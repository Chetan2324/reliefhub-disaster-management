import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { 
  LayoutDashboard, AlertTriangle, Warehouse, Package, 
  Truck, Tent, Users, UserCheck, Heart, Activity, 
  LogOut, Menu, X, Bell, Siren, PackageCheck, Radar, ShieldAlert, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AmbientBackground from '../ui/AmbientBackground';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Force close sidebar on mobile by default, open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const allNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super-admin', 'disaster-management-officer', 'warehouse-manager', 'volunteer', 'citizen', 'transport-officer', 'ngo-partner'] },
    { icon: Radar, label: 'Disaster Management', path: '/disasters', roles: ['super-admin', 'disaster-management-officer'] },
    { icon: Siren, label: 'Emergency Requests', path: '/emergency-requests', roles: ['super-admin', 'disaster-management-officer', 'citizen', 'volunteer'] },
    { icon: Warehouse, label: 'Warehouses', path: '/warehouses', roles: ['super-admin', 'warehouse-manager'] },
    { icon: Package, label: 'Inventory', path: '/inventory', roles: ['super-admin', 'warehouse-manager'] },
    { icon: Truck, label: 'Transportation', path: '/transport', roles: ['super-admin', 'warehouse-manager', 'transport-officer'] },
    { icon: Tent, label: 'Relief Camps', path: '/camps', roles: ['super-admin', 'disaster-management-officer', 'volunteer', 'citizen'] },
    { icon: Users, label: 'Citizens', path: '/citizens', roles: ['super-admin', 'disaster-management-officer'] },
    { icon: PackageCheck, label: 'Distribution', path: '/distributions', roles: ['super-admin', 'warehouse-manager', 'volunteer'] },
    { icon: UserCheck, label: 'Volunteers', path: '/volunteers', roles: ['super-admin', 'disaster-management-officer', 'volunteer'] },
    { icon: Heart, label: 'Donations', path: '/donations', roles: ['super-admin', 'ngo-partner'] },
    { icon: Activity, label: 'Reports', path: '/reports', roles: ['super-admin', 'disaster-management-officer'] },
  ];

  const userRole = user?.role?.slug || user?.roles?.[0]?.slug || 'super-admin'; // Fallback to super-admin if undefined
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-bg-base text-zinc-200 overflow-hidden font-sans relative">
      <AmbientBackground variant="default" />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth < 1024 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Premium Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed lg:relative z-50 w-72 h-full bg-bg-surface/60 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0"
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative flex items-center justify-center w-10 h-10 bg-primary-500/10 rounded-lg border border-primary-500/20">
              <ShieldAlert className="text-primary-500" size={24} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wide text-white">Relief<span className="text-primary-500">Hub</span></span>
              <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">Disaster Management</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 relative z-10 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <item.icon size={20} className={`mr-3 transition-colors duration-300 ${isActive ? 'text-primary-400' : 'group-hover:text-zinc-300'}`} />
                  <span className={`font-medium text-sm ${isActive ? 'font-semibold text-white' : ''}`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 bg-bg-surface-light/30 relative z-10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-bg-surface-light border-2 border-white/10 flex items-center justify-center">
              <span className="font-semibold text-zinc-300">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-zinc-200 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.roles?.[0]?.name || 'Administrator'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 rounded-lg transition-all duration-300 group"
          >
            <LogOut size={16} /> 
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        
        {/* Premium Topbar */}
        <header className="h-20 bg-bg-surface/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0 relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(0,208,132,0.6)]"></div>
              <span className="text-xs font-medium text-zinc-400">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Compact Search Bar */}
            <div className="hidden md:flex items-center bg-bg-surface-light/50 border border-white/10 rounded-lg px-3 py-1.5 transition-colors focus-within:border-primary-500/50 shadow-inner">
              <Search size={14} className="text-zinc-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search operations..." 
                className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-500 w-48 font-medium"
              />
            </div>

            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-zinc-400 hover:text-white relative group"
            >
              <Bell size={20} className="group-hover:text-warning-500 transition-colors" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-warning-500 rounded-full border border-bg-surface"></span>
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 w-80 glass-panel p-0 overflow-hidden z-50 border border-white/10"
                >
                  <div className="p-3 border-b border-white/5 bg-bg-surface-light/50 flex justify-between items-center">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-warning-500/10 text-warning-500 border border-warning-500/20">3 New</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                      <div className="mt-1"><Siren size={16} className="text-danger-500 animate-pulse" /></div>
                      <div>
                        <p className="text-sm text-white font-medium">Critical SOS Intercepted</p>
                        <p className="text-xs text-zinc-400">Sector 4 Flooding Zone. Requires immediate EVAC.</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">Just now</p>
                      </div>
                    </div>
                    <div className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                      <div className="mt-1"><Warehouse size={16} className="text-warning-500" /></div>
                      <div>
                        <p className="text-sm text-white font-medium">Low Medical Stock</p>
                        <p className="text-xs text-zinc-400">Warehouse Alpha reporting depleted first-aid kits.</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">12 mins ago</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative z-0 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
