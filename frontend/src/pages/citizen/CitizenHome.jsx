import { useState, useEffect } from 'react';
import { ShieldAlert, Heart, MapPin, Package, ArrowRight, Activity, Bell, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

const CitizenHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [nearestCamp, setNearestCamp] = useState(null);
  const [loadingCamp, setLoadingCamp] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return (R * c).toFixed(1); 
  };

  useEffect(() => {
    const fetchNearestCamp = async (lat, lng) => {
      try {
        const res = await api.get('/camps');
        let camps = res.data?.data || [];
        
        if (camps.length === 0) {
          camps = [{
            id: 'fallback-1',
            name: 'Central Relief Hub (Demo Node)',
            latitude: 26.1445,
            longitude: 91.7362,
            capacity: 500,
            current_occupancy: 120,
            medical_facility_available: true
          }];
        }

        if (lat && lng) {
          const sorted = camps.map(camp => ({
            ...camp,
            distance: calculateDistance(lat, lng, camp.latitude, camp.longitude)
          })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
          setNearestCamp(sorted[0]);
        } else {
          setNearestCamp(camps[0]);
        }
      } catch (error) {
        console.error('Failed to fetch camps', error);
        setNearestCamp({
          id: 'fallback-error',
          name: 'Emergency Hub (Offline Mode)',
          latitude: 26.1445,
          longitude: 91.7362,
          capacity: 200,
          current_occupancy: 10,
          medical_facility_available: true
        });
      } finally {
        setLoadingCamp(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchNearestCamp(position.coords.latitude, position.coords.longitude),
        (error) => fetchNearestCamp(null, null),
        { timeout: 3000, maximumAge: 60000 }
      );
    } else {
      fetchNearestCamp(null, null);
    }
  }, []);

  return (
    <div className="pb-10 space-y-8 relative z-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] p-8 md:p-10 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.05)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700 pointer-events-none">
          <Heart size={200} className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,1)]" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-emerald-500/30 rounded-full scale-[1.8] border-dashed" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border border-emerald-400/20 rounded-full scale-[1.3] border-dotted" />
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-1000 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:justify-between items-start relative z-10 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              </div>
              <span className="text-emerald-400 font-mono text-xs tracking-[0.25em] uppercase drop-shadow-md">Secure Uplink Established</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
              System Active, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{user?.name?.split(' ')[0] || 'Citizen'}</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed border-l-2 border-emerald-500/40 pl-5 backdrop-blur-sm bg-slate-900/20 py-2 rounded-r-xl">
              Relief teams are actively scanning your sector. Coordinate emergency extraction or track critical aid allocations below in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-emerald-300 bg-slate-950/80 px-6 py-4 rounded-xl border border-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70"></div>
            <Clock size={16} className="animate-pulse text-emerald-400" /> 
            <span className="tracking-[0.2em]">{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link to="/portal/sos" className="bg-slate-900/40 backdrop-blur-3xl hover:bg-slate-800/60 border border-slate-700/50 hover:border-red-500/50 p-8 rounded-[2rem] flex items-center gap-6 transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(239,68,68,0.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-24 h-24 rounded-2xl bg-slate-950 text-red-500 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(239,68,68,0.1)] group-hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] z-10 overflow-hidden shrink-0">
             <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}><ShieldAlert size={40} /></motion.div>
             <div className="absolute bottom-0 left-0 w-full h-1.5 bg-red-400 opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="font-black tracking-tight text-white text-2xl group-hover:text-red-100 drop-shadow-md mb-1">Emergency SOS</h3>
            <p className="text-sm text-slate-400 font-medium group-hover:text-red-200/70 transition-colors">Deploy extraction team</p>
          </div>
          <ArrowRight size={24} className="text-slate-600 group-hover:text-red-400 transform group-hover:translate-x-3 transition-all duration-500 relative z-10" />
        </Link>

        <Link to="/portal/aid" className="bg-slate-900/40 backdrop-blur-3xl hover:bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/50 p-8 rounded-[2rem] flex items-center gap-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] group relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-24 h-24 rounded-2xl bg-slate-950 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] relative z-10 overflow-hidden shrink-0">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}><Package size={40} /></motion.div>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-400 opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="font-black tracking-tight text-white text-2xl group-hover:text-emerald-100 drop-shadow-md mb-1">My Allocations</h3>
            <p className="text-sm text-slate-400 font-medium group-hover:text-emerald-200/70 transition-colors">Secure relief packages</p>
          </div>
          <ArrowRight size={24} className="text-slate-600 group-hover:text-emerald-400 transform group-hover:translate-x-3 transition-all duration-500 relative z-10" />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Live Updates */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="xl:col-span-2">
          <h2 className="text-sm font-bold text-slate-200 mb-5 flex items-center gap-3 uppercase tracking-[0.2em]">
            <div className="relative">
              <Activity size={18} className="text-cyan-400 relative z-10" />
              <span className="absolute inset-0 bg-cyan-400 blur-md opacity-50"></span>
            </div>
            Active Operational Node
          </h2>
          <div className="space-y-4">
            {loadingCamp ? (
              <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-[2rem] flex flex-col sm:flex-row items-start gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                <div className="w-20 h-20 bg-slate-800/80 rounded-2xl shrink-0"></div>
                <div className="flex-1 space-y-4 w-full py-2">
                  <div className="h-6 bg-slate-800/80 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-800/80 rounded w-1/3"></div>
                  <div className="h-10 bg-slate-800/80 rounded-xl w-full mt-4"></div>
                </div>
              </div>
            ) : nearestCamp ? (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-slate-900/50 backdrop-blur-3xl border border-slate-700/50 hover:border-cyan-500/40 p-8 rounded-[2rem] flex flex-col sm:flex-row items-start gap-8 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.5)] group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
                
                <div className="relative shrink-0">
                  <div className="p-6 bg-slate-950 text-cyan-400 rounded-3xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all z-10 relative overflow-hidden">
                    <MapPin size={40} className="relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors"></div>
                  </div>
                  <motion.div animate={{ scale: [1, 2.5], opacity: [0.6, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-0 border-2 border-cyan-400/50 rounded-3xl pointer-events-none" />
                  <motion.div animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 border border-cyan-400/30 rounded-3xl pointer-events-none" />
                </div>

                <div className="flex-1 w-full relative z-10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <h3 className="text-cyan-100 font-black text-2xl tracking-tight drop-shadow-md mb-2">{nearestCamp.name}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-2 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
                        {nearestCamp.medical_facility_available ? 'Medical Node & Shelter Online' : 'Basic Shelter Online'}
                      </p>
                    </div>
                    {nearestCamp.distance && (
                      <span className="text-sm font-mono font-bold text-cyan-300 bg-cyan-950/80 px-4 py-2 rounded-xl border border-cyan-500/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2 shrink-0">
                        <MapPin size={14} className="text-cyan-400" />
                        {nearestCamp.distance} KM
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-8 mb-3 flex justify-between text-xs font-mono font-bold tracking-widest text-slate-400">
                    <span>CAPACITY LOAD</span>
                    <span className="text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20 shadow-inner">
                      {Math.round((nearestCamp.current_occupancy / nearestCamp.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 relative overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(nearestCamp.current_occupancy / nearestCamp.capacity) * 100}%` }}
                      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-3 rounded-full relative"
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white opacity-40 animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                  </div>

                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearestCamp.latitude},${nearestCamp.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 w-full sm:w-auto inline-flex justify-center text-slate-950 font-black tracking-wide uppercase text-sm items-center gap-3 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 px-8 py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:-translate-y-1 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    Initiate Route <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ) : null}
          </div>
        </motion.div>

        {/* Tactical Feed */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="xl:col-span-1 h-full">
          <h2 className="text-sm font-bold text-slate-200 mb-5 flex items-center gap-3 uppercase tracking-[0.2em]">
            <div className="relative">
              <Bell size={18} className="text-emerald-400 relative z-10" />
              <span className="absolute inset-0 bg-emerald-400 blur-md opacity-50"></span>
            </div>
            Live Intel
          </h2>
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-700/50 rounded-[2rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden h-full min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-950/90 pointer-events-none z-10" />
            
            <div className="relative z-0 space-y-8 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-emerald-500/50 before:via-slate-700 before:to-transparent">
              {[
                { time: 'T-00:02', msg: 'Medical payload inbound for Sector B.', type: 'info' },
                { time: 'T-00:15', msg: 'Camp Alpha beds expanded by 50 units.', type: 'success' },
                { time: 'T-00:42', msg: 'Helicopter extraction en route to Grid 7.', type: 'alert' }
              ].map((alert, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.15 }}
                  key={i} className="relative flex items-start gap-6 group cursor-default"
                >
                  <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-900 shadow-xl shrink-0 z-10 ${alert.type === 'success' ? 'bg-emerald-400' : alert.type === 'alert' ? 'bg-amber-400' : 'bg-cyan-400'}`}>
                    <span className="absolute w-8 h-8 rounded-full opacity-30 animate-ping bg-inherit"></span>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 shadow-[0_5px_15px_rgba(0,0,0,0.2)] group-hover:border-slate-600 transition-colors group-hover:bg-slate-900/80 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-slate-700 group-hover:via-slate-500 to-transparent"></div>
                    <div className="flex items-center justify-between mb-2">
                      <time className="text-[10px] font-mono font-bold tracking-wider text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded shadow-inner border border-slate-800">{alert.time}</time>
                    </div>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed drop-shadow-sm">{alert.msg}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CitizenHome;
