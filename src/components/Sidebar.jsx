import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import menuConfig from '../utils/menuConfig';
import { useData } from '../contexts/DataContext';
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const { role, logout, user } = useData();
    const navigate = useNavigate();

    // Filter menu berdasarkan Role
    const filteredMenu = menuConfig.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        // Logic: Jika user adalah 'administrator', tampilkan semua
        // Jika tidak, cek apakah role user ada di list roles item
        // Note: Pastikan role backend Anda konsisten ('administrator', 'agent', 'jamaah')
        if (role === 'administrator') return true; 
        
        return item.roles.includes(role) || item.roles.includes('all');
    });

    const handleLogout = async () => {
        if(confirm('Apakah Anda yakin ingin keluar?')) {
            await logout();
            navigate('/login');
        }
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={closeMobile}
                ></div>
            )}

            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shadow-xl
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header Sidebar */}
                <div className="flex items-center justify-center h-16 bg-gray-800 shadow-md border-b border-gray-700">
                    <span className="text-xl font-bold tracking-wider text-indigo-400">UMROH<span className="text-white">APPS</span></span>
                </div>

                {/* Menu List */}
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                        Menu Utama
                    </div>
                    <nav className="space-y-1">
                        {filteredMenu.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${ ({isActive}) => isActive ? 'text-white' : 'text-gray-500' }`} aria-hidden="true" />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                
                {/* User Info & Logout */}
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {user?.avatar ? (
                                <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                            ) : (
                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                            )}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{user?.display_name || 'Pengguna'}</p>
                            <p className="text-xs text-gray-400 truncate capitalize">{role === 'administrator' ? 'Super Admin' : role}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="ml-2 p-2 text-gray-400 hover:text-white hover:bg-red-600 rounded-full transition-colors"
                            title="Keluar Aplikasi"
                        >
                            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}