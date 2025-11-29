import React from 'react';
import { MENUS, hasAccess } from '../utils/menuConfig';
import { LogOut, X } from 'lucide-react';

// Kita ambil currentUser dari props atau localStorage (dummy untuk UI)
const currentUserRole = 'super_admin'; // Harusnya dari API/Context

const Sidebar = ({ isOpen, toggleSidebar }) => {
    // Helper untuk navigasi
    const handleNavClick = (path) => {
        if (window.umhNavigate) {
            window.umhNavigate(path);
        }
        // Tutup sidebar di mobile setelah klik
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    const activePage = window.umhActivePage || 'dashboard';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="font-bold text-xl text-blue-800 flex items-center gap-2">
                        <span>🕋</span> UMH Manager
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar pb-20">
                    {MENUS.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                {section.header}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    if (!hasAccess(currentUserRole, item.roles)) return null;
                                    
                                    const isActive = activePage === item.path;
                                    
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => handleNavClick(item.path)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                isActive 
                                                ? 'bg-blue-50 text-blue-700' 
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {/* Logout Button */}
                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={20} />
                            Keluar Sistem
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;