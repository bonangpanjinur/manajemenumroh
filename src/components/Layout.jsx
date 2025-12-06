import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; 

const Layout = ({ children, title }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Wrapper */}
            {/* lg:pl-72 menyesuaikan dengan lebar sidebar (w-72) */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
                
                {/* Header Sticky di Atas */}
                <Header toggleSidebar={toggleSidebar} title={title} />

                {/* Konten Halaman */}
                <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
                    {/* Fade In Animation untuk transisi halaman */}
                    <div className="animate-fade-in">
                        {children ? children : <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;