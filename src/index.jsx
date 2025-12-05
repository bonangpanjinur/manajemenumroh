import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Layout & Context
import Layout from './components/Layout';
// PERBAIKAN: Import DataProvider harus pakai { } karena named export
import { DataProvider } from './contexts/DataContext';

// Pages Import
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories';
import Departures from './pages/Departures';
import Bookings from './pages/Bookings';
import Finance from './pages/Finance';
import Jamaah from './pages/Jamaah';
import Logistics from './pages/Logistics';
import Tasks from './pages/Tasks';
import HR from './pages/HR';
import AttendanceScanner from './pages/AttendanceScanner';
import Agents from './pages/Agents';
import Marketing from './pages/Marketing';
import Users from './pages/Users';
import Masters from './pages/Masters';
import Roles from './pages/Roles';
import Settings from './pages/Settings';

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="packages" element={<Packages />} />
                        <Route path="package-categories" element={<PackageCategories />} />
                        <Route path="departures" element={<Departures />} />
                        <Route path="bookings" element={<Bookings />} />
                        <Route path="finance" element={<Finance />} />
                        <Route path="jamaah" element={<Jamaah />} />
                        <Route path="logistics" element={<Logistics />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="hr" element={<HR />} />
                        <Route path="attendance-scanner" element={<AttendanceScanner />} />
                        <Route path="agents" element={<Agents />} />
                        <Route path="marketing" element={<Marketing />} />
                        <Route path="users" element={<Users />} />
                        <Route path="masters" element={<Masters />} />
                        <Route path="roles" element={<Roles />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
                <Toaster position="top-right" />
            </HashRouter>
        </DataProvider>
    );
};

const container = document.getElementById('umh-admin-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}