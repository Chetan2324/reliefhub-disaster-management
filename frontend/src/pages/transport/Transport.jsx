import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Truck, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const Transport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [camps, setCamps] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    dispatch_number: '', source_warehouse_id: '', destination_camp_id: '', 
    vehicle_id: '', dispatch_date: '', expected_arrival: '', status: 'Pending', notes: ''
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/dispatches?page=${page}&search=${search}`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch transport dispatches');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [wRes, cRes, vRes] = await Promise.all([
        api.get('/warehouses?per_page=100'),
        api.get('/camps?per_page=100'),
        api.get('/transport-vehicles?per_page=100')
      ]);
      setWarehouses(wRes.data.data);
      setCamps(cRes.data.data);
      setVehicles(vRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data');
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
        dispatch_number: record.dispatch_number,
        source_warehouse_id: record.source_warehouse_id, 
        destination_camp_id: record.destination_camp_id,
        vehicle_id: record.vehicle_id, 
        dispatch_date: record.dispatch_date ? record.dispatch_date.substring(0, 16) : '', 
        expected_arrival: record.expected_arrival ? record.expected_arrival.substring(0, 16) : '', 
        status: record.status, notes: record.notes || ''
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        dispatch_number: `DSP-${Math.floor(Math.random() * 10000)}`,
        source_warehouse_id: warehouses[0]?.id || '', 
        destination_camp_id: camps[0]?.id || '', 
        vehicle_id: vehicles[0]?.id || '', 
        dispatch_date: new Date().toISOString().substring(0, 16), 
        expected_arrival: '', status: 'Pending', notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dispatch record?')) {
      try {
        await api.delete(`/dispatches/${id}`);
        toast.success('Dispatch deleted successfully');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to delete dispatch');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/dispatches/${currentRecord.id}`, formData);
        toast.success('Dispatch updated successfully');
      } else {
        await api.post('/dispatches', formData);
        toast.success('Dispatch created successfully');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save dispatch');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Dispatch ID', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
          <Truck size={18} />
        </div>
        <div className="font-bold font-mono">{row.dispatch_number}</div>
      </div>
    )},
    { header: 'Route', render: (row) => (
      <div className="flex items-center gap-2 text-sm">
        <span className="truncate max-w-[120px]" title={row.warehouse?.name}>{row.warehouse?.name || 'Warehouse'}</span>
        <ArrowRight size={14} className="text-slate-400 shrink-0" />
        <span className="truncate max-w-[120px]" title={row.camp?.name}>{row.camp?.name || 'Camp'}</span>
      </div>
    )},
    { header: 'Vehicle/Driver', render: (row) => (
      <div>
        <div className="font-medium">{row.vehicle?.registration_number || 'Unassigned'}</div>
        <div className="text-xs text-slate-500">{row.vehicle?.driver_name || ''}</div>
      </div>
    )},
    { header: 'Schedule', render: (row) => (
      <div className="text-xs">
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Calendar size={12}/> Dep: {new Date(row.dispatch_date).toLocaleDateString()}</div>
      </div>
    )},
    { header: 'Status', render: (row) => {
      const colors = {
        'Pending': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        'In Transit': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Delayed': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      };
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.status] || colors['Pending']}`}>{row.status}</span>;
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
      <Plus size={16} /> New Dispatch
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Logistics & Transportation</h2>
          <p className="text-sm text-slate-500">Track shipments from warehouses to relief camps.</p>
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
          searchPlaceholder="Search dispatch ID..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Update Dispatch' : 'Create Dispatch'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="relief-label">Dispatch Number</label>
              <input type="text" readOnly value={formData.dispatch_number} className="w-full px-3 py-2 border border-slate-300 dark:border-border-dark rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="relief-label">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="relief-input">
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Source Warehouse</label>
              <select required value={formData.source_warehouse_id} onChange={(e) => setFormData({...formData, source_warehouse_id: e.target.value})} className="relief-input">
                <option value="">Select Origin</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="relief-label">Destination Camp</label>
              <select required value={formData.destination_camp_id} onChange={(e) => setFormData({...formData, destination_camp_id: e.target.value})} className="relief-input">
                <option value="">Select Destination</option>
                {camps.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="relief-label">Assigned Vehicle</label>
              <select required value={formData.vehicle_id} onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})} className="relief-input">
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registration_number} - {v.type} ({v.driver_name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="relief-label">Dispatch Date/Time</label>
              <input type="datetime-local" required value={formData.dispatch_date} onChange={(e) => setFormData({...formData, dispatch_date: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Expected Arrival</label>
              <input type="datetime-local" value={formData.expected_arrival} onChange={(e) => setFormData({...formData, expected_arrival: e.target.value})} className="relief-input" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {currentRecord ? 'Update' : 'Dispatch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transport;
