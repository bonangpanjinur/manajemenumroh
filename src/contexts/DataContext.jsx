import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// PERBAIKAN: Gunakan 'export' biasa agar menjadi NAMED EXPORT
export const DataProvider = ({ children }) => {
    const [globalState, setGlobalState] = useState({
        user: null,
        settings: {},
        notifications: []
    });

    const updateGlobalState = (key, value) => {
        setGlobalState(prev => ({ ...prev, [key]: value }));
    };

    return (
        <DataContext.Provider value={{ globalState, updateGlobalState }}>
            {children}
        </DataContext.Provider>
    );
};

export default DataProvider; // Opsional: Default export juga boleh ada