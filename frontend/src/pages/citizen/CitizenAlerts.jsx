import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Bell, Info, ShieldAlert, CheckCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real app, this would fetch from /notifications filtered by user
  // For the demo, we'll fetch activity logs or fake them if none exist
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        // We simulate system alerts from dashboard feeds
        const feeds = res.data.data.feeds || [];
        setAlerts(feeds.filter(log => log.type !== 'auth')); 
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'emergency': return <ShieldAlert size={20} className="text-red-400" />;
      case 'dispatch': return <Package size={20} className="text-emerald-400" />;
      case 'camp': return <Info size={20} className="text-blue-400" />;
      default: return <Bell size={20} className="text-amber-400" />;
    }
  };

  return (
    <div className="pb-10 space-y-6 relative z-10">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="text-pink-500" /> Notifications & Alerts
        </h2>
        <p className="text-sm text-slate-400">Important system updates and operational alerts in your region.</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-slate-500 p-4 text-center">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-slate-500 p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            No new alerts.
          </div>
        ) : (
          alerts.map(alert => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              key={alert.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start"
            >
              <div className="p-2 bg-slate-800 rounded-xl shrink-0 mt-1">
                {getIcon(alert.type)}
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium leading-relaxed">{alert.message}</p>
                <div className="text-xs text-slate-500 mt-2">
                  {alert.time}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CitizenAlerts;
