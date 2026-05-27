import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/axiosConfig';
import { 
  AlertTriangle, Truck, Users, Activity, Radar, Package, Tent, 
  UserCheck, RadioReceiver, ShieldCheck, Database, Server, 
  PlusSquare, Send, UserPlus, Box, Clock, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';

// Fix Leaflet Default Icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Clean Operational Marker
const tacticalIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-3 h-3 bg-danger-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const Counter = ({ from, to, duration = 1.5 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(from + (to - from) * easeOutQuart));
      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const KPICard = ({ icon: Icon, label, value, color, delay }) => {
  const colorMap = {
    red: 'text-danger-500 bg-danger-500/10 border-danger-500/20',
    slate: 'text-zinc-400 bg-white/5 border-white/5',
    yellow: 'text-warning-500 bg-warning-500/10 border-warning-500/20',
    purple: 'text-accent-500 bg-accent-500/10 border-accent-500/20',
    emerald: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
    orange: 'text-warning-500 bg-warning-500/10 border-warning-500/20',
  };

  const style = colorMap[color] || colorMap.slate;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4 flex flex-col justify-between h-28"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-400">{label}</h3>
        <div className={`p-1.5 rounded-lg border ${style.split(' ')[1]} ${style.split(' ')[2]}`}>
          <Icon size={16} className={style.split(' ')[0]} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">
        <Counter from={0} to={value} />
      </div>
    </motion.div>
  );
};

// Simulated Feeds & Data
const MOCK_FEEDS = [
  { id: 1, type: 'dispatch', message: 'Medical supplies dispatched to Camp Delta', time: 'Just now', icon: Truck, color: 'text-primary-400 border-primary-400/20 bg-primary-400/10' },
  { id: 2, type: 'alert', message: 'Emergency request resolved in Zone B', time: '2m ago', icon: ShieldCheck, color: 'text-primary-500 border-primary-500/20 bg-primary-500/10' },
  { id: 3, type: 'delivery', message: '500 Medical Kits delivered to Camp Hope', time: '15m ago', icon: Package, color: 'text-zinc-400 border-white/10 bg-white/5' },
  { id: 4, type: 'volunteer', message: 'Volunteer team assigned to Sector 3', time: '1h ago', icon: UserCheck, color: 'text-warning-500 border-warning-500/20 bg-warning-500/10' },
  { id: 5, type: 'system', message: 'Routine database sync completed', time: '2h ago', icon: Database, color: 'text-zinc-500 border-white/5 bg-white/5' },
];

const MOCK_ALERTS = [
  { id: 1, title: 'Camp Capacity Warning', desc: 'Camp Hope is at 95% capacity.', severity: 'critical' },
  { id: 2, title: 'Low Inventory', desc: 'Antibiotics stock below 15% threshold.', severity: 'warning' },
  { id: 3, title: 'Transport Delayed', desc: 'Convoy Beta delayed by weather conditions.', severity: 'warning' },
];

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    disasters: 0, inventory: 0, dispatches: 0, camps: 0, 
    citizens: 0, volunteers: 0, sos: 0 
  });
  const [chartData, setChartData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [feed, setFeed] = useState(MOCK_FEEDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, chartsRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/charts')
        ]);
        
        const sumData = summaryRes.data.data || summaryRes.data;
        setStats(prev => ({
          ...prev,
          disasters: sumData.active_disasters || 0,
          inventory: sumData.total_materials_available || 0,
          dispatches: sumData.vehicles_in_transit || 0,
          camps: sumData.total_camps || 0,
          citizens: sumData.citizens_assisted || 0,
          volunteers: sumData.active_volunteers || 0,
          sos: sumData.pending_sos || 0
        }));

        if (sumData.map_data && sumData.map_data.length > 0) {
          const validMapData = sumData.map_data.filter(d => d.latitude != null && d.longitude != null);
          if (validMapData.length > 0) {
            setMapData(validMapData);
          } else {
            setMapData([{ id: 'mock', name: 'No Active Operations', latitude: 26.2006, longitude: 92.9376, severity: 'low' }]);
          }
        } else {
          setMapData([{ id: 'mock', name: 'No Active Operations', latitude: 26.2006, longitude: 92.9376, severity: 'low' }]);
        }

        if (sumData.alerts && sumData.alerts.length > 0) {
          setAlerts(sumData.alerts);
        }

        if (sumData.feeds && sumData.feeds.length > 0) {
          // Map backend feed type to icons/colors
          const mappedFeeds = sumData.feeds.map(f => {
            let icon = Database; let color = 'text-zinc-500 border-white/5 bg-white/5';
            if (f.type.includes('dispatch') || f.type.includes('vehicle')) { icon = Truck; color = 'text-primary-400 border-primary-400/20 bg-primary-400/10'; }
            if (f.type.includes('emergency')) { icon = ShieldAlert; color = 'text-danger-500 border-danger-500/20 bg-danger-500/10'; }
            if (f.type.includes('volunteer')) { icon = UserCheck; color = 'text-warning-500 border-warning-500/20 bg-warning-500/10'; }
            return { ...f, icon, color };
          });
          setFeed(mappedFeeds);
        }

        const rawTrend = (chartsRes.data.data && chartsRes.data.data.daily_dispatch_trend) || chartsRes.data.daily_dispatch_trend;
        if (rawTrend) {
          const mappedChartData = Object.keys(rawTrend).map(key => ({
            name: key,
            value: rawTrend[key]
          }));
          setChartData(mappedChartData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Calculate center based on map data
  const mapCenter = mapData.length > 0 && mapData[0].id !== 'mock' 
    ? [mapData[0].latitude, mapData[0].longitude] 
    : [26.2006, 92.9376];

  return (
    <div className="space-y-5 pb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2 tracking-tight">
            <Activity className="text-primary-500" size={22} /> Operations Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Live crisis management and resource deployment overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-white/5 rounded-lg text-xs font-medium text-zinc-300 shadow-sm">
            <Clock size={14} className="text-zinc-500" />
            {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg shadow-sm">
            <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(0,208,132,0.6)]"></div>
            <span className="text-xs font-medium text-primary-400 tracking-wide">System Optimal</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard icon={AlertTriangle} label="Active Disasters" value={stats.disasters} color="red" delay={0.1} />
        <KPICard icon={Tent} label="Relief Camps" value={stats.camps} color="purple" delay={0.15} />
        <KPICard icon={Package} label="Supplies Available" value={stats.inventory} color="slate" delay={0.2} />
        <KPICard icon={Users} label="Citizens Assisted" value={stats.citizens} color="emerald" delay={0.25} />
        <KPICard icon={UserCheck} label="Active Volunteers" value={stats.volunteers} color="yellow" delay={0.3} />
        <KPICard icon={RadioReceiver} label="Pending SOS" value={stats.sos} color="orange" delay={0.35} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Left Column: Map & Analytics */}
        <div className="xl:col-span-2 space-y-5">
          
          {/* Tactical Map */}
          <div className="glass-card flex flex-col h-[340px]">
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-bg-surface/50">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Radar size={16} className="text-primary-500" /> Deployment Map
              </h2>
              <span className="text-xs text-zinc-500 font-medium">Live Feed</span>
            </div>
            <div className="flex-1 relative z-0">
              <MapContainer center={mapCenter} zoom={7} className="h-full w-full" zoomControl={true}>
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                  attribution="&copy; OpenStreetMap &copy; CARTO" 
                />
                {mapData.map(point => (
                  <Marker key={point.id} position={[point.latitude, point.longitude]} icon={tacticalIcon}>
                    <Popup className="operational-popup">
                      <div className="text-sm font-semibold text-zinc-800">{point.name}</div>
                      <div className="text-xs text-zinc-600">Severity: {point.severity}</div>
                    </Popup>
                  </Marker>
                ))}
                {mapData.map(point => (
                  <CircleMarker key={`circle-${point.id}`} center={[point.latitude, point.longitude]} radius={30} pathOptions={{ color: point.severity === 'critical' ? '#ef4444' : '#f59e0b', fillColor: point.severity === 'critical' ? '#ef4444' : '#f59e0b', fillOpacity: 0.1, weight: 1 }} />
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="glass-card flex flex-col h-[260px]">
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-bg-surface/50">
              <h2 className="text-sm font-semibold text-zinc-200">Logistics Throughput (7 Days)</h2>
              <div className="flex items-center gap-1 text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-1 rounded">
                <Activity size={12}/> Trend Active
              </div>
            </div>
            <div className="flex-1 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.length > 0 ? chartData : [{name: 'M', value: 10}, {name: 'T', value: 25}, {name: 'W', value: 15}]}>
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', backdropFilter: 'blur(12px)' }}
                    itemStyle={{ color: 'var(--color-primary-400)', fontWeight: '600' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--color-primary-500)" strokeWidth={2} fill="url(#primaryGradient)" activeDot={{ r: 6, fill: 'var(--color-primary-500)', stroke: 'var(--color-bg-base)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Feeds, Alerts, Actions */}
        <div className="space-y-5">
          
          {/* Emergency Alerts */}
          <div className="glass-card">
            <div className="px-4 py-3 border-b border-white/5 bg-bg-surface/50 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <ShieldAlert size={16} className="text-danger-500" /> Active Alerts
              </h2>
              <span className="text-xs font-bold bg-danger-500/20 text-danger-400 border border-danger-500/20 px-2 py-0.5 rounded-full">{alerts.length}</span>
            </div>
            <div className="p-2 space-y-2">
              {alerts.length > 0 ? alerts.map(alert => (
                <div key={alert.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex gap-3 hover:bg-white/10 transition-colors">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor] ${alert.severity === 'critical' ? 'bg-danger-500 text-danger-500 animate-pulse' : 'bg-warning-500 text-warning-500'}`}></div>
                  <div>
                    <h4 className={`text-xs font-semibold ${alert.severity === 'critical' ? 'text-danger-400' : 'text-warning-400'}`}>{alert.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">{alert.desc}</p>
                  </div>
                </div>
              )) : (
                <div className="p-3 text-center text-zinc-500 text-xs">No active alerts.</div>
              )}
            </div>
          </div>

          {/* Live Operations Feed */}
          <div className="glass-card flex flex-col h-[320px]">
            <div className="px-4 py-3 border-b border-white/5 bg-bg-surface/50 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Activity size={16} className="text-primary-500" /> Live Operations Feed
              </h2>
            </div>
            <div className="flex-1 overflow-hidden relative p-4">
              <div className="absolute top-4 bottom-4 left-[27px] w-px bg-white/5"></div>
              <div className="space-y-5 overflow-y-auto h-full pr-2 pb-4 custom-scrollbar">
                <AnimatePresence>
                  {feed.map((item) => (
                    <motion.div 
                      layout
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="flex gap-4 relative z-10"
                    >
                      <div className={`p-1.5 rounded-full border h-max mt-0.5 bg-bg-surface ${item.color}`}>
                        <item.icon size={12} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300 leading-snug">{item.message}</p>
                        <p className="text-xs text-zinc-500 mt-1 font-mono">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Quick Actions & System Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Quick Actions */}
            <div className="glass-card p-4 flex flex-col gap-2">
              <h2 className="text-xs font-semibold text-zinc-500 mb-2">Quick Actions</h2>
              <button className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all text-left active:scale-[0.98]">
                <PlusSquare size={16} className="text-primary-500" /> Declare Crisis
              </button>
              <button className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all text-left active:scale-[0.98]">
                <Send size={16} className="text-accent-500" /> Dispatch Unit
              </button>
              <button className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all text-left active:scale-[0.98]">
                <UserPlus size={16} className="text-zinc-400" /> Register Citizen
              </button>
              <button className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all text-left active:scale-[0.98]">
                <Box size={16} className="text-zinc-400" /> Add Inventory
              </button>
            </div>

            {/* System Status */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-zinc-500 mb-1">System Health</h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2"><Server size={14}/> API</span>
                <span className="text-primary-500 flex items-center gap-1"><CheckCircle2 size={12}/> 21ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2"><Database size={14}/> DB Sync</span>
                <span className="text-primary-500 flex items-center gap-1"><CheckCircle2 size={12}/> Sync</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2"><ShieldCheck size={14}/> Security</span>
                <span className="text-primary-500 flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-auto pt-2 border-t border-white/5">
                <span className="text-xs text-zinc-500">Active Sessions</span>
                <span className="text-xs font-medium text-zinc-300">142</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
