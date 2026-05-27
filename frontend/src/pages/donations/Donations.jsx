import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Heart, DollarSign, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const Donations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    donor_name: '', donor_contact: '', donation_type: 'Monetary', 
    amount: '', item_description: '', transaction_reference: ''
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/donations?page=${page}&search=${search}`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenModal = () => {
    setFormData({
      donor_name: '', donor_contact: '', donation_type: 'Monetary', 
      amount: '', item_description: '', transaction_reference: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/donations', formData);
      toast.success('Donation recorded successfully!');
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record donation');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Donor Information', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
          <Heart size={18} />
        </div>
        <div>
          <div className="font-semibold">{row.donor_name}</div>
          <div className="text-xs text-slate-500">{row.donor_contact || 'Anonymous'}</div>
        </div>
      </div>
    )},
    { header: 'Type', render: (row) => (
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {row.donation_type === 'Monetary' ? <DollarSign size={14} className="text-emerald-500" /> : <Package size={14} className="text-amber-500" />}
        {row.donation_type}
      </div>
    )},
    { header: 'Value / Description', render: (row) => (
      <div>
        {row.donation_type === 'Monetary' ? (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{parseFloat(row.amount).toLocaleString('en-IN')}</span>
        ) : (
          <span className="text-sm">{row.item_description}</span>
        )}
      </div>
    )},
    { header: 'Reference', render: (row) => (
      <div className="text-xs font-mono text-slate-500">{row.transaction_reference || 'N/A'}</div>
    )},
    { header: 'Date', render: (row) => (
      <div className="text-xs text-slate-500">{new Date(row.created_at).toLocaleDateString()}</div>
    )}
  ];

  const actions = (
    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-sm font-medium">
      <Plus size={16} /> Record Donation
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Donations Ledger</h2>
          <p className="text-sm text-slate-500">Track and transparently manage incoming financial and material relief contributions.</p>
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
          searchPlaceholder="Search donor name or reference..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Donation">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="relief-label">Donor Name (or Anonymous)</label>
              <input type="text" required value={formData.donor_name} onChange={(e) => setFormData({...formData, donor_name: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Contact Info (Optional)</label>
              <input type="text" value={formData.donor_contact} onChange={(e) => setFormData({...formData, donor_contact: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Donation Type</label>
              <select required value={formData.donation_type} onChange={(e) => setFormData({...formData, donation_type: e.target.value, amount: '', item_description: ''})} className="relief-input">
                <option value="Monetary">Financial / Monetary</option>
                <option value="Material">Material / Physical Goods</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Transaction Ref / Receipt No</label>
              <input type="text" value={formData.transaction_reference} onChange={(e) => setFormData({...formData, transaction_reference: e.target.value})} className="relief-input" placeholder="TXN-12345" />
            </div>
            {formData.donation_type === 'Monetary' ? (
              <div className="md:col-span-2">
                <label className="relief-label">Amount (₹)</label>
                <input type="number" min="1" step="any" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="relief-input" placeholder="0.00" />
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="relief-label">Material Description</label>
                <textarea required rows="2" value={formData.item_description} onChange={(e) => setFormData({...formData, item_description: e.target.value})} className="relief-input" placeholder="E.g., 50x Blankets, 100kg Rice"></textarea>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors disabled:opacity-50">
              Record Donation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Donations;
