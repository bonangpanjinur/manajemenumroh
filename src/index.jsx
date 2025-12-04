import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Bookings from './pages/Bookings';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import HR from './pages/HR';
import Agents from './pages/Agents';
import Logistics from './pages/Logistics';
import AttendanceScanner from './pages/AttendanceScanner'; // Import halaman baru
import './index.css';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jamaah" element={<Jamaah />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="finance" element={<Finance />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="hr" element={<HR />} />
          <Route path="agents" element={<Agents />} />
          <Route path="logistics" element={<Logistics />} />
          
          {/* Route Baru untuk Scanner */}
          <Route path="attendance-scan" element={<AttendanceScanner />} />
          
        </Route>
      </Routes>
    </HashRouter>
  );
};

const container = document.getElementById('umroh-manager-app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}