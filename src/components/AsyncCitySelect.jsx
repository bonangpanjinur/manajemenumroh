import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader, X } from 'lucide-react';
// import { api } from '../utils/api'; // Enable this if using real API

const AsyncCitySelect = ({ value, onChange, placeholder = "Cari Kota..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Jika value sudah ada (misal saat edit), set query ke value tersebut
  useEffect(() => {
    if (value) {
        setQuery(value);
    }
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 3 && isOpen) {
        searchCities(query);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const searchCities = async (searchTerm) => {
    setLoading(true);
    try {
      // NOTE: Ganti URL ini dengan endpoint API Master Kota Anda yang sebenarnya.
      // Contoh: const response = await api.get(`/masters?type=city&search=${searchTerm}`);
      
      // MOCK DATA sementara agar UI berfungsi (Hapus ini jika API sudah siap)
      const mockCities = [
        "Jakarta Selatan", "Jakarta Pusat", "Jakarta Barat", 
        "Bandung", "Surabaya", "Semarang", "Yogyakarta", 
        "Makassar", "Medan", "Denpasar", "Bekasi", "Depok"
      ].filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

      setResults(mockCities);
      
    } catch (error) {
      console.error("Error fetching cities:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (city) => {
    setQuery(city);
    onChange(city);
    setIsOpen(false);
  };

  const handleClear = () => {
      setQuery('');
      onChange('');
      setResults([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        className="pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {query && (
         <button 
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
         >
             <X className="h-4 w-4" />
         </button>
      )}

      {isOpen && (results.length > 0 || loading) && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {loading ? (
             <li className="text-gray-500 cursor-default select-none relative py-2 pl-3 pr-9 flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" /> Mencari...
             </li>
          ) : (
            results.map((city, index) => (
                <li
                key={index}
                className="text-gray-900 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                onClick={() => handleSelect(city)}
                >
                <span className="font-normal block truncate">
                    {city}
                </span>
                </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AsyncCitySelect;