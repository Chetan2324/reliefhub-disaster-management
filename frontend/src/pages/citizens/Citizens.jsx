import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Users, HeartPulse, ShieldAlert, Fingerprint } from 'lucide-react';
import { toast } from 'react-toastify';

const Citizens = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [camps, setCamps] = useState([]);

  const [formData, setFormData] = useState({
    name: '', identity_number: '', family_members_count: '1', 
    vulnerability_status: 'None', current_camp_id: '', contact_info: ''
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/citizens?page=${page}&search=${search}`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch citizens');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const res = await api.get('/camps?per_page=100');
      setCamps(res.data.data);
    } catch (error) {
      console.error('Failed to fetch camps');
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setCurrentRecord(record);
      setFormData({
        name: record.name, identity_number: record.identity_number || '', 
        family_members_count: record.family_members_count,
        vulnerability_status: record.vulnerability_status || 'None', 
        current_camp_id: record.current_camp_id || '', contact_info: record.contact_info || ''
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        name: '', identity_number: `AADH-${Math.floor(Math.random() * 900000) + 100000}`, 
        family_members_count: '1', vulnerability_status: 'None', 
        current_camp_id: camps[0]?.id || '', contact_info: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this citizen record?')) {
      try {
        await api.delete(`/citizens/${id}`);
        toast.success('Record deleted successfully');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to delete record');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/citizens/${currentRecord.id}`, formData);
        toast.success('Citizen updated successfully');
      } else {
        await api.post('/citizens', formData);
        toast.success('Citizen registered successfully');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save record');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Citizen Info', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <Users size={18} />
        </div>
        <div>
          <div className="font-semibold">{row.name}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1"><Fingerprint size={10} /> {row.identity_number || 'No ID'}</div>
        </div>
      </div>
    )},
    { header: 'Family Size', render: (row) => (
      <div className="font-medium">{row.family_members_count} Members</div>
    )},
    { header: 'Current Camp', render: (row) => (
      <div className="text-sm">{row.camp?.name || 'Not in Camp'}</div>
    )},
    { header: 'Vulnerability', render: (row) => {
      if (row.vulnerability_status && row.vulnerability_status !== 'None') {
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1 w-fit">
            <HeartPulse size={12} /> {row.vulnerability_status}
          </span>
        );
      }
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">None</span>;
    }},
    { header: 'Actions', className: 'text-right', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => handleOpenModal(row)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
          <Edit2 size={16} />
        </button>
        <button onClick={() => handleDelete(row.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  const actions = (
    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium">
      <Plus size={16} /> Register Citizen
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Citizen Registry</h2>
          <p className="text-sm text-slate-500">Manage displaced persons and track family relief needs.</p>
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
          searchPlaceholder="Search by name or ID..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Edit Citizen Record' : 'Register New Citizen'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="relief-label">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Identity/Aadhaar (Simulated)</label>
              <input type="text" value={formData.identity_number} onChange={(e) => setFormData({...formData, identity_number: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Family Members Count</label>
              <input type="number" min="1" required value={formData.family_members_count} onChange={(e) => setFormData({...formData, family_members_count: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Vulnerability Flags</label>
              <select value={formData.vulnerability_status} onChange={(e) => setFormData({...formData, vulnerability_status: e.target.value})} className="relief-input">
                <option value="None">None</option>
                <option value="Elderly">Elderly</option>
                <option value="Children">Children/Infants</option>
                <option value="Medical">Medical Needs</option>
                <option value="Pregnant">Pregnant</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="relief-label">Current Relief Camp Location</label>
              <select required value={formData.current_camp_id} onChange={(e) => setFormData({...formData, current_camp_id: e.target.value})} className="relief-input">
                <option value="">Select Camp</option>
                {camps.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="relief-label">Contact Info / Last Known Address</label>
              <input type="text" value={formData.contact_info} onChange={(e) => setFormData({...formData, contact_info: e.target.value})} className="relief-input" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {currentRecord ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Citizens;
