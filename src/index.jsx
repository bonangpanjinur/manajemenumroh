import React, { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Departures from './pages/Departures';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories';
import Finance from './pages/Finance';
import Savings from './pages/Savings';
import Manasik from './pages/Manasik';
import Logistics from './pages/Logistics';
import Marketing from './pages/Marketing';
import PrivateUmrah from './pages/PrivateUmrah';
import Badal from './pages/Badal';
import Agents from './pages/Agents';
import Masters from './pages/Masters';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Tasks from './pages/Tasks';
import Support from './pages/Support';
import HR from './pages/HR';
import Mutawwif from './pages/Mutawwif';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DataContext from './contexts/DataContext';
import './index.css';

// Komponen Pembungkus untuk Membersihkan UI WordPress
const ImmersiveModeWrapper = ({ children }) => {
    useLayoutEffect(() => {
        // 1. Buat Style Element
        const style = document.createElement('style');
        style.id = 'umroh-immersive-style';
        
        // 2. Isi dengan CSS Agresif (!important)
        style.innerHTML = `
            /* Sembunyikan Semua Elemen Bawaan WP */
            #wpadminbar, #adminmenumain, #adminmenuback, #adminmenuwrap, #wpfooter, #wpcontent, .update-nag, .notice, .error, .updated { 
                display: none !important; 
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                position: absolute !important;
                z-index: -999 !important;
            }
            
            /* Reset Body */
            html, body { 
                margin: 0 !important; 
                padding: 0 !important; 
                height: 100vh !important; 
                width: 100vw !important;
                overflow: hidden !important; 
                background-color: #f3f4f6 !important;
            }

            /* Paksa App Container Fullscreen */
            #umroh-manager-app {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 2147483647 !important;
                overflow-y: auto !important;
                background-color: #f3f4f6;
            }
        `;
        
        // 3. Suntikkan ke Head
        document.head.appendChild(style);

        // Cleanup saat unmount (opsional, untuk SPA biasanya tidak perlu)
        return () => {
            // document.head.removeChild(style); 
        };
    }, []);

    return children;
};

const App = () => {
    return (
        <ImmersiveModeWrapper>
            <DataContext>
                <HashRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/bookings" element={<Bookings />} />
                            <Route path="/departures" element={<Departures />} />
                            <Route path="/jamaah" element={<Jamaah />} />
                            <Route path="/packages" element={<Packages />} />
                            <Route path="/package-categories" element={<PackageCategories />} />
                            <Route path="/finance" element={<Finance />} />
                            <Route path="/savings" element={<Savings />} />
                            <Route path="/manasik" element={<Manasik />} />
                            <Route path="/logistics" element={<Logistics />} />
                            <Route path="/marketing" element={<Marketing />} />
                            <Route path="/private-umrah" element={<PrivateUmrah />} />
                            <Route path="/badal" element={<Badal />} />
                            <Route path="/agents" element={<Agents />} />
                            <Route path="/masters" element={<Masters />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/roles" element={<Roles />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="/hr" element={<HR />} />
                            <Route path="/mutawwif" element={<Mutawwif />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </Layout>
                </HashRouter>
            </DataContext>
        </ImmersiveModeWrapper>
    );
};

const container = document.getElementById('umroh-manager-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}