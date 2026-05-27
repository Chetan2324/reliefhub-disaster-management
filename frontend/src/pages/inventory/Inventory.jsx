import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const Inventory = () => {
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
    item_name: '', category: 'Food', quantity: '', unit: '', warehouse_id: '', expiry_date: '', status: 'Available'
  });

  const [warehouses, setWarehouses] = useState([]);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/inventory-items?page=${page}&search=${search}`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses?per_page=100'); // Fetch all for dropdown
      setWarehouses(res.data.data);
    } catch (error) {
      console.error('Failed to fetch warehouses for dropdown');
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setCurrentRecord(record);
      setFormData({
        item_name: record.item_name, category: record.category, 
        quantity: record.quantity, unit: record.unit, 
        warehouse_id: record.warehouse_id, 
        expiry_date: record.expiry_date ? record.expiry_date.substring(0, 10) : '', 
        status: record.status
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        item_name: '', category: 'Food', quantity: '', unit: '', warehouse_id: warehouses[0]?.id || '', expiry_date: '', status: 'Available'
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory-items/${id}`);
        toast.success('Item deleted successfully');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/inventory-items/${currentRecord.id}`, formData);
        toast.success('Item updated successfully');
      } else {
        await api.post('/inventory-items', formData);
        toast.success('Item added successfully');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Item Name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
          <Package size={18} />
        </div>
        <div>
          <div className="font-semibold">{row.item_name}</div>
          <div className="text-xs text-slate-500">{row.category}</div>
        </div>
      </div>
    )},
    { header: 'Quantity', render: (row) => (
      <div className="font-medium">
        {row.quantity} {row.unit}
      </div>
    )},
    { header: 'Warehouse', render: (row) => row.warehouse?.name || 'Unknown' },
    { header: 'Status', render: (row) => {
      // Check for low stock
      if (row.quantity < 50 && row.status === 'Available') {
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 flex items-center gap-1 w-fit">
            <AlertTriangle size={12} /> Low Stock
          </span>
        );
      }
      const colors = {
        'Available': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Reserved': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Depleted': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      };
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.status] || colors['Available']}`}>{row.status}</span>;
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
      <Plus size={16} /> Add Inventory
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h2>
          <p className="text-sm text-slate-500">Track relief materials across all warehouses.</p>
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
          searchPlaceholder="Search materials..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Edit Inventory Item' : 'Add Inventory Item'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="relief-label">Item Name</label>
              <input type="text" required value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="relief-input">
                <option value="Food">Food</option>
                <option value="Medicine">Medicine</option>
                <option value="Clothing">Clothing</option>
                <option value="Equipment">Equipment</option>
                <option value="Shelter">Shelter</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Quantity</label>
              <input type="number" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Unit (e.g., kg, boxes, packets)</label>
              <input type="text" required value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Warehouse</label>
              <select required value={formData.warehouse_id} onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})} className="relief-input">
                <option value="">Select Warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="relief-label">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="relief-input">
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Depleted">Depleted</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Expiry Date (Optional)</label>
              <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="relief-input" />
            </div>
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

export default Inventory;
