import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className={`animate-spin rounded-full border-t-pink-600 border-gray-200 ${sizes[size]}`}></div>
        </div>
    );
};

export default Loader;
