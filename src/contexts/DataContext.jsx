import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('guest'); 
    const [loading, setLoading] = useState(true);

    // Fungsi Cek Auth (Saat refresh halaman)
    const checkAuth = async () => {
        setLoading(true);
        try {
            // Panggil API /auth/me yang baru
            const userData = await api.get('/auth/me');
            setUser(userData);
            setRole(userData.role || 'guest');
        } catch (error) {
            console.log("User belum login");
            setUser(null);
            setRole('guest');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Fungsi Login (Dipanggil dari form Login)
    const login = (userData) => {
        setUser(userData);
        setRole(userData.role);
    };

    // Fungsi Logout
    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            setRole('guest');
            // Redirect biasanya dihandle di komponen UI
        } catch (e) {
            console.error(e);
        }
    };

    const value = {
        user,
        role,
        loading,
        login,
        logout,
        isAdmin: role === 'administrator',
        isAgent: role === 'agent',
        isJamaah: role === 'jamaah',
        checkAuth
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};