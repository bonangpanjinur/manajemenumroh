/*
 * Lokasi File: /src/components/GlobalErrorAlert.jsx
 * File: GlobalErrorAlert.jsx
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useData } from '../contexts/DataContext.jsx'; // PERBAIKAN: Tambah ekstensi .jsx

/**
 * Komponen ini akan menampilkan pesan error global dari DataContext.
 * Diletakkan di level atas (index.jsx)
 */
const GlobalErrorAlert = () => {
    const { globalError, clearGlobalError } = useData();

    if (!globalError) {
        return null;
    }

    return (
        <div 
            className="fixed top-20 right-6 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-lg z-50 max-w-md" 
            role="alert"
        >
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium">{globalError}</p>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            onClick={clearGlobalError}
                            className="inline-flex bg-red-100 rounded-md p-1.5 text-red-500 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-100 focus:ring-red-600"
                        >
                            <span className="sr-only">Tutup</span>
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalErrorAlert;