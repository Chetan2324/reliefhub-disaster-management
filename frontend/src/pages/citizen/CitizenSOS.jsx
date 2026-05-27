import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ShieldAlert, Plus, CheckCircle, Clock, Navigation } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Modal from '../../components/ui/Modal';

const CitizenSOS = () => {
  const { user } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    requester_name: user?.name || '',
    phone: '',
    location: '',
    latitude: '26.1445', // Defaulting for demo
    longitude: '91.7362',
    request_details: '',
    request_type: 'Medical',
    priority: 'High'
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/emergency-requests?my_requests=1');
      setRequests(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/emergency-requests', formData);
      toast.success('SOS Request sent successfully. Help is on the way.');
      setIsModalOpen(false);
      fetchRequests();
      setFormData({ ...formData, request_details: '' });
    } catch (error) {
      toast.error('Failed to send SOS request.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'In Progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Resolved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="pb-10 space-y-6 relative z-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Emergency SOS
          </h2>
          <p className="text-sm text-slate-400">Request immediate medical, evacuation, or shelter assistance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-900/50 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-slate-500 p-4 text-center">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-slate-500 p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            No active SOS requests. Stay safe!
          </div>
        ) : (
          requests.map(req => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={req.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-center">
                  <div className={`p-2 rounded-full border ${getStatusColor(req.status)}`}>
                    {req.status === 'Resolved' ? <CheckCircle size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{req.request_type} Assistance</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Navigation size={12} /> {req.location}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>
              
              <div className="mt-4 p-3 bg-slate-950 rounded-xl text-sm text-slate-300 border border-slate-800/50">
                {req.request_details}
              </div>
              
              <div className="mt-3 text-xs text-slate-500">
                Requested on {new Date(req.created_at).toLocaleString()}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Send Emergency SOS">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm text-red-200 mb-4">
            Only use this for genuine emergencies. Abuse of the SOS system may delay help for those in critical need.
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="relief-label">Phone Number</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Emergency Type</label>
              <select value={formData.request_type} onChange={e => setFormData({...formData, request_type: e.target.value})} className="relief-input">
                <option value="Medical">Medical Emergency</option>
                <option value="Evacuation">Trapped / Evacuation</option>
                <option value="Shelter">Immediate Shelter Needed</option>
                <option value="Food/Water">Critical Food/Water</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="relief-label">Your Location (Address/Landmark)</label>
            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="relief-input" placeholder="E.g., Near Main Market, Sector 4" />
          </div>

          <div>
            <label className="relief-label">Describe Situation</label>
            <textarea required rows="3" value={formData.request_details} onChange={e => setFormData({...formData, request_details: e.target.value})} className="relief-input" placeholder="Number of people, injuries, water level, etc."></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-colors flex items-center gap-2">
              <ShieldAlert size={16} /> Submit SOS
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CitizenSOS;
