import React, { useEffect } from 'react';
import GlobalErrorAlert from './GlobalErrorAlert';

const Layout = ({ children, title }) => {
    // Efek samping: Update title browser tab jika diperlukan
    useEffect(() => {
        if (title) {
            document.title = `${title} - Umroh Manager`;
        }
    }, [title]);

    // Layout ini sekarang "dumb", hanya sebagai wrapper konten.
    // Sidebar dan Header sudah ditangani di level App (index.jsx) untuk mencegah duplikasi.
    return (
        <div className="max-w-7xl mx-auto">
            {/* Global Error Handler tetap di sini agar muncul di atas konten */}
            <GlobalErrorAlert />
            
            {/* Konten Halaman */}
            <div className="animate-fade-in">
                {children}
            </div>
        </div>
    );
};

export default Layout;