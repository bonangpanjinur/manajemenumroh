import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const icons = {
    warning: <AlertTriangle size={20} />,
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
};

const colors = {
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
};

const Alert = ({ type = 'info', message }) => {
    if (!message) return null;

    return (
        <div className={`border-l-4 p-4 rounded-md ${colors[type]}`} role="alert">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {icons[type]}
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Alert;