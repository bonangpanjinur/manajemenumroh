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

// Komponen Pembungkus untuk Membersihkan UI WordPress (CSS ONLY)
const ImmersiveModeWrapper = ({ children }) => {
    useLayoutEffect(() => {
        // Buat Style Element untuk Override CSS secara Agresif
        const styleId = 'umroh-immersive-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            
            style.innerHTML = `
                /* 1. Sembunyikan Elemen UI Bawaan WordPress */
                #wpadminbar, 
                #adminmenumain, 
                #adminmenuback, 
                #adminmenuwrap, 
                #wpfooter, 
                .update-nag, 
                .notice, 
                .error, 
                .updated { 
                    display: none !important; 
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    z-index: -9999 !important;
                    height: 0 !important;
                    width: 0 !important;
                    position: absolute !important;
                }

                /* 2. Sembunyikan Wrapper Konten WP (tapi jangan display:none body) */
                #wpcontent, #wpbody, #wpbody-content, .wrap {
                    margin: 0 !important;
                    padding: 0 !important;
                    opacity: 0 !important; 
                    height: 0 !important;
                    overflow: hidden !important;
                    pointer-events: none !important;
                }
                
                /* 3. Reset Body agar Full Screen untuk App Kita */
                html, body { 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    height: 100vh !important; 
                    width: 100vw !important;
                    overflow: hidden !important; /* Mencegah scroll dari body WP */
                    background-color: #f3f4f6 !important;
                }

                /* 4. Pastikan App Container Selalu Tampil & Full Screen */
                #umroh-manager-app {
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: auto !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 2147483647 !important; /* Z-Index Maksimum Browser */
                    overflow-y: auto !important;
                    background-color: #f3f4f6;
                }
            `;
            document.head.appendChild(style);
        }
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

// --- MOUNTING LOGIC (PERBAIKAN UTAMA DI SINI) ---

const initApp = () => {
    const containerId = 'umroh-manager-app';
    const container = document.getElementById(containerId);

    if (container) {
        // TEKNIK PENYELAMATAN:
        // Pindahkan container aplikasi keluar dari dalam div WordPress (#wpcontent/wrap)
        // Langsung tempel ke <body> agar tidak ikut tersembunyi oleh CSS Immersive kita.
        if (document.body.contains(container) && container.parentElement !== document.body) {
            document.body.appendChild(container);
        }

        // Render React
        const root = createRoot(container);
        root.render(<App />);
    } else {
        // Jika masih tidak ketemu, coba lagi sedikit nanti (Fallback)
        console.warn(`Container #${containerId} belum siap. Mencoba ulang...`);
        setTimeout(initApp, 500); 
    }
};

// Pastikan DOM sudah siap sebelum menjalankan script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}