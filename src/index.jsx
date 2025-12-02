import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DataProvider from './contexts/DataContext.jsx';
import { Toaster } from 'react-hot-toast';

// Import Pages
import Dashboard from './pages/Dashboard.jsx';
import Jamaah from './pages/Jamaah.jsx';
import Packages from './pages/Packages.jsx';
import Departures from './pages/Departures.jsx';
import Finance from './pages/Finance.jsx';
import Marketing from './pages/Marketing.jsx';
import Tasks from './pages/Tasks.jsx';
import Logistics from './pages/Logistics.jsx';
import HR from './pages/HR.jsx';
import Agents from './pages/Agents.jsx';
import Hotels from './pages/Hotels.jsx';
import Flights from './pages/Flights.jsx';
import Categories from './pages/Categories.jsx';
import Users from './pages/Users.jsx';
import Roles from './pages/Roles.jsx';
import Settings from './pages/Settings.jsx';
import Trash from './pages/Trash.jsx';

import './index.css';

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/departures" element={<Departures />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/hr" element={<HR />} />
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/trash" element={<Trash />} />
                    </Routes>
                </div>
            </HashRouter>
        </DataProvider>
    );
};

const container = document.getElementById('umroh-manager-app') || document.getElementById('umh-app-root');
if (container) {
    if (container.id !== 'umh-app-root') container.id = 'umh-app-root';
    createRoot(container).render(<App />);
}