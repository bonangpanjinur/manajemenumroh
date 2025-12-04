import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Components
import Layout from './components/Layout';
import GlobalErrorAlert from './components/GlobalErrorAlert';
import DataProvider from './contexts/DataContext';

// Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Bookings from './pages/Bookings';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import PackageCategories from './pages/PackageCategories';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import HR from './pages/HR';
import Agents from './pages/Agents';
import Logistics from './pages/Logistics';
import Masters from './pages/Masters';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import AttendanceScanner from './pages/AttendanceScanner';

import './index.css';

const App = () => {
  return (
    <DataProvider>
      <HashRouter>
        <GlobalErrorAlert />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Produk & Layanan */}
            <Route path="packages" element={<Packages />} />
            <Route path="departures" element={<Departures />} />
            <Route path="package-categories" element={<PackageCategories />} />
            <Route path="bookings" element={<Bookings />} />

            {/* Operasional */}
            <Route path="jamaah" element={<Jamaah />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="tasks" element={<Tasks />} />
            
            {/* Keuangan & Marketing */}
            <Route path="finance" element={<Finance />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="agents" element={<Agents />} />
            
            {/* SDM */}
            <Route path="hr" element={<HR />} />
            <Route path="attendance-scan" element={<AttendanceScanner />} />
            
            {/* System & Settings */}
            <Route path="masters" element={<Masters />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="settings" element={<Settings />} />
            
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
};

const container = document.getElementById('umroh-manager-app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}