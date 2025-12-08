import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { DataProvider } from './contexts/DataContext';

// Pages - Existing
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Bookings from './pages/Bookings';
import Jamaah from './pages/Jamaah';
import Finance from './pages/Finance';
import Agents from './pages/Agents';
import HR from './pages/HR';
import Logistics from './pages/Logistics';
import Marketing from './pages/Marketing';
import Masters from './pages/Masters';
import Settings from './pages/Settings';

// Pages - NEW FEATURES
import Savings from './pages/Savings';
import PrivateUmrah from './pages/PrivateUmrah';
import Mutawwif from './pages/Mutawwif';
import Badal from './pages/Badal';
import Manasik from './pages/Manasik';
import Support from './pages/Support';

import './index.css';

const App = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Produk */}
            <Route path="/packages" element={<Packages />} />
            <Route path="/departures" element={<Departures />} />
            <Route path="/private-umrah" element={<PrivateUmrah />} />
            <Route path="/badal" element={<Badal />} />
            
            {/* Transaksi */}
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/finance" element={<Finance />} />
            
            {/* Operasional */}
            <Route path="/jamaah" element={<Jamaah />} />
            <Route path="/mutawwif" element={<Mutawwif />} />
            <Route path="/manasik" element={<Manasik />} />
            <Route path="/logistics" element={<Logistics />} />
            
            {/* Lainnya */}
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/hr" element={<HR />} />
            <Route path="/support" element={<Support />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </DataProvider>
  );
};

// Pastikan DOM sudah siap sebelum render
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('umroh-manager-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
});