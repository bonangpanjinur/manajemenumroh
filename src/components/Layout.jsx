import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title, subtitle }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <Header toggleSidebar={toggleSidebar} title={title} />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 custom-scrollbar">
                    <div className="container mx-auto max-w-7xl animate-fade-in">
                        {/* Page Title Section */}
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                            </div>
                        </div>
                        
                        {/* Dynamic Content */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;