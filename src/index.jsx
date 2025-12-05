import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { DataProvider } from './contexts/DataContext';
import './index.css';

// Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Bookings from './pages/Bookings';
import Finance from './pages/Finance';
import Logistics from './pages/Logistics';
import Settings from './pages/Settings';
import HR from './pages/HR';
import Marketing from './pages/Marketing';
import Agents from './pages/Agents';
import Masters from './pages/Masters';
import Accounting from './pages/Accounting'; // New Page

const App = () => {
    return (
        <HashRouter>
            <DataProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/departures" element={<Departures />} />
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/hr" element={<HR />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/masters" element={<Masters />} />
                        <Route path="/accounting" element={<Accounting />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Layout>
            </DataProvider>
        </HashRouter>
    );
};

const container = document.getElementById('umh-admin-root');
if (container) { const root = createRoot(container); root.render(<App />); }