import React from 'react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig';
import { LogOut, LayoutGrid, X, ChevronRight } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    
    // Helper: Render Item Menu Single
    const renderMenuItem = (item, index) => (
        <NavLink
            key={index}
            to={item.path}
            onClick={() => setIsOpen(false)} // Tutup sidebar di mobile saat klik
            className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-1
                ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
            }
        >
            {/* Icon dengan logika active state */}
            {item.icon && (
                <item.icon 
                    size={18} 
                    className={`transition-colors ${window.location.hash.endsWith(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} 
                />
            )}
            <span className="flex-1 truncate">{item.label}</span>
            
            {/* Indikator panah kecil saat hover (UX enhancement) */}
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-5px] group-hover:translate-x-0 text-gray-400" />
        </NavLink>
    );

    return (
        <>
            {/* 1. Sidebar Container */}
            <aside 
                className={`
                    fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-200 flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* 2. Logo Area (Header Sidebar) */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-1.5 rounded-lg shadow-sm">
                            <LayoutGrid size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 leading-tight tracking-tight text-lg">UMH Travel</span>
                            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Enterprise v7.1</span>
                        </div>
                    </div>
                    {/* Tombol Close (Hanya Mobile) */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="lg:hidden p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 3. Navigation Links (Scrollable Area) */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {menuItems.map((block, idx) => {
                        // Render Section Group
                        if (block.section) {
                            return (
                                <div key={idx}>
                                    <h3 className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        {block.section}
                                    </h3>
                                    <div className="space-y-0.5">
                                        {block.items.map((subItem, subIdx) => 
                                            renderMenuItem(subItem, `sub-${idx}-${subIdx}`)
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        // Render Top Level Menu (misal Dashboard)
                        return (
                            <div key={idx} className="mb-2">
                                {renderMenuItem(block, idx)}
                            </div>
                        );
                    })}
                </nav>

                {/* 4. Footer Sidebar (User Profile) */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-200 group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                            AD
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-700 truncate group-hover:text-blue-600">Administrator</p>
                            <p className="text-xs text-gray-500 truncate">Super Admin</p>
                        </div>
                        <button 
                            onClick={() => window.location.href = window.umhSettings?.adminUrl + 'admin.php?page=umroh-manager&action=logout'}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* 5. Overlay Gelap (Mobile Only) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;