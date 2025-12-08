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
        // Hanya jalankan di halaman plugin kita
        if (!window.location.search.includes('page=umroh-manager')) return;

        // Suntikkan CSS Global untuk Reset Tampilan WP
        const style = document.createElement('style');
        style.id = 'umroh-immersive-css';
        style.innerHTML = `
            /* Sembunyikan elemen WP */
            #wpadminbar, #adminmenumain, #adminmenuback, #adminmenuwrap, #wpfooter, .update-nag, .notice { 
                display: none !important; 
            }
            /* Sembunyikan Wrapper Konten WP tapi tetap jaga layout */
            #wpcontent, #wpbody, #wpbody-content, .wrap { 
                margin: 0 !important; 
                padding: 0 !important; 
                height: 100vh !important; 
                width: 100vw !important;
                overflow: hidden !important;
            }
            
            /* Reset Body */
            html, body { 
                height: 100vh !important; 
                width: 100vw !important; 
                overflow: hidden !important; 
                margin: 0 !important; 
                padding: 0 !important; 
                background-color: #f3f4f6 !important;
            }
            
            /* Pastikan Root App Fullscreen */
            #umroh-manager-app {
                position: fixed !important; 
                top: 0 !important; 
                left: 0 !important; 
                right: 0 !important; 
                bottom: 0 !important;
                width: 100vw !important; 
                height: 100vh !important;
                z-index: 999999 !important;
                background-color: #f3f4f6 !important;
                overflow-y: auto !important;
                display: block !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            // Cleanup jika perlu
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

// --- MOUNTING LOGIC YANG DIPERBAIKI ---
const mountApp = () => {
    // 1. Cek Apakah Kita di Halaman Plugin?
    // Sesuaikan 'page=umroh-manager' dengan slug menu di PHP plugin Anda
    const isPluginPage = window.location.search.includes('page=umroh-manager');
    
    if (!isPluginPage) {
        // Jika bukan halaman plugin, jangan lakukan apa-apa.
        // Ini mencegah error "Container not found" di halaman admin lain.
        return;
    }

    const containerId = 'umroh-manager-app';
    let container = document.getElementById(containerId);

    // 2. Jika container belum ada, kita tunggu sebentar atau buat fallback
    if (!container) {
        console.warn(`Container #${containerId} belum siap. Mencoba mencari lagi...`);
        
        // Coba cari lagi setelah delay pendek (memberi waktu PHP render)
        setTimeout(() => {
            container = document.getElementById(containerId);
            if (container) {
                renderReact(container);
            } else {
                console.error(`Gagal menemukan container #${containerId}. Pastikan Anda berada di halaman plugin yang benar.`);
                
                // OPSI TERAKHIR: Inject container secara manual jika PHP gagal render
                // Ini "Force Mode" agar app tetap jalan
                const newContainer = document.createElement('div');
                newContainer.id = containerId;
                document.body.appendChild(newContainer);
                renderReact(newContainer);
            }
        }, 1000); // Tunggu 1 detik
        return;
    }

    renderReact(container);
};

// Fungsi Render Terpisah agar bersih
const renderReact = (container) => {
    try {
        // Pindahkan ke body agar aman dari CSS hide WP (jika belum)
        if (container.parentElement !== document.body) {
            document.body.appendChild(container);
        }
        
        const root = createRoot(container);
        root.render(<App />);
        console.log("✅ Umroh Manager App Mounted Successfully");
    } catch (e) {
        console.error("❌ React Render Error:", e);
    }
};

// Jalankan saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
} else {
    mountApp();
}