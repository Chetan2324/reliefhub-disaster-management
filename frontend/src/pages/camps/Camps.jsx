import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosConfig';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Tent, MapPin, Users, Activity, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Camps = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [disasters, setDisasters] = useState([]);

  const [formData, setFormData] = useState({
    name: '', location: '', latitude: '', longitude: '', capacity: '', current_occupancy: '0', 
    disaster_id: '', facility_type: 'Relief Camp', is_active: true
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/camps?page=${page}&search=${search}&per_page=100`);
      setData(res.data.data);
      setPagination(res.data.meta || {});
    } catch (error) {
      toast.error('Failed to fetch camps');
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
        name: record.name, location: record.location, 
        latitude: record.latitude || '', longitude: record.longitude || '',
        capacity: record.capacity, current_occupancy: record.current_occupancy,
        disaster_id: record.disaster_id, facility_type: record.facility_type || 'Relief Camp',
        is_active: record.is_active
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        name: '', location: '', latitude: '', longitude: '', capacity: '', current_occupancy: '0', 
        disaster_id: disasters[0]?.id || '', facility_type: 'Relief Camp', is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this camp?')) {
      try {
        await api.delete(`/camps/${id}`);
        toast.success('Camp deactivated successfully');
        fetchData(pagination.current_page);
      } catch (error) {
        toast.error('Failed to deactivate camp');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentRecord) {
        await api.put(`/camps/${currentRecord.id}`, formData);
        toast.success('Camp logistics updated successfully');
      } else {
        await api.post('/camps', formData);
        toast.success('Camp established in operational network');
      }
      setIsModalOpen(false);
      fetchData(pagination.current_page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save camp');
    } finally {
      setIsSaving(false);
    }
  };

  // Analytics Metrics
  const activeCamps = useMemo(() => data.filter(c => c.is_active), [data]);
  const totalCapacity = useMemo(() => activeCamps.reduce((sum, c) => sum + parseInt(c.capacity || 0), 0), [activeCamps]);
  const totalOccupancy = useMemo(() => activeCamps.reduce((sum, c) => sum + parseInt(c.current_occupancy || 0), 0), [activeCamps]);
  const overloadedCamps = useMemo(() => activeCamps.filter(c => (c.current_occupancy / c.capacity) >= 0.9), [activeCamps]);
  
  const occupancyRate = totalCapacity > 0 ? ((totalOccupancy / totalCapacity) * 100).toFixed(1) : 0;

  const columns = [
    { header: 'Camp Node', render: (row) => (
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${row.is_active ? 'bg-primary-500/10 border-primary-500/20 text-primary-400' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
          <Tent size={18} />
        </div>
        <div>
          <div className="font-semibold text-zinc-100">{row.name}</div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 uppercase tracking-wider"><MapPin size={10} /> {row.location}</div>
        </div>
      </div>
    )},
    { header: 'Disaster Link', render: (row) => (
      <div className="text-zinc-300 text-sm">{row.disaster?.name || 'Unknown'}</div>
    )},
    { header: 'Capacity Status', render: (row) => {
      const percentage = (row.current_occupancy / row.capacity) * 100;
      let barColor = 'bg-primary-500';
      if (percentage > 90) barColor = 'bg-danger-500 shadow-[0_0_8px_var(--color-danger-500)]';
      else if (percentage > 70) barColor = 'bg-warning-500';
      
      return (
        <div className="w-full max-w-[180px]">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <span className={percentage > 90 ? 'text-danger-400' : 'text-zinc-300'}><Users size={12} className="inline mr-1"/> {row.current_occupancy}</span>
            <span className="text-zinc-600">Max: {row.capacity}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/10">
            <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
          </div>
        </div>
      );
    }},
    { header: 'Network Status', render: (row) => (
      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded ${row.is_active ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-danger-500/10 text-danger-400 border border-danger-500/20'}`}>
        {row.is_active ? 'Online' : 'Offline'}
      </span>
    )},
    { header: 'Actions', className: 'text-right', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => handleOpenModal(row)} className="p-1.5 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
          <Edit2 size={16} />
        </button>
      </div>
    )}
  ];

  const actions = (
    <button onClick={() => handleOpenModal()} className="btn-primary py-2 px-4 text-xs">
      <Plus size={16} /> Establish Node
    </button>
  );

  return (
    <div className="h-full flex flex-col space-y-6 pb-6">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Tent className="text-primary-500" size={24} /> Relief Logistics Hub
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Real-time management of shelter capacities and displaced populations.</p>
        </div>
        {actions}
      </div>

      {/* Analytics & Map Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Logistics Stats */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5 flex flex-col justify-center h-full gap-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><Users size={120} /></div>
            <h3 className="text-sm font-medium text-zinc-400">Total Displaced Citizens Sheltered</h3>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-white">{totalOccupancy}</p>
              <p className="text-sm text-primary-400 mb-1 font-medium bg-primary-500/10 px-2 py-0.5 rounded-full">/ {totalCapacity} Cap</p>
            </div>
            <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-primary-500 h-1 rounded-full" style={{width: `${occupancyRate}%`}}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-zinc-400 mb-2 text-xs font-semibold uppercase tracking-wider">
                <Activity size={14} className="text-primary-400"/> Network Load
              </div>
              <p className="text-2xl font-bold text-white">{occupancyRate}%</p>
            </div>
            
            <div className={`glass-card p-4 border-l-2 ${overloadedCamps.length > 0 ? 'border-l-danger-500' : 'border-l-primary-500'}`}>
              <div className={`flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider ${overloadedCamps.length > 0 ? 'text-danger-400' : 'text-zinc-400'}`}>
                {overloadedCamps.length > 0 ? <AlertCircle size={14} /> : <ShieldAlert size={14} className="text-primary-400"/>} 
                Overloads
              </div>
              <p className="text-2xl font-bold text-white">{overloadedCamps.length}</p>
            </div>
          </div>
        </div>

        {/* Camp Location Map */}
        <div className="xl:col-span-2 glass-card flex flex-col h-[300px] xl:h-auto overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-bg-surface/50 flex justify-between items-center z-10 relative">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <MapPin size={16} className="text-primary-500" /> Active Shelter Network
            </h3>
            <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">LIVE DATA</span>
          </div>
          <div className="flex-1 relative z-0">
            <MapContainer center={[22.5937, 78.9629]} zoom={4} className="h-full w-full" zoomControl={true}>
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                attribution="&copy; OpenStreetMap &copy; CARTO" 
              />
              {activeCamps.map(c => {
                // Ignore camps with no location data in mock
                if (!c.latitude || !c.longitude) return null;
                const occPercent = c.current_occupancy / c.capacity;
                const isOverloaded = occPercent >= 0.9;
                return (
                  <CircleMarker 
                    key={c.id} 
                    center={[c.latitude, c.longitude]} 
                    radius={isOverloaded ? 15 : 10} 
                    pathOptions={{ 
                      color: isOverloaded ? '#ef4444' : '#00d084', 
                      fillColor: isOverloaded ? '#ef4444' : '#00d084', 
                      fillOpacity: 0.3, weight: 2 
                    }}
                  >
                    <Popup className="operational-popup">
                      <div className="font-bold text-zinc-800">{c.name}</div>
                      <div className="text-xs text-zinc-600 mt-1">Cap: {c.current_occupancy}/{c.capacity}</div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Logistics Data Table */}
      <div className="flex-1 min-h-[400px]">
        <div className="glass-card h-full">
          <DataTable 
            columns={columns} 
            data={data} 
            loading={loading} 
            pagination={pagination} 
            onPageChange={fetchData} 
            onSearch={setSearch}
            searchPlaceholder="Search operational camps..."
          />
        </div>
      </div>

      {/* Dark Theme Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRecord ? 'Update Node Logistics' : 'Establish New Relief Node'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-zinc-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Camp Identifier</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Associated Disaster Zone</label>
              <select required value={formData.disaster_id} onChange={(e) => setFormData({...formData, disaster_id: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors [&>option]:bg-bg-surface">
                <option value="">Select Disaster Link</option>
                {disasters.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Geographic Location Description</label>
              <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
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
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Maximum Capacity (Persons)</label>
              <input type="number" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Live Occupancy</label>
              <input type="number" required value={formData.current_occupancy} onChange={(e) => setFormData({...formData, current_occupancy: e.target.value})} className="w-full px-3 py-2 border border-white/10 rounded-lg bg-bg-base/50 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
            <div className="flex items-center mt-4 bg-white/5 p-3 rounded-lg border border-white/10">
              <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="h-4 w-4 text-primary-500 bg-bg-base border-white/20 rounded focus:ring-primary-500 focus:ring-offset-bg-base" />
              <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-white">
                Node is Currently Operational
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary py-2 px-6 flex items-center gap-2">
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {currentRecord ? 'Sync Logistics' : 'Establish Node'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Camps;
