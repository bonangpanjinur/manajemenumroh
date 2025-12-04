import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DataProvider from './contexts/DataContext';
import './index.css';

// Import Halaman (Pages)
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Bookings from './pages/Bookings'; // New
import Finance from './pages/Finance';   // Updated
import Logistics from './pages/Logistics'; // Updated
import Marketing from './pages/Marketing'; // Updated
import HR from './pages/HR';             // Updated
import Agents from './pages/Agents';     // Updated
import Masters from './pages/Masters';   // New (Gabungan Hotel/Flight/Loc)
import PackageCategories from './pages/PackageCategories'; // Updated
import Users from './pages/Users';       // New
import Roles from './pages/Roles';       // New
import Settings from './pages/Settings'; 
import Tasks from './pages/Tasks';       // New

// Note: Halaman lama (Flights, Hotels, Categories, Trash) sudah TIDAK DIPAKAI.

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <div className="antialiased text-gray-800 bg-gray-50 min-h-screen">
                    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                    
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* Produk & Layanan */}
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/departures" element={<Departures />} />
                        <Route path="/package-categories" element={<PackageCategories />} />
                        
                        {/* Transaksi */}
                        <Route path="/bookings" element={<Bookings />} />
                        
                        {/* Operasional */}
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/tasks" element={<Tasks />} />
                        
                        {/* Back Office */}
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/hr" element={<HR />} />
                        <Route path="/agents" element={<Agents />} />
                        
                        {/* Sistem & Master Data */}
                        <Route path="/masters" element={<Masters />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/settings" element={<Settings />} />
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </HashRouter>
        </DataProvider>
    );
};

const container = document.getElementById('umh-app-root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}