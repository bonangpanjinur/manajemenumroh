import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Roles from '../pages/Roles';
import Packages from '../pages/Packages';
import PackageCategories from '../pages/PackageCategories';
import Departures from '../pages/Departures';
import Bookings from '../pages/Bookings';
import Jamaah from '../pages/Jamaah';
import Agents from '../pages/Agents';
import Finance from '../pages/Finance';
import Accounting from '../pages/Accounting';
import Masters from '../pages/Masters';
import Settings from '../pages/Settings';
import StorefrontSimulation from '../pages/StorefrontSimulation'; // Import halaman baru

const Layout = () => {
    // Ambil path dari hash URL agar SPA jalan di WP Admin tanpa reload
    const [currentPath, setCurrentPath] = useState(window.location.hash.replace('#', '') || '/');

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash.replace('#', '') || '/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const renderContent = () => {
        switch (currentPath) {
            case '/': return <Dashboard />;
            case '/users': return <Users />;
            case '/roles': return <Roles />;
            case '/packages': return <Packages />;
            case '/package-categories': return <PackageCategories />;
            case '/departures': return <Departures />;
            case '/bookings': return <Bookings />;
            case '/jamaah': return <Jamaah />;
            case '/agents': return <Agents />;
            case '/finance': return <Finance />;
            case '/accounting': return <Accounting />;
            case '/masters': return <Masters />;
            case '/settings': return <Settings />;
            case '/storefront-simulation': return <StorefrontSimulation />; // Route Baru
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentPath={currentPath} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Umroh Manager Enterprise" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Layout;