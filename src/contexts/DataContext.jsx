import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

// Hook untuk menggunakan data
export const useData = () => {
  return useContext(DataContext);
};

// Export sebagai Named Export (PENTING untuk fix error build)
export const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [appConfig, setAppConfig] = useState({});

  // Bisa ditambahkan global state lain di sini
  const value = {
    currentUser,
    setCurrentUser,
    appConfig,
    setAppConfig
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Export default untuk kompatibilitas
export default DataProvider;