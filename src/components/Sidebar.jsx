import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig'; // Import constant menuItems
import { X, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();

    const handleLogout = () => {
        window.location.href = '/wp-login.php?action=logout';
    };

    return (
        <>
            {/* Overlay Mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`fixed top-0 left-0 h-full bg-white text-gray-800 w-64 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col border-r border-gray-100`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-md">U</div>
                        <span className="font-bold text-xl tracking-tight text-blue-900">UmrahMgr</span>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Menu Area */}
                <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            {/* Judul Section */}
                            <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                {section.section}
                            </div>
                            
                            {/* Item Menu */}
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => {
                                    const Icon = item.icon; // Ambil komponen icon
                                    return (
                                        <NavLink
                                            key={itemIdx}
                                            to={item.path}
                                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                isActive 
                                                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:pl-4'
                                            }`}
                                        >
                                            <Icon size={18} className={({isActive}) => isActive ? "text-blue-600" : "text-gray-400"} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Keluar Aplikasi</span>
                    </button>
                    <div className="mt-3 text-[10px] text-center text-gray-400">
                        v2.1.0 Enterprise
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;