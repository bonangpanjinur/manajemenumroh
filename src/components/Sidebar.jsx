import React from 'react';
import { MENUS, hasAccess } from '../utils/menuConfig';
import { useData } from '../contexts/DataContext';
import { LogOut, ChevronLeft } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, activePage, onNavigate }) => {
    const { user } = useData();
    const userRole = user?.role || 'subscriber';

    // Filter menu berdasarkan role
    const filteredMenus = MENUS.map(group => ({
        ...group,
        items: group.items.filter(item => hasAccess(userRole, item.roles))
    })).filter(group => group.items.length > 0); // Hapus grup kosong

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col h-full shadow-xl`}>
                
                {/* Header Sidebar */}
                <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
                    <div className="font-bold text-xl tracking-wider flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">U</span>
                        </div>
                        <span>MANAGER</span>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                </div>

                {/* Scrollable Menu Area */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
                    {filteredMenus.map((group, index) => (
                        <div key={index}>
                            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {group.header}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = activePage === item.path;
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => {
                                                onNavigate(item.path);
                                                if (window.innerWidth < 1024) toggleSidebar();
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                                isActive 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                            }`}
                                        >
                                            <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer User Profile */}
                <div className="p-4 bg-slate-950 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.replace('_', ' ') || 'Guest'}</p>
                        </div>
                        {/* Tombol Logout (Opsional, biasanya handled by WP) */}
                         <a href={window.umhData?.logoutUrl || '/wp-login.php?action=logout'} className="text-slate-500 hover:text-red-400 transition-colors" title="Keluar">
                            <LogOut size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;