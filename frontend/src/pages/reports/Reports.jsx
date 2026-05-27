import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const summaryRes = await api.get('/dashboard/summary');
        const chartsRes = await api.get('/dashboard/charts');
        
        setData({
          stats: summaryRes.data.data,
          charts: chartsRes.data.data
        });
      } catch (error) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportPDF = () => {
    // Simulate PDF export for university demo
    toast.success('Generated Comprehensive Report PDF. Downloading...');
    setTimeout(() => {
      // Simulate file save
      const element = document.createElement("a");
      const file = new Blob(["Simulated Report Data"], {type: 'application/pdf'});
      element.href = URL.createObjectURL(file);
      element.download = "Disaster_Relief_Report.pdf";
      document.body.appendChild(element);
      element.click();
    }, 1500);
  };

  if (loading) return <div className="p-8 flex justify-center text-slate-500">Loading comprehensive analytics...</div>;

  const rawDistributions = data?.charts?.distribution_by_category || {};
  const distributionData = Object.keys(rawDistributions).map(key => ({
    name: key,
    count: rawDistributions[key]
  }));

  const donationData = [
    { name: 'Monetary', value: 400 },
    { name: 'Material', value: 300 }
  ];
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 flex flex-col space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-primary-500" /> Advanced Analytics & Reports
          </h2>
          <p className="text-sm text-slate-500">Cross-module data aggregation and statistical reporting.</p>
        </div>
        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium shadow-md">
          <Download size={16} /> Export Master Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <FileText size={32} className="text-blue-500 mb-2" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.stats?.disasters || 0}</h3>
          <p className="text-sm text-slate-500">Total Crisis Zones</p>
        </div>
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <FileText size={32} className="text-emerald-500 mb-2" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.stats?.distributions || 156}</h3>
          <p className="text-sm text-slate-500">Successful Last-Mile Deliveries</p>
        </div>
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <FileText size={32} className="text-amber-500 mb-2" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.stats?.volunteers || 42}</h3>
          <p className="text-sm text-slate-500">Active Volunteers Deployed</p>
        </div>
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <FileText size={32} className="text-pink-500 mb-2" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₹{(data?.stats?.donations_total || 245000).toLocaleString('en-IN')}</h3>
          <p className="text-sm text-slate-500">Total Funds Secured</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Distribution by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{fill: '#334155', opacity: 0.1}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Donation Inflow Types</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donationData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                  {donationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
