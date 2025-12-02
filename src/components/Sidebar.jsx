import React from 'react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig';
import { X, LogOut, ArrowLeft, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = useData();
    
    // Redirect ke dashboard WP standar
    const handleBackToWP = () => {
        window.location.href = '/wp-admin/index.php';
    };

    const handleLogout = () => {
        window.location.href = '/wp-login.php?action=logout';
    };

    // Cek Role Owner/Super Admin
    const isSuperAdmin = user && (['administrator', 'owner', 'super_admin'].includes(user.role));

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar}></div>}
            
            <div className={`fixed top-0 left-0 h-full bg-white text-gray-800 w-64 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col border-r border-gray-100`}>
                
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-md">U</div>
                        <span className="font-bold text-xl tracking-tight text-blue-900">UmrahMgr</span>
                    </div>
                    <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{section.section}</div>
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={itemIdx}
                                            to={item.path}
                                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                    
                    {/* MENU TONG SAMPAH */}
                    <div className="mb-6">
                         <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lainnya</div>
                         <NavLink to="/trash" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isActive ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}`}>
                            <Trash2 size={18} /> <span>Tong Sampah</span>
                         </NavLink>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                    {isSuperAdmin && (
                        <button onClick={handleBackToWP} className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200 bg-white">
                            <ArrowLeft size={18} /> <span>Kembali ke Mode WP</span>
                        </button>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={18} /> <span>Keluar Aplikasi</span>
                    </button>
                </div>
            </div>
        </>
    );
};
export default Sidebar;