import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Siren, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const EmergencyRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [disasters, setDisasters] = useState([]);

  const [formData, setFormData] = useState({
    requester_name: '', contact_number: '', location: '', 
    request_type: 'Rescue', priority: 'High', status: 'Pending', 
    description: '', disaster_id: ''
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/emergency-requests?page=${page}&search=${search}`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch emergency requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisasters = async () => {
    try {
      const res = await api.get('/disasters?per_page=100');
      setDisasters(res.data.data);
    } catch (error) {
      console.error('Failed to fetch disasters');
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setCurrentRecord(record);
      setFormData({
        requester_name: record.requester_name, contact_number: record.contact_number, 
        location: record.location, request_type: record.request_type,
        priority: record.priority, status: record.status, 
        description: record.description || '', disaster_id: record.disaster_id || ''
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        requester_name: '', contact_number: '', location: '', 
        request_type: 'Rescue', priority: 'High', status: 'Pending', 
        description: '', disaster_id: disasters[0]?.id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this emergency request?')) {
      try {
        await api.delete(`/emergency-requests/${id}`);
        toast.success('Request deleted successfully');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to delete request');
      }
    }
  };

  const handleQuickResolve = async (id) => {
    const originalData = [...data];
    setData(prev => prev.map(req => req.id === id ? { ...req, status: 'Resolved' } : req));
    try {
      await api.put(`/emergency-requests/${id}`, { status: 'Resolved' });
      toast.success('Emergency marked as resolved');
    } catch (error) {
      toast.error('Failed to update status');
      setData(originalData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/emergency-requests/${currentRecord.id}`, formData);
        toast.success('Request updated successfully');
      } else {
        await api.post('/emergency-requests', formData);
        toast.success('SOS logged successfully');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save request');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Emergency', render: (row) => (
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg mt-1 ${row.priority === 'Critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
          <Siren size={18} />
        </div>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{row.request_type}</div>
          <div className="text-xs text-slate-500 max-w-[200px] truncate">{row.description}</div>
        </div>
      </div>
    )},
    { header: 'Requester Info', render: (row) => (
      <div>
        <div className="font-medium text-sm">{row.requester_name}</div>
        <div className="text-xs text-slate-500">{row.contact_number}</div>
        <div className="text-xs text-slate-500 truncate max-w-[150px]">{row.location}</div>
      </div>
    )},
    { header: 'Priority', render: (row) => {
      const colors = {
        'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Low': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      };
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[row.priority] || colors['Medium']}`}>{row.priority}</span>;
    }},
    { header: 'Status', render: (row) => {
      const colors = {
        'Pending': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      };
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.status] || colors['Pending']}`}>{row.status}</span>;
    }},
    { header: 'Actions', className: 'text-right', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        {row.status !== 'Resolved' && (
          <button onClick={() => handleQuickResolve(row.id)} title="Mark Resolved" className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
            <CheckCircle size={16} />
          </button>
        )}
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
    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
      <Plus size={16} /> Log SOS Request
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Requests</h2>
          <p className="text-sm text-slate-500">Manage and route incoming SOS signals and civilian aid requests.</p>
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
          searchPlaceholder="Search phone or name..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Update Request' : 'Log New SOS Request'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="relief-label">Requester Name</label>
              <input type="text" required value={formData.requester_name} onChange={(e) => setFormData({...formData, requester_name: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Contact Number</label>
              <input type="text" required value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} className="relief-input" />
            </div>
            <div className="md:col-span-2">
              <label className="relief-label">Location Details</label>
              <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Request Type</label>
              <select value={formData.request_type} onChange={(e) => setFormData({...formData, request_type: e.target.value})} className="relief-input">
                <option value="Rescue">Rescue / Evacuation</option>
                <option value="Medical">Medical Assistance</option>
                <option value="Food/Water">Food & Water</option>
                <option value="Shelter">Shelter Needed</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Priority Level</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="relief-input">
                <option value="Critical">Critical (Life-threatening)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Associated Disaster</label>
              <select value={formData.disaster_id} onChange={(e) => setFormData({...formData, disaster_id: e.target.value})} className="relief-input">
                <option value="">Select Disaster</option>
                {disasters.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="relief-label">Operational Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="relief-input">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="relief-label">Description / Notes</label>
            <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="relief-input"></textarea>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
              {currentRecord ? 'Update SOS' : 'Log SOS'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmergencyRequests;
