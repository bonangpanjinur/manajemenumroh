import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './contexts/DataContext';

// Import Semua Halaman
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing'; // Asumsi file ini ada/standard
import Agents from './pages/Agents';
import Tasks from './pages/Tasks'; // Asumsi file ini ada/standard
import Logistics from './pages/Logistics';
import HR from './pages/HR'; // Asumsi file ini ada/standard
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import Masters from './pages/Masters';
import Users from './pages/Users';
import Settings from './pages/Settings';

const App = () => {
    // State untuk Routing Sederhana (SPA)
    // Mengambil halaman terakhir dari localStorage agar saat refresh tidak kembali ke dashboard
    const storedPage = localStorage.getItem('umh_active_page');
    const [activePage, setActivePage] = useState(storedPage || 'dashboard');

    // Fungsi navigasi yang dilempar ke Sidebar/Layout
    const navigate = (page) => {
        setActivePage(page);
        localStorage.setItem('umh_active_page', page);
    };

    // Mapping Halaman
    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'jamaah': return <Jamaah />;
            case 'packages': return <Packages />;
            case 'departures': return <Departures />;
            
            // Keuangan & Bisnis
            case 'finance': return <Finance />;
            case 'marketing': return <Marketing />;
            case 'agents': return <Agents />;
            
            // Operasional
            case 'tasks': return <Tasks />;
            case 'logistics': return <Logistics />;
            case 'hr': return <HR />;
            
            // Master Data
            case 'hotels': return <Hotels />;
            case 'flights': return <Flights />;
            case 'masters': return <Masters />;
            case 'users': return <Users />;
            case 'settings': return <Settings />;
            
            default: return <Dashboard />;
        }
    };

    // Hack untuk melewatkan prop 'navigate' ke komponen anak melalui Context atau props global
    // Di sini kita menggunakan cara sederhana: 
    // Kita akan mempassing fungsi navigate ke window object atau menggunakan Custom Event
    // Tapi cara paling React adalah membungkus renderPage dengan Context, 
    // namun karena struktur Layout Anda mungkin sudah menangani Sidebar,
    // kita pastikan Layout bisa mengakses state activePage ini.
    
    // UPDATE: Agar Sidebar di dalam Layout bisa mengubah page,
    // kita perlu Context atau prop drilling. 
    // Asumsi: Anda menggunakan DataContext atau melawatkan props di Layout.
    // Untuk mempermudah tanpa merombak semua file, kita simpan fungsi navigasi di window
    // agar bisa dipanggil dari Sidebar.jsx
    
    useEffect(() => {
        window.umhNavigate = navigate;
        window.umhActivePage = activePage;
    }, [activePage]);

    return (
        <DataProvider>
            <div className="umh-app-container bg-gray-50 min-h-screen text-gray-800 font-sans">
                {/* Toaster untuk Notifikasi Global */}
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                
                {/* Render Halaman Aktif */}
                {renderPage()}
            </div>
        </DataProvider>
    );
};

// Mount React ke Div WordPress
const container = document.getElementById('umroh-manager-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}