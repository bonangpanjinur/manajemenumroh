import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import api from '../utils/api';

const AsyncCitySelect = ({ value, onChange, placeholder = "Cari Kota / Kabupaten..." }) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');
    const wrapperRef = useRef(null);

    // 1. Load Initial Label jika ada Value (ID)
    useEffect(() => {
        if (value && !selectedLabel) {
            // Fetch nama kota berdasarkan ID (jika belum ada label)
            api.get(`umh/v1/cities/${value}`).then(res => {
                if (res.data.success) {
                    const city = res.data.data;
                    setSelectedLabel(`${city.name}, ${city.province}`);
                }
            }).catch(() => {});
        }
    }, [value]);

    // 2. Handle Pencarian (Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 1 && isOpen) {
                searchCities();
            }
        }, 500); // Tunggu 500ms setelah user berhenti mengetik

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const searchCities = async () => {
        setLoading(true);
        try {
            // Panggil API dengan parameter search
            const res = await api.get(`umh/v1/cities?search=${query}&per_page=10`);
            if (res.data.success) {
                // Handle struktur data dari useCRUD (bisa array langsung atau object data)
                const list = Array.isArray(res.data.data) ? res.data.data : [];
                setOptions(list);
            }
        } catch (error) {
            console.error("Gagal cari kota", error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    // 3. Handle Klik Luar untuk menutup dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (city) => {
        const label = `${city.name}, ${city.province}`;
        setSelectedLabel(label);
        setQuery('');
        setIsOpen(false);
        onChange(city.id); // Kirim ID ke Parent
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSelectedLabel('');
        onChange('');
        setOptions([]);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Tampilan Input / Selected Value */}
            <div 
                className="input-field flex items-center justify-between cursor-text relative"
                onClick={() => { setIsOpen(true); if(!query) searchCities(); }}
            >
                {selectedLabel ? (
                    <div className="flex items-center gap-2 w-full">
                        <MapPin size={16} className="text-blue-600 shrink-0" />
                        <span className="text-gray-800 truncate">{selectedLabel}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-400 w-full">
                        <Search size={16} />
                        <input 
                            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 p-0 focus:ring-0"
                            placeholder={placeholder}
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                        />
                    </div>
                )}

                {selectedLabel && (
                    <button 
                        onClick={handleClear}
                        className="absolute right-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400 flex justify-center items-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Mencari...
                        </div>
                    ) : options.length > 0 ? (
                        <ul className="py-1">
                            {options.map((city) => (
                                <li 
                                    key={city.id}
                                    onClick={() => handleSelect(city)}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                >
                                    <div className="font-medium text-sm text-gray-800">{city.name}</div>
                                    <div className="text-xs text-gray-500">{city.province}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-400">
                            {query ? `Tidak ada kota "${query}"` : "Ketik nama kota..."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AsyncCitySelect;