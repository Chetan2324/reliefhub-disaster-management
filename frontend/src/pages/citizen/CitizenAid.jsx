import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Package, Truck, QrCode, ScanLine, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/ui/Modal';

const CitizenAid = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/distributions?my_allocations=1');
      setAllocations(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Verified': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Delivered': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock size={20} />;
      case 'Verified': return <ScanLine size={20} />;
      case 'Delivered': return <Truck size={20} />;
      default: return <Package size={20} />;
    }
  };

  return (
    <div className="pb-10 space-y-6 relative z-10">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="text-cyan-400" /> Aid Tracking
        </h2>
        <p className="text-sm text-slate-400">Track your allocated relief materials and access your secure tokens.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-slate-500 p-4 text-center">Loading allocations...</div>
        ) : allocations.length === 0 ? (
          <div className="text-slate-500 p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            No materials allocated to you yet. If you are in need, please submit an SOS request.
          </div>
        ) : (
          allocations.map(alloc => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={alloc.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{alloc.item?.item_name}</h3>
                  <div className="text-xs text-slate-400 mt-1">Quantity: {alloc.quantity} units</div>
                  {alloc.camp && <div className="text-xs text-emerald-400 mt-1 font-medium">Camp: {alloc.camp.name}</div>}
                  {alloc.disaster && <div className="text-xs text-slate-500 mt-1">Event: {alloc.disaster.name}</div>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(alloc.status)}`}>
                  {getStatusIcon(alloc.status)} {alloc.status}
                </span>
              </div>
              
              {/* Token Section */}
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Secure Collection Token</div>
                  <div className="font-mono text-xl text-cyan-400 tracking-wider">{alloc.token || 'N/A'}</div>
                </div>
                {alloc.status !== 'Delivered' && (
                  <button 
                    onClick={() => setSelectedToken(alloc.token)}
                    className="p-3 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-900/50 transition-colors"
                  >
                    <QrCode size={24} />
                  </button>
                )}
              </div>
              
              {/* Timeline */}
              <div className="mt-5 border-t border-slate-800 pt-4 flex gap-4 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-500">Allocated</span>
                  <span className="text-slate-300">{new Date(alloc.created_at).toLocaleString()}</span>
                </div>
                {alloc.verified_at && (
                  <div className="flex flex-col border-l border-slate-800 pl-4">
                    <span className="text-slate-500">Verified</span>
                    <span className="text-slate-300">{new Date(alloc.verified_at).toLocaleString()}</span>
                  </div>
                )}
                {alloc.delivered_at && (
                  <div className="flex flex-col border-l border-slate-800 pl-4">
                    <span className="text-slate-500">Delivered</span>
                    <span className="text-emerald-400 font-medium">{new Date(alloc.delivered_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal isOpen={!!selectedToken} onClose={() => setSelectedToken(null)} title="Collection Token">
        <div className="flex flex-col items-center py-8 text-center space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-lg inline-block">
            <QrCode size={160} className="text-slate-900" />
          </div>
          <div>
            <h3 className="text-3xl font-mono font-bold tracking-widest text-cyan-500 mt-4">{selectedToken}</h3>
            <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">Present this QR code or token number to the field agent at the relief camp to claim your materials.</p>
          </div>
          <button onClick={() => setSelectedToken(null)} className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors">
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CitizenAid;
