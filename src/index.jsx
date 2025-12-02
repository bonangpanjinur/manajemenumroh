import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DataProvider from './contexts/DataContext';
import { Toaster } from 'react-hot-toast';

// --- IMPORT COMPONENTS (PASTIKAN NAMA FILE DAN FOLDER BENAR) ---
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Departures from './pages/Departures';
import Packages from './pages/Packages'; // Pastikan file ini berisi logika PAKET, bukan HR
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import PackageCategories from './pages/PackageCategories';
import Finance from './pages/Finance';
import Categories from './pages/Categories'; // COA
import Logistics from './pages/Logistics';
import Marketing from './pages/Marketing';
import Agents from './pages/Agents';
import HR from './pages/HR';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
// import Trash from './pages/Trash'; // Uncomment jika file Trash.jsx sudah siap

import './index.css';

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
                    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                    <Routes>
                        {/* 1. DASHBOARD */}
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* 2. OPERASIONAL */}
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/departures" element={<Departures />} />
                        
                        {/* 3. PRODUK & LAYANAN */}
                        <Route path="/packages" element={<Packages />} /> 
                        <Route path="/package-categories" element={<PackageCategories />} />
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/flights" element={<Flights />} />
                        
                        {/* 4. KEUANGAN & ASET */}
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/logistics" element={<Logistics />} />
                        
                        {/* 5. TIM & MARKETING */}
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/hr" element={<HR />} />
                        
                        {/* 6. PENGATURAN SISTEM */}
                        <Route path="/users" element={<Users />} />
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/settings" element={<Settings />} />
                        {/* <Route path="/trash" element={<Trash />} /> */}

                        {/* Fallback: Redirect unknown routes to Dashboard */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </HashRouter>
        </DataProvider>
    );
};

// Mount App
const container = document.getElementById('umh-app-root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error("Container 'umh-app-root' not found. Pastikan plugin aktif.");
}