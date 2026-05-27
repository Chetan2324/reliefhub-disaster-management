import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, UserCheck, Stethoscope, Hammer, HeartHandshake, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Volunteers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [camps, setCamps] = useState([]);

  const [formData, setFormData] = useState({
    name: '', contact_number: '', skills: 'General Logistics', 
    availability_status: 'Available', assigned_camp_id: ''
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/volunteers?page=${page}&search=${search}`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch volunteers');
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
        name: record.name, contact_number: record.contact_number, 
        skills: record.skills, availability_status: record.availability_status, 
        assigned_camp_id: record.assigned_camp_id || ''
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        name: '', contact_number: '', skills: 'General Logistics', 
        availability_status: 'Available', assigned_camp_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this volunteer?')) {
      try {
        await api.delete(`/volunteers/${id}`);
        toast.success('Volunteer removed');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to remove volunteer');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/volunteers/${currentRecord.id}`, formData);
        toast.success('Volunteer updated');
      } else {
        await api.post('/volunteers', formData);
        toast.success('Volunteer added');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save volunteer');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSkillIcon = (skills) => {
    if (skills.includes('Medical') || skills.includes('First Aid')) return <Stethoscope size={14} className="text-rose-500" />;
    if (skills.includes('Construction') || skills.includes('Engineering')) return <Hammer size={14} className="text-amber-500" />;
    return <HeartHandshake size={14} className="text-blue-500" />;
  };

  const columns = [
    { header: 'Volunteer Name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
          <UserCheck size={18} />
        </div>
        <div>
          <div className="font-semibold">{row.name}</div>
          <div className="text-xs text-slate-500">{row.contact_number}</div>
        </div>
      </div>
    )},
    { header: 'Skillset / Tags', render: (row) => (
      <div className="flex items-center gap-1.5 font-medium text-sm">
        {renderSkillIcon(row.skills)} {row.skills}
      </div>
    )},
    { header: 'Current Assignment', render: (row) => (
      <div className="text-sm">
        {row.camp ? (
          <span className="font-medium text-slate-700 dark:text-slate-300">{row.camp.name}</span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        )}
      </div>
    )},
    { header: 'Status', render: (row) => {
      const colors = {
        'Available': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Deployed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'On Leave': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
      };
      return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.availability_status] || colors['Available']}`}>{row.availability_status}</span>;
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
      <Plus size={16} /> Add Volunteer
    </button>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Volunteer Roster</h2>
          <p className="text-sm text-slate-500">Manage personnel, skills, and camp deployments.</p>
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
          searchPlaceholder="Search volunteers..."
          actions={actions}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Edit Volunteer' : 'Add Volunteer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="relief-label">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Contact Number</label>
              <input type="text" required value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} className="relief-input" />
            </div>
            <div>
              <label className="relief-label">Skill Category</label>
              <select value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="relief-input">
                <option value="General Logistics">General Logistics</option>
                <option value="Medical Staff">Medical Staff / First Aid</option>
                <option value="Search & Rescue">Search & Rescue</option>
                <option value="Construction">Construction / Engineering</option>
                <option value="Translation">Translation / Social Support</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Availability</label>
              <select value={formData.availability_status} onChange={(e) => setFormData({...formData, availability_status: e.target.value})} className="relief-input">
                <option value="Available">Available</option>
                <option value="Deployed">Deployed</option>
                <option value="On Leave">On Leave / Off Duty</option>
              </select>
            </div>
            <div>
              <label className="relief-label">Camp Assignment (Optional)</label>
              <select value={formData.assigned_camp_id} onChange={(e) => setFormData({...formData, assigned_camp_id: e.target.value})} className="relief-input">
                <option value="">No Assignment</option>
                {camps.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
              {currentRecord ? 'Update' : 'Add Volunteer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Volunteers;
