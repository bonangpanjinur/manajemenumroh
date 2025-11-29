import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'; // FIX: Import yang benar untuk React 18
import './index.css';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './contexts/DataContext';

// Import Semua Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import Agents from './pages/Agents';
import Tasks from './pages/Tasks';
import Logistics from './pages/Logistics';
import HR from './pages/HR';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import Masters from './pages/Masters';
import Users from './pages/Users';
import Settings from './pages/Settings';

const App = () => {
    // Ambil halaman terakhir dari localStorage atau default ke 'dashboard'
    const storedPage = localStorage.getItem('umh_active_page');
    const [activePage, setActivePage] = useState(storedPage || 'dashboard');

    // Fungsi navigasi global
    const navigate = (page) => {
        setActivePage(page);
        localStorage.setItem('umh_active_page', page);
    };

    // Expose navigasi ke window agar bisa diakses oleh Sidebar
    useEffect(() => {
        window.umhNavigate = navigate;
        window.umhActivePage = activePage;
    }, [activePage]);

    const renderPage = () => {
        try {
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
        } catch (err) {
            console.error("Gagal merender halaman:", err);
            return <div className="p-10 text-center text-red-600">Terjadi kesalahan saat memuat halaman: {err.message}</div>;
        }
    };

    return (
        <DataProvider>
            <div className="umh-app-container bg-gray-50 min-h-screen text-gray-800 font-sans">
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                {renderPage()}
            </div>
        </DataProvider>
    );
};

// --- LOGIC MOUNTING REACT (DI SINI BIASANYA ERROR TERJADI) ---
const container = document.getElementById('umroh-manager-app');

if (container) {
    try {
        const root = createRoot(container);
        root.render(<App />);
        console.log("React App berhasil di-mount ke #umroh-manager-app");
    } catch (e) {
        console.error("React Mount Error:", e);
        container.innerHTML = `<div style="color:red; padding:20px;">React Error: ${e.message}</div>`;
    }
} else {
    console.error("Fatal Error: Container #umroh-manager-app tidak ditemukan di DOM. Pastikan file PHP memuat div ini.");
}