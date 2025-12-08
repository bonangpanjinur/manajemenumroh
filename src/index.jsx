import React, { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DataContext from './contexts/DataContext';
import './index.css';

// Import Semua Halaman
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

// Component untuk Fullscreen Mode
const ImmersiveWrapper = ({ children }) => {
    useLayoutEffect(() => {
        // Suntikkan CSS Global untuk Reset Tampilan WP
        const style = document.createElement('style');
        style.innerHTML = `
            /* Sembunyikan elemen WP */
            #wpadminbar, #adminmenumain, #adminmenuback, #adminmenuwrap, #wpfooter, .update-nag, .notice { display: none !important; }
            #wpcontent, #wpbody { margin: 0 !important; padding: 0 !important; }
            
            /* Reset Body */
            html, body { height: 100vh; width: 100vw; overflow: hidden; margin: 0; padding: 0; }
            
            /* Pastikan Root App Fullscreen */
            #umroh-manager-app {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                width: 100vw; height: 100vh;
                z-index: 999999;
                background-color: #f3f4f6;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
        return () => {
            // document.head.removeChild(style); // Opsional
        };
    }, []);
    return children;
};

const App = () => (
    <ImmersiveWrapper>
        <DataContext>
            <HashRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/departures" element={<Departures />} />
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
    </ImmersiveWrapper>
);

// --- MOUNTING LOGIC ---
const mountApp = () => {
    const containerId = 'umroh-manager-app';
    const container = document.getElementById(containerId);

    if (container) {
        // Pindahkan ke body agar aman dari CSS hide WP
        if (document.body.contains(container) && container.parentElement !== document.body) {
            document.body.appendChild(container);
        }
        
        try {
            const root = createRoot(container);
            root.render(<App />);
            console.log("✅ App Mounted Successfully");
        } catch (e) {
            console.error("❌ React Render Error:", e);
        }
    } else {
        // Jangan looping error, cukup log sekali jika memang bukan di halaman plugin
        // Cek URL apakah ini halaman plugin kita?
        if (window.location.search.includes('page=umroh-manager')) {
            console.error(`❌ Container #${containerId} tidak ditemukan di halaman plugin! Cek file PHP.`);
        }
    }
};

// Jalankan saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
} else {
    mountApp();
}