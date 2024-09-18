import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
    return message ? (
        <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md transition-all duration-300">
            <AlertTriangle className="w-5 h-5 mr-2 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">{message}</span>
        </div>
    ) : null;
};

export default ErrorMessage;