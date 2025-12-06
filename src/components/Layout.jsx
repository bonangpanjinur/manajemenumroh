import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; 

const Layout = ({ children, title }) => {
    // State untuk kontrol Sidebar di Mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
            {/* Sidebar Component - Passing props untuk kontrol mobile */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Overlay Gelap untuk Mobile saat Sidebar terbuka */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content Area */}
            {/* lg:ml-64 artinya margin-left 64 hanya di layar besar (Desktop) */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64 h-full transition-all duration-300">
                
                {/* Header (Top Bar) */}
                <Header toggleSidebar={toggleSidebar} title={title} />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Render Halaman di sini */}
                        {children ? children : <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;