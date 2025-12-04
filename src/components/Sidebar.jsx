import React from 'react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig';
import { LogOut, LayoutGrid } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
                    <LayoutGrid size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-gray-800 leading-tight">UMH Travel</h1>
                    <p className="text-xs text-gray-500 font-medium">Enterprise System v4.0</p>
                </div>
            </div>

            {/* Menu Navigasi Scrollable */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
                {menuItems.map((group, idx) => (
                    <div key={idx}>
                        <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {group.category}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <item.icon size={18} className={({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-400'} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
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
                            <div className="text-gray-500">Super Admin</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.href = window.umh_vars?.site_url + '/wp-login.php?action=logout'} 
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