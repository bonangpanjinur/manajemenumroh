import React from 'react';
import { useData } from '../contexts/DataContext';
import { LogOut, ExternalLink } from 'lucide-react';

const Header = ({ title, toggleSidebar }) => {
    const { user } = useData();

    // Cek apakah user memiliki hak untuk kembali ke WP Dashboard
    // Biasanya Administrator (super_admin) atau Owner
    const canSwitchToWP = user && (user.role === 'super_admin' || user.role === 'administrator' || user.role === 'owner');

    // URL Admin WP dari global variable yang kita inject
    const adminUrl = (window.umhData && window.umhData.adminUrl) ? window.umhData.adminUrl : '/wp-admin/';

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={toggleSidebar} 
                        className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h2>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Tombol Switch ke WordPress (Hanya untuk Admin/Owner) */}
                    {canSwitchToWP && (
                        <a 
                            href={adminUrl}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                            title="Kembali ke Dashboard WordPress"
                        >
                            <LogOut size={16} />
                            <span>Kembali ke WP</span>
                        </a>
                    )}

                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right hidden sm:block">
                            <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
                                {user ? user.name : 'Pengguna'}
                            </span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {user ? (user.role === 'super_admin' ? 'Administrator' : user.role) : 'Guest'}
                            </span>
                        </div>
                        
                        <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-0.5 ring-2 ring-white shadow-md">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    {user && user.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-blue-600 font-bold text-lg">
                                            {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Status Indicator */}
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;