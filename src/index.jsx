import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DataProvider from './contexts/DataContext';
import { Toaster } from 'react-hot-toast';

// Import Halaman Utama
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import Tasks from './pages/Tasks';
import Logistics from './pages/Logistics';
import HR from './pages/HR';
import Agents from './pages/Agents';

// Import Halaman Master & Settings
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import PackageCategories from './pages/PackageCategories'; // Pastikan ini diimport
import Categories from './pages/Categories'; // Ini adalah Finance Categories (COA)
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';

// Styles
import './index.css';

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* Operasional Utama */}
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/departures" element={<Departures />} />
                        
                        {/* Bisnis & Pendukung */}
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/hr" element={<HR />} />
                        
                        {/* Master Data & Admin */}
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/flights" element={<Flights />} />
                        
                        {/* PERBAIKAN: Pisahkan Rute Kategori */}
                        <Route path="/package-categories" element={<PackageCategories />} />
                        <Route path="/finance-categories" element={<Categories />} /> 
                        {/* Backward compatibility jika ada yg akses url lama */}
                        <Route path="/categories" element={<Categories />} /> 

                        <Route path="/users" element={<Users />} />
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </HashRouter>
        </DataProvider>
    );
};

// Mount React App
const container = document.getElementById('umroh-manager-app') || document.getElementById('umh-app-root');

if (container) {
    if (container.id !== 'umh-app-root') {
        container.id = 'umh-app-root';
    }
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error("Fatal Error: Container app tidak ditemukan di DOM.");
}