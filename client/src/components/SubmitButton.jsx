import React from 'react';
import { Search } from 'lucide-react';

const SubmitButton = ({ loading }) => (
    <div className='text-white'>
        <button 
            type="submit" 
            disabled={loading} 
            className="flex items-center justify-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 rounded-lg text-sm sm:text-lg hover:bg-purple-700 hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
            {loading ? (
                <>
                    <Search size={20} className="animate-spin" />
                    <span className="text-xs sm:text-base">Searching...</span>
                </>
            ) : (
                <>
                    <Search size={20} />
                    <span className="text-xs sm:text-base">Click me!</span>
                </>
            )}
        </button>
    </div>
);

export default SubmitButton;
