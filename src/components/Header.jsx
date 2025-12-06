import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

const Header = ({ toggleSidebar, title }) => {
    // Ambil nama user dari localized script WP (jika ada)
    const currentUser = window.umhSettings?.currentUser?.data?.display_name || 'Administrator';

    return (
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm">
            
            {/* Kiri: Toggle Sidebar & Title */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                    aria-label="Open Sidebar"
                >
                    <Menu size={24} />
                </button>
                
                <h2 className="text-lg font-bold text-gray-800 hidden md:block">
                    {title || 'Dashboard Area'}
                </h2>
            </div>

            {/* Kanan: Actions */}
            <div className="flex items-center gap-4">
                {/* Search Bar (Hidden on small mobile) */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                    <Search size={16} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari data..." 
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-700"
                    />
                </div>

                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-gray-700">{currentUser}</div>
                        <div className="text-xs text-gray-500">Online</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;