import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, MapPin, AlertTriangle, Activity, Map as MapIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Disasters = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', type: '', severity: 'Moderate', location: '', 
    latitude: '', longitude: '', status: 'Active', description: ''
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      // Get more data for the map/analytics on page 1, or we'd ideally have an endpoint for 'all active'
      const res = await api.get(`/disasters?page=${page}&search=${search}&per_page=100`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch disasters');
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
        name: record.name, type: record.type, severity: record.severity, 
        location: record.location, latitude: record.latitude, longitude: record.longitude, 
        status: record.status, description: record.description || ''
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        name: '', type: '', severity: 'Moderate', location: '', 
        latitude: '', longitude: '', status: 'Active', description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this disaster record?')) {
      try {
        await api.delete(`/disasters/${id}`);
        toast.success('Disaster deleted successfully');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to delete disaster');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/disasters/${currentRecord.id}`, formData);
        toast.success('Disaster updated successfully');
      } else {
        await api.post('/disasters', formData);
        toast.success('Disaster created & workflows triggered');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save disaster');
    } finally {
      setIsSaving(false);
    }
  };

  // Analytics Calculations
  const activeDisasters = useMemo(() => data.filter(d => d.status === 'Active'), [data]);
  const criticalCount = useMemo(() => activeDisasters.filter(d => d.severity === 'Critical').length, [activeDisasters]);
  const highCount = useMemo(() => activeDisasters.filter(d => d.severity === 'High').length, [activeDisasters]);

  const columns = [
    { header: 'Disaster Name', render: (row) => (
      <div>
        <div className="font-semibold text-zinc-100">{row.name}</div>
        <div className="text-[11px] text-zinc-500 uppercase tracking-wider">{row.type}</div>
      </div>
    )},
    { header: 'Location', render: (row) => (
      <div className="flex items-center gap-1.5 text-zinc-300">
        <MapPin size={14} className="text-primary-500" />
        <span>{row.location}</span>
      </div>
    )},
    { header: 'Severity', render: (row) => {
      const colors = {
        'Low': 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
        'Moderate': 'bg-warning-500/10 text-warning-400 border border-warning-500/20',
        'High': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        'Critical': 'bg-danger-500/10 text-danger-400 border border-danger-500/20 animate-pulse',
      };
      return <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded ${colors[row.severity] || colors['Moderate']}`}>{row.severity}</span>;
    }},
    { header: 'Status', render: (row) => {
      return <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded ${row.status === 'Active' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>{row.status}</span>;
    }},
    { header: 'Actions', className: 'text-right', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => handleOpenModal(row)} className="p-1.5 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => handleDelete(row.id)} className="p-1.5 text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  const actions = (
    <button onClick={() => handleOpenModal()} className="btn-primary py-2 px-4 text-xs">
      <Plus size={16} /> Declare Disaster
    </button>
  );

  return (
    <div className="h-full flex flex-col space-y-6 pb-6">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <AlertTriangle className="text-danger-500" size={24} /> Disaster Command
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Live tactical overview of critical zones and active operations.</p>
        </div>
        {actions}
      </div>

      {/* Analytics & Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Severity Stats */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Activity className="text-primary-400" size={24} /></div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400">Total Active Zones</h3>
              <p className="text-3xl font-bold text-white">{activeDisasters.length}</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4 border-l-2 border-l-danger-500">
            <div className="p-3 bg-danger-500/10 rounded-xl border border-danger-500/20"><AlertTriangle className="text-danger-500" size={24} /></div>
            <div>
              <h3 className="text-sm font-medium text-danger-400">Critical Severity</h3>
              <p className="text-3xl font-bold text-white">{criticalCount}</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4 border-l-2 border-l-warning-500">
            <div className="p-3 bg-warning-500/10 rounded-xl border border-warning-500/20"><AlertTriangle className="text-warning-500" size={24} /></div>
            <div>
              <h3 className="text-sm font-medium text-warning-400">High Severity</h3>
              <p className="text-3xl font-bold text-white">{highCount}</p>
            </div>
          </div>
        </div>

        {/* Tactical Heatmap */}
        <div className="lg:col-span-2 glass-card flex flex-col h-[300px] lg:h-auto overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-bg-surface/50 flex justify-between items-center z-10 relative">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <MapIcon size={16} className="text-primary-500" /> Live Threat Map
            </h3>
          </div>
          <div className="flex-1 relative z-0">
            <MapContainer center={[22.5937, 78.9629]} zoom={4} className="h-full w-full" zoomControl={true}>
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                attribution="&copy; OpenStreetMap &copy; CARTO" 
              />
              {activeDisasters.map(d => (
                <CircleMarker 
                  key={d.id} 
                  center={[d.latitude, d.longitude]} 
                  radius={d.severity === 'Critical' ? 25 : d.severity === 'High' ? 18 : 10} 
                  pathOptions={{ 
                    color: d.severity === 'Critical' ? '#ef4444' : d.severity === 'High' ? '#f59e0b' : '#00d084', 
                    fillColor: d.severity === 'Critical' ? '#ef4444' : d.severity === 'High' ? '#f59e0b' : '#00d084', 
                    fillOpacity: 0.2, weight: 2 
                  }}
                >
                  <Popup className="operational-popup">
                    <div className="font-bold text-zinc-800">{d.name}</div>
                    <div className="text-xs text-zinc-600 mt-1">Status: {d.severity}</div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Operational Data Table */}
      <div className="flex-1 min-h-[400px]">
        <div className="glass-card h-full">
          <DataTable 
            columns={columns} 
            data={data} 
            loading={loading} 
            pagination={pagination} 
            onPageChange={fetchData} 
            onSearch={setSearch}
            searchPlaceholder="Search operational zones..."
          />
        </div>
      </div>

      {/* Modify Modal Theme to Match Dark Premium UI */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Edit Operational Zone' : 'Declare New Disaster'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-zinc-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Disaster Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Type (e.g. Flood)</label>
              <input type="text" required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Location</label>
              <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Severity</label>
              <select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors [&>option]:bg-bg-surface">
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Latitude</label>
              <input type="number" step="any" required value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Longitude</label>
              <input type="number" step="any" required value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors [&>option]:bg-bg-surface">
                <option value="Active">Active</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"></textarea>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary py-2 px-6 flex items-center gap-2">
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {currentRecord ? 'Update Zone' : 'Declare & Trigger Workflows'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Disasters;
