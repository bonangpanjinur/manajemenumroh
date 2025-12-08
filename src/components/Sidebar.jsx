import React from 'react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig'; // Pastikan import ini benar
import { LogOut, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, userRole }) => {
    // SAFETY: Pastikan menuItems selalu array
    const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];

    // Filter menu berdasarkan role user (jika ada logic role)
    const filteredMenu = safeMenuItems.filter(item => {
        if (!item.roles) return true; // Akses semua jika tidak ada batasan
        return item.roles.includes(userRole || 'admin');
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside 
                className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-blue-600 tracking-tight">UmrohManager</span>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {safeMenuItems.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Menu tidak tersedia</div>
                    ) : (
                        // SAFETY: Mapping menu dengan aman
                        filteredMenu.map((item, index) => (
                            <NavLink
                                key={item.path || index}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                                onClick={() => {
                                    if (window.innerWidth < 1024) toggleSidebar();
                                }}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <a 
                            href="/wp-login.php?action=logout" 
                            className="flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} className="mr-3" />
                            Keluar
                        </a>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;