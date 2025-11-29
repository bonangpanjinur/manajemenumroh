import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import './index.css';

// Import Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import { DataProvider, useData } from './contexts/DataContext';
import { MENUS } from './utils/menuConfig'; // Import menu untuk lookup title

// Import Pages
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Jamaah from './pages/Jamaah';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import Hotels from './pages/Hotels';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import HR from './pages/HR';
import Logistics from './pages/Logistics';
import Agents from './pages/Agents';
import Flights from './pages/Flights';
import Masters from './pages/Masters';
import Categories from './pages/Categories';
import PackageCategories from './pages/PackageCategories';
import Roles from './pages/Roles';

const AppContent = () => {
    const { user, loading } = useData();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Default ke dashboard jika user berubah
    useEffect(() => {
        if (user) setCurrentPage('dashboard');
    }, [user]);

    // Handle navigasi dengan pengecekan hak akses
    const handleNavigate = (page) => {
        setCurrentPage(page);
        setIsSidebarOpen(false);
    };

    // Helper untuk mendapatkan Judul Halaman berdasarkan current page
    const getPageTitle = (path) => {
        // Cari di config menu
        for (const group of MENUS) {
            const item = group.items.find(i => i.path === path);
            if (item) return item.label;
        }
        // Fallback title formatter jika tidak ketemu di menu
        return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    };

    const renderPage = () => {
        // Jika loading user data, tampilkan spinner
        if (loading) return <div className="flex items-center justify-center h-full text-gray-500">Memuat data pengguna...</div>;

        // Switch Case Rendering
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'packages': return <Packages />;
            case 'departures': return <Departures />;
            case 'jamaah': return <Jamaah />;
            case 'finance': return <Finance />;
            case 'marketing': return <Marketing />;
            case 'tasks': return <Tasks />;
            case 'hr': return <HR />;
            case 'logistics': return <Logistics />;
            
            // Master Data
            case 'hotels': return <Hotels />;
            case 'flights': return <Flights />;
            case 'agents': return <Agents />;
            case 'users': return <Users />;
            case 'settings': return <Settings />;
            
            // Extra pages
            case 'masters': return <Masters />;
            case 'categories': return <Categories />;
            case 'package-categories': return <PackageCategories />;
            case 'roles': return <Roles />;
            
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                activePage={currentPage}
                onNavigate={handleNavigate}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden w-full relative">
                <Header 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    title={getPageTitle(currentPage)} 
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    {/* Efek Fade In sederhana */}
                    <div className="animate-fade-in">
                        {renderPage()}
                    </div>
                </main>
            </div>
            
            <Toaster position="top-right" toastOptions={{
                className: '',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            }} />
        </div>
    );
};

const App = () => (
    <DataProvider>
        <AppContent />
    </DataProvider>
);

const container = document.getElementById('umh-app-root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}