import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ onSearch, placeholder = 'Cari...' }) => {
    const [term, setTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(term);
    };
    
    // Handle pencarian saat input dikosongkan
    const handleChange = (e) => {
        setTerm(e.target.value);
        if (e.target.value === '') {
            onSearch(''); // Langsung cari saat input kosong
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-xs">
            <input
                type="text"
                value={term}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-400 hover:text-blue-600"
            >
                <Search size={18} />
            </button>
        </form>
    );
};

export default SearchInput;