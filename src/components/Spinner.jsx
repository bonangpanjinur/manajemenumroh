import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24, text }) => {
    return (
        <div className="flex justify-center items-center py-4">
            <Loader2 className="animate-spin text-blue-600" size={size} />
            {text && <span className="ml-2 text-gray-600">{text}</span>}
        </div>
    );
};

export default Spinner;