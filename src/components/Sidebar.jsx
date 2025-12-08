import React from 'react';
import { NavLink } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig';
import { LogOut, X, UserCircle, ChevronRight } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, userRole = 'Administrator' }) => {
    const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];

    const filteredMenu = safeMenuItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes('admin'); 
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside 
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Brand Logo Area */}
                <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 tracking-tight leading-none">UmrohMgr</h1>
                            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Enterprise</span>
                        </div>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    {safeMenuItems.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm italic">Menu tidak tersedia</div>
                    ) : (
                        filteredMenu.map((item, index) => (
                            <NavLink
                                key={item.path || index}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                                onClick={() => {
                                    if (window.innerWidth < 1024) toggleSidebar();
                                }}
                            >
                                <div className="flex items-center">
                                    <span className={`mr-3 transition-colors ${
                                        window.location.hash.includes(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </div>
                                {/* Active Indicator Dot */}
                                <div className={`w-1.5 h-1.5 rounded-full bg-blue-600 transition-opacity ${
                                    window.location.hash.endsWith(item.path) ? 'opacity-100' : 'opacity-0'
                                }`}></div>
                            </NavLink>
                        ))
                    )}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-gray-50">
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 mb-3">
                        <div className="bg-white p-2 rounded-full shadow-sm text-gray-400">
                            <UserCircle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">Administrator</p>
                            <p className="text-xs text-gray-500 truncate">{userRole}</p>
                        </div>
                    </div>
                    
                    <a 
                        href="/wp-login.php?action=logout" 
                        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all"
                    >
                        <LogOut size={16} className="mr-2" />
                        Keluar Sistem
                    </a>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;