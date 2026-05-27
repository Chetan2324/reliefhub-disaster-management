import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, MapPin, Box, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Warehouses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '', location: '', capacity: '', is_active: true
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/warehouses?page=${page}&search=${search}`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setCurrentRecord(record);
      setFormData({
        name: record.name, location: record.location, 
        capacity: record.capacity, is_active: record.is_active
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        name: '', location: '', capacity: '', is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await api.delete(`/warehouses/${id}`);
        toast.success('Warehouse deleted successfully');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to delete warehouse');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/warehouses/${currentRecord.id}`, formData);
        toast.success('Warehouse updated successfully');
      } else {
        await api.post('/warehouses', formData);
        toast.success('Warehouse added successfully');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save warehouse');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Warehouse Name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <Box size={18} />
        </div>
        <div className="font-semibold">{row.name}</div>
      </div>
    )},
    { header: 'Location', render: (row) => (
      <div className="flex items-center gap-1">
        <MapPin size={14} className="text-slate-400" />
        <span>{row.location}</span>
      </div>
    )},
    { header: 'Capacity Limit', accessor: 'capacity' },
    { header: 'Status', render: (row) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
        {row.is_active ? 'Operational' : 'Closed'}
      </span>
    )},
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
      <Plus size={16} /> Register Warehouse
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouse Network</h2>
          <p className="text-sm text-slate-500">Manage supply depots and their capacities.</p>
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
          searchPlaceholder="Search warehouses..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Edit Warehouse' : 'Register New Warehouse'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="relief-label">Warehouse Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="relief-input" />
          </div>
          <div>
            <label className="relief-label">Location</label>
            <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="relief-input" />
          </div>
          <div>
            <label className="relief-label">Capacity</label>
            <input type="number" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="relief-input" />
          </div>
          <div className="flex items-center mt-4">
            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="relief-checkbox" />
            <label htmlFor="is_active" className="ml-2 block text-sm font-bold tracking-wide text-slate-300 uppercase">
              Warehouse is currently operational
            </label>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {currentRecord ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;
