import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // Optional if you have header logic

const Layout = ({ children, title, actions }) => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar Fixed */}
            <Sidebar />

            {/* Main Content Area - Offset by Sidebar Width */}
            <main className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
                {/* Header Area (Title & Actions) */}
                <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {actions}
                        {/* Optional: Add User Notification/Profile here if not in Sidebar */}
                    </div>
                </header>

                {/* Content Body */}
                <div className="p-8 flex-1 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;