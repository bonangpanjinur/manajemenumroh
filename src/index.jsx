import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { DataProvider } from './contexts/DataContext';
import './index.css';

// Pages Import
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories'; // FIX: Import ini
import Departures from './pages/Departures';
import Bookings from './pages/Bookings';
import Finance from './pages/Finance';
import Logistics from './pages/Logistics';
import Settings from './pages/Settings';
import HR from './pages/HR';
import Marketing from './pages/Marketing';
import Agents from './pages/Agents';
import Masters from './pages/Masters';
import Accounting from './pages/Accounting';
import StorefrontSimulation from './pages/StorefrontSimulation'; // FIX: Import ini
import Tasks from './pages/Tasks'; // Optional

const App = () => {
    return (
        <HashRouter>
            <DataProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* Produk & Layanan */}
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/package-categories" element={<PackageCategories />} /> {/* Route Wajib */}
                        <Route path="/storefront" element={<StorefrontSimulation />} /> {/* Route Wajib */}

                        {/* Operasional */}
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/departures" element={<Departures />} />
                        <Route path="/logistics" element={<Logistics />} />
                        
                        {/* Transaksi */}
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/accounting" element={<Accounting />} />
                        
                        {/* Tim & Mitra */}
                        <Route path="/hr" element={<HR />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/agents" element={<Agents />} />
                        
                        {/* Sistem */}
                        <Route path="/masters" element={<Masters />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/tasks" element={<Tasks />} />
                    </Routes>
                </Layout>
            </DataProvider>
        </HashRouter>
    );
};

const container = document.getElementById('umh-admin-root');
if (container) { 
    const root = createRoot(container); 
    root.render(<App />); 
}