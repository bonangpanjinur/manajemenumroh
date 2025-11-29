import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setupApiErrorInterceptor } from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalError, setGlobalError] = useState(null);

    useEffect(() => {
        const initApp = async () => {
            setLoading(true);
            setError(null);
            try {
                // Load User dari global variable (disuntikkan via wp_localize_script)
                if (window.umhData && window.umhData.user) {
                    setUser(window.umhData.user);
                }

                setupApiErrorInterceptor(() => {
                    setGlobalError("Sesi Anda telah berakhir. Silakan refresh halaman.");
                });

                // Fetch data awal secara paralel, gunakan .catch agar satu gagal tidak mematikan semua
                const [statsRes, departuresRes] = await Promise.all([
                    api.get('umh/v1/stats/totals').catch(err => ({ data: {} })), 
                    api.get('umh/v1/departures', { params: { per_page: 5, status: 'scheduled', orderby: 'departure_date', order: 'asc' } }).catch(err => ({ data: { items: [] } }))
                ]);

                const totalStats = statsRes.data || {};
                
                // Normalisasi data departures (bisa array langsung atau object {items: []})
                const rawDepartures = departuresRes.data;
                const departuresList = Array.isArray(rawDepartures) 
                    ? rawDepartures 
                    : (rawDepartures && Array.isArray(rawDepartures.items) ? rawDepartures.items : []);

                setStats({
                    total_jamaah: totalStats.total_jamaah || 0,
                    active_packages: totalStats.total_packages || 0,
                    total_revenue: totalStats.total_revenue || 0,
                    upcoming_departures: departuresList.map(d => ({
                        name: d.package_name,
                        date: d.departure_date,
                        booked: d.slots_filled || (d.total_seats - d.available_seats) || 0,
                        quota: d.total_seats || 0
                    }))
                });

            } catch (err) {
                console.error("Gagal inisialisasi aplikasi:", err);
                setError("Gagal memuat data utama. Periksa koneksi internet Anda.");
            } finally {
                setLoading(false);
            }
        };

        initApp();
    }, []);

    const clearGlobalError = () => setGlobalError(null);

    const value = {
        user,
        stats, 
        loading,
        error,
        globalError,
        clearGlobalError
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;