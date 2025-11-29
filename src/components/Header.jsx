import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

const Header = ({ toggleSidebar, title }) => {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 w-full">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button 
                    onClick={toggleSidebar} 
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600 md:hidden focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    <Menu size={24} />
                </button>
                
                {/* Mobile Title */}
                <div className="md:hidden font-semibold text-gray-700 truncate max-w-[200px]">
                    {title || 'Dashboard'}
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-700">Administrator</div>
                        <div className="text-xs text-gray-500">Super Admin</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;