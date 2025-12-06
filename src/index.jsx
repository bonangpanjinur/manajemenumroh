import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './contexts/DataContext';
import './index.css';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Storefront from './pages/Storefront'; 
import CustomPage from './pages/CustomPage'; // Halaman Baru!

// ... import page lainnya (biarkan sama) ...
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Savings from './pages/Savings';
import Bookings from './pages/Bookings';
import Departures from './pages/Departures';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import PackageCategories from './pages/PackageCategories';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Marketing from './pages/Marketing';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import Accounting from './pages/Accounting';
import HR from './pages/HR';
import Logistics from './pages/Logistics';
import Stats from './pages/Stats';
import Masters from './pages/Masters';
import RoomingManager from './pages/RoomingManager';
import StorefrontSimulation from './pages/StorefrontSimulation';
import AttendanceScanner from './pages/AttendanceScanner';

import Spinner from './components/Spinner';

// Protected Route Component (Biarkan Sama)
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useData();
    const location = useLocation();

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <Spinner />
        </div>
    );

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <Routes>
                    {/* --- PUBLIC ROUTES (E-Commerce & Content) --- */}
                    <Route path="/" element={<Storefront />} />
                    <Route path="/catalog" element={<Storefront />} />
                    
                    {/* Route Dinamis untuk Halaman Statis */}
                    {/* Contoh: domain.com/app#/page/tentang-kami */}
                    <Route path="/page/:slug" element={<CustomPage />} /> 
                    
                    <Route path="/login" element={<Login />} />
                    
                    {/* --- PROTECTED ROUTES (Dashboard App) --- */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    
                    <Route path="/jamaah" element={<ProtectedRoute><Jamaah /></ProtectedRoute>} />
                    <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
                    <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
                    <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                    <Route path="/departures" element={<ProtectedRoute><Departures /></ProtectedRoute>} />
                    <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
                    
                    {/* Admin Modules */}
                    <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
                    <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
                    <Route path="/hr" element={<ProtectedRoute><HR /></ProtectedRoute>} />
                    <Route path="/logistics" element={<ProtectedRoute><Logistics /></ProtectedRoute>} />
                    <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
                    <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                    <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path="/masters" element={<ProtectedRoute><Masters /></ProtectedRoute>} />
                    <Route path="/package-categories" element={<ProtectedRoute><PackageCategories /></ProtectedRoute>} />
                    <Route path="/rooming" element={<ProtectedRoute><RoomingManager /></ProtectedRoute>} />
                    <Route path="/storefront-sim" element={<ProtectedRoute><StorefrontSimulation /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><AttendanceScanner /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </DataProvider>
    );
};

const container = document.getElementById('umh-admin-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}