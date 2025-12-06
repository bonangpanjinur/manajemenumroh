import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig';
import { LogOut, LayoutGrid, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    // Helper untuk merender link
    const renderLink = (item, index) => (
        <NavLink
            key={index}
            to={item.path}
            onClick={() => setIsOpen(false)} // Tutup sidebar saat menu diklik (Mobile)
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`
            }
        >
            {/* Render Icon jika ada */}
            {item.icon && <item.icon size={20} className="shrink-0" />}
            <span className="truncate">{item.label}</span>
        </NavLink>
    );

    return (
        <>
            {/* Sidebar Container */}
            <aside 
                className={`
                    fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 
                    transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo & Header Sidebar */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                            <LayoutGrid size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-gray-800 leading-none">UMH Travel</h1>
                            <span className="text-[10px] text-gray-500 font-medium">Enterprise v7.0</span>
                        </div>
                    </div>
                    {/* Tombol Close (Hanya di Mobile) */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="lg:hidden text-gray-500 hover:text-red-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Menu Scroll Area */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar" style={{ height: 'calc(100% - 130px)' }}>
                    {menuItems.map((item, idx) => {
                        // Jika item adalah Section (Grup)
                        if (item.section) {
                            return (
                                <div key={idx} className="pt-4 first:pt-0 pb-2">
                                    <h3 className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        {item.section}
                                    </h3>
                                    <div className="space-y-1">
                                        {item.items.map((subItem, subIdx) => 
                                            renderLink(subItem, `sub-${idx}-${subIdx}`)
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        // Jika item adalah Menu Tunggal
                        return renderLink(item, idx);
                    })}
                </nav>

                {/* Footer User Info */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                                AD
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-gray-700 truncate">Administrator</div>
                                <div className="text-xs text-gray-500 truncate">Super Admin</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => window.location.href = window.umhSettings?.adminUrl + 'admin.php?page=umroh-manager&action=logout'} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;