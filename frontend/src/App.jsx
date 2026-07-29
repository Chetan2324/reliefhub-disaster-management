import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Disasters from './pages/disasters/Disasters';
import Warehouses from './pages/warehouses/Warehouses';
import Inventory from './pages/inventory/Inventory';
import Camps from './pages/camps/Camps';
import Transport from './pages/transport/Transport';
import EmergencyRequests from './pages/emergency-requests/EmergencyRequests';
import Citizens from './pages/citizens/Citizens';
import Distributions from './pages/distributions/Distributions';
import Volunteers from './pages/volunteers/Volunteers';
import Donations from './pages/donations/Donations';
import Reports from './pages/reports/Reports';

// Citizen Portal
import CitizenLayout from './components/layout/CitizenLayout';
import CitizenHome from './pages/citizen/CitizenHome';
import CitizenSOS from './pages/citizen/CitizenSOS';
import CitizenAid from './pages/citizen/CitizenAid';
import CitizenCamp from './pages/citizen/CitizenCamp';
import CitizenAlerts from './pages/citizen/CitizenAlerts';

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/disasters" element={<Disasters />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/camps" element={<Camps />} />
              <Route path="/emergency-requests" element={<EmergencyRequests />} />
              <Route path="/citizens" element={<Citizens />} />
              <Route path="/distributions" element={<Distributions />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            {/* Citizen Portal Routes */}
            <Route element={<CitizenLayout />}>
              <Route path="/portal/home" element={<CitizenHome />} />
              <Route path="/portal/sos" element={<CitizenSOS />} />
              <Route path="/portal/aid" element={<CitizenAid />} />
              <Route path="/portal/camp" element={<CitizenCamp />} />
              <Route path="/portal/notifications" element={<CitizenAlerts />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer position="top-right" theme="colored" />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
