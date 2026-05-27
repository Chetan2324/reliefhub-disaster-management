import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, CheckCircle, PackageCheck, AlertOctagon, ScanLine, Clock, Truck, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Distributions = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [activeToken, setActiveToken] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [citizens, setCitizens] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [disasters, setDisasters] = useState([]);

  const [formData, setFormData] = useState({
    citizen_id: '', inventory_item_id: '', disaster_id: '', quantity: '1'
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/distributions/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/distributions?page=${page}&search=${search}`);
      setData(res.data.data || res.data); // Adjust based on API pagination structure
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch distributions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [citRes, invRes, disRes] = await Promise.all([
        api.get('/citizens?per_page=100'),
        api.get('/inventory-items?per_page=100'),
        api.get('/disasters?per_page=100')
      ]);
      setCitizens(citRes.data.data || citRes.data);
      setInventory(invRes.data.data || invRes.data);
      setDisasters(disRes.data.data || disRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data');
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = () => {
    setFormData({
      citizen_id: citizens[0]?.id || '', 
      inventory_item_id: inventory[0]?.id || '', 
      disaster_id: disasters[0]?.id || '',
      quantity: '1'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post('/distributions', formData);
      toast.success('Allocation created successfully!');
      setIsModalOpen(false);
      fetchData(pagination.current_page);
      fetchStats();
      
      // Show token
      setActiveToken(res.data.distribution.token);
      setIsTokenModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate. Duplicate check failed?');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.post(`/distributions/${id}/verify`);
      toast.success('Verified successfully');
      fetchData(pagination.current_page);
      fetchStats();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Error verifying');
    }
  };

  const handleDeliver = async (id) => {
    try {
      await api.post(`/distributions/${id}/deliver`);
      toast.success('Delivered successfully');
      fetchData(pagination.current_page);
      fetchStats();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Error delivering');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>;
      case 'Verified':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1 w-fit"><ScanLine size={12} /> Verified</span>;
      case 'Delivered':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1 w-fit"><Truck size={12} /> Delivered</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 flex items-center gap-1 w-fit">{status}</span>;
    }
  };

  const columns = [
    { header: 'Beneficiary', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <PackageCheck size={18} />
        </div>
        <div>
          <div className="font-semibold">{row.citizen?.name || 'Unknown'}</div>
          <div className="text-xs text-slate-500 font-mono">{row.citizen?.aadhaar_number || row.citizen?.identity_number || 'N/A'}</div>
        </div>
      </div>
    )},
    { header: 'Material Disbursed', render: (row) => (
      <div>
        <div className="font-medium text-sm">{row.item?.item_name || 'Material'}</div>
        <div className="text-xs text-slate-500">{row.quantity} units</div>
      </div>
    )},
    { header: 'Disaster', render: (row) => (
      <div className="text-sm">{row.disaster?.name || 'N/A'}</div>
    )},
    { header: 'Token', render: (row) => (
      <div className="text-sm font-mono tracking-wider text-slate-400 flex items-center gap-2">
        <QrCode size={14} /> {row.token || 'N/A'}
      </div>
    )},
    { header: 'Status', render: (row) => getStatusBadge(row.status) },
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        {row.status === 'Pending' && (
          <button onClick={() => handleVerify(row.id)} className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition-colors text-xs font-medium">Verify Identity</button>
        )}
        {row.status === 'Verified' && (
          <button onClick={() => handleDeliver(row.id)} className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded transition-colors text-xs font-medium">Confirm Delivery</button>
        )}
        {row.status === 'Delivered' && (
          <span className="text-xs text-slate-500">{new Date(row.delivered_at).toLocaleTimeString()}</span>
        )}
      </div>
    )},
  ];

  const actions = (
    <motion.button 
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={() => handleOpenModal()} 
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-500/30"
    >
      <Plus size={16} /> New Allocation
    </motion.button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Relief Distribution System</h2>
          <p className="text-sm text-slate-500">Intelligent last-mile verification and allocation tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm">
          <div className="text-slate-500 text-sm mb-1">Total Allocations</div>
          <div className="text-2xl font-bold dark:text-white">{stats.total}</div>
        </div>
        <div className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm">
          <div className="text-slate-500 text-sm mb-1">Pending Verification</div>
          <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
        </div>
        <div className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm">
          <div className="text-slate-500 text-sm mb-1">Verified (Awaiting Delivery)</div>
          <div className="text-2xl font-bold text-blue-500">{stats.verified}</div>
        </div>
        <div className="p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm">
          <div className="text-slate-500 text-sm mb-1">Successfully Delivered</div>
          <div className="text-2xl font-bold text-emerald-500">{stats.delivered}</div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable 
          columns={columns} 
          data={data} 
          loading={loading} 
          pagination={pagination} 
          onPageChange={fetchData} 
          onSearch={setSearch}
          searchPlaceholder="Search token, citizen..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Relief Material">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-border-dark mb-4 text-sm text-slate-600 dark:text-slate-300">
            Select the beneficiary, disaster event, and material. A unique secure token will be generated for the citizen to present at the distribution center. Duplicate allocations will be blocked automatically.
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="relief-label">Disaster Event</label>
              <select required value={formData.disaster_id} onChange={(e) => setFormData({...formData, disaster_id: e.target.value})} className="relief-input">
                <option value="">Select Disaster</option>
                {disasters.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="relief-label">Beneficiary (Citizen)</label>
              <select required value={formData.citizen_id} onChange={(e) => setFormData({...formData, citizen_id: e.target.value})} className="relief-input">
                <option value="">Select Citizen</option>
                {citizens.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.aadhaar_number || c.identity_number})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="relief-label">Allocated Material</label>
                <select required value={formData.inventory_item_id} onChange={(e) => setFormData({...formData, inventory_item_id: e.target.value})} className="relief-input">
                  <option value="">Select Material</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>{i.item_name} (Stock: {i.quantity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="relief-label">Quantity</label>
                <input type="number" min="1" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="relief-input" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              <QrCode size={16} /> Generate Token
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} title="Allocation Token Generated">
        <div className="flex flex-col items-center py-8 text-center space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-lg inline-block">
            <QrCode size={120} className="text-slate-800" />
          </div>
          <div>
            <h3 className="text-2xl font-mono font-bold tracking-widest text-emerald-500">{activeToken}</h3>
            <p className="text-slate-400 mt-2 text-sm max-w-sm mx-auto">This token is unique for this beneficiary and allocation. Present it at the distribution center for verification.</p>
          </div>
          <button onClick={() => setIsTokenModalOpen(false)} className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Distributions;
