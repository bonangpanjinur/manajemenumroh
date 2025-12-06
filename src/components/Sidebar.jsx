import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig';
import { LogOut, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    
    // State untuk toggle submenu (jika nanti dibutuhkan accordion)
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (title) => {
        setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    // Helper: Fungsi untuk merender satu link menu
    const renderLink = (item, index) => (
        <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
            }
        >
            {/* Pastikan icon ada sebelum dirender */}
            {item.icon && <item.icon size={18} />}
            {item.label}
        </NavLink>
    );

    return (
        <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 overflow-y-auto z-50 font-inter">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
                    <LayoutGrid size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-gray-800 leading-tight">UMH Travel</h1>
                    <p className="text-xs text-gray-500 font-medium">Enterprise System v7.0</p>
                </div>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item, idx) => {
                    // KASUS 1: Jika item adalah Section (Grup Menu dengan Judul)
                    // Struktur: { section: 'Nama', items: [...] }
                    if (item.section) {
                        return (
                            <div key={idx} className="pt-4 first:pt-0">
                                <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {item.section}
                                </div>
                                <div className="space-y-1">
                                    {item.items.map((subItem, subIdx) => 
                                        renderLink(subItem, `sub-${idx}-${subIdx}`)
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // KASUS 2: Jika item adalah Menu Tunggal (Top Level)
                    // Struktur: { label: 'Nama', path: '/', icon: ... }
                    return renderLink(item, idx);
                })}
            </nav>

            {/* User Profile / Logout (Fixed Bottom) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            AD
                        </div>
                        <div className="text-xs">
                            <div className="font-bold text-gray-700 truncate w-24">Administrator</div>
                            <div className="text-xs text-gray-500">Super Admin</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.href = window.umhSettings?.adminUrl + 'admin.php?page=umroh-manager&action=logout'} 
                        className="text-gray-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50" 
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;