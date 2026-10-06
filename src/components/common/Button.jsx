import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', variant = 'primary' }) => {
    const baseStyles = 'px-4 py-2 rounded-md font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
        primary: 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500',
        secondary: 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50 focus:ring-pink-500',
        outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
