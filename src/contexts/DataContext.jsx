import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [globalLoading, setGlobalLoading] = useState(false);

    // Initial Data Load (Cek Login)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Opsional: Cek session user ke backend jika perlu
                // const res = await api.get('umh/v1/users/me');
                // setUser(res);
            } catch (error) {
                console.log("User belum login atau sesi habis");
            }
        };
        checkAuth();
    }, []);

    const value = {
        user,
        setUser,
        globalLoading,
        setGlobalLoading
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export default DataProvider;