import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Import Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Finance from './pages/Finance';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import Logistics from './pages/Logistics';
import Users from './pages/Users'; 
import Masters from './pages/Masters'; // Tambahan Master Data

import DataProvider from './contexts/DataContext';

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
                    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/departures" element={<Departures />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/marketing" element={<div className="p-10 text-center">Halaman Marketing (Coming Soon)</div>} />
                        
                        {/* Master Data */}
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/masters" element={<Masters />} />
                        
                        {/* Operasional */}
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/tasks" element={<div className="p-10 text-center">Halaman Tugas (Coming Soon)</div>} />
                        <Route path="/hr" element={<div className="p-10 text-center">Halaman HR (Coming Soon)</div>} />

                        {/* Manajemen */}
                        <Route path="/users" element={<Users />} />
                        <Route path="/settings" element={<Settings />} />
                        
                        <Route path="*" element={
                            <div className="flex items-center justify-center h-screen">
                                <h1 className="text-xl font-bold text-gray-500">404 | Halaman Tidak Ditemukan</h1>
                            </div>
                        } />
                    </Routes>
                </div>
            </HashRouter>
        </DataProvider>
    );
};

// --- PERBAIKAN VITAL DI SINI ---
// Pastikan ID ini SAMA PERSIS dengan yang ada di file admin/dashboard-react.php
const container = document.getElementById('umroh-manager-app');

if (container) {
    try {
        const root = createRoot(container);
        root.render(<App />);
    } catch (e) {
        console.error("React Mount Error:", e);
        // Tampilkan error di layar jika crash saat mounting
        container.innerHTML = `<div style="color:red; padding:20px; text-align:center;"><h3>Gagal Memuat Aplikasi</h3><p>${e.message}</p></div>`;
    }
} else {
    console.error("Fatal Error: Container #umroh-manager-app tidak ditemukan di DOM.");
}