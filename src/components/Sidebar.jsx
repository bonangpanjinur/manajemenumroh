import React from 'react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig'; // FIX: Menggunakan 'menuItems' bukan 'MENUS'
import { LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    
    const handleLogout = () => {
        const logoutUrl = window.umhData?.siteUrl ? `${window.umhData.siteUrl}/wp-login.php?action=logout` : '/wp-login.php?action=logout';
        window.location.href = logoutUrl;
    };

    return (
        <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
            
            {/* Header Sidebar */}
            <div className="h-16 flex items-center justify-center border-b border-gray-100 relative">
                {isOpen ? (
                    <h1 className="font-bold text-xl text-blue-600 tracking-tight">Umrah<span className="text-gray-800">Manager</span></h1>
                ) : (
                    <span className="font-bold text-2xl text-blue-600">UM</span>
                )}
                
                <button onClick={toggleSidebar} className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-500 hover:text-blue-600 z-50">
                    {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
                {/* FIX: Menggunakan menuItems */}
                {menuItems.map((section, idx) => (
                    <div key={idx}>
                        {isOpen && (
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                                {section.section}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item, itemIdx) => (
                                <NavLink
                                    key={itemIdx}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center px-3 py-2.5 rounded-lg transition-colors group
                                        ${isActive 
                                            ? 'bg-blue-50 text-blue-700 font-medium' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                    `}
                                    title={!isOpen ? item.label : ''}
                                >
                                    <item.icon size={20} className={`${isOpen ? 'mr-3' : 'mx-auto'} flex-shrink-0 transition-colors`} />
                                    {isOpen && <span>{item.label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
                    {isOpen && (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <User size={18} />
                            </div>
                            <div className="text-sm truncate">
                                <p className="font-bold text-gray-700">Admin</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;