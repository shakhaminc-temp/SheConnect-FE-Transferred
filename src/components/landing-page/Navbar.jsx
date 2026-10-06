import React, { useState } from 'react';

const Navbar = ({ onAuthClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                            She Connect
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <a href="#home" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">Home</a>
                        <a href="#about" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">About Us</a>
                        <a href="#services" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">Our Services</a>
                        <button
                            onClick={onAuthClick}
                            className="bg-pink-600 text-white px-5 py-2 rounded-full font-medium hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-md"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-pink-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center shadow-lg">
                        <a href="#home" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors" onClick={() => setIsOpen(false)}>Home</a>
                        <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors" onClick={() => setIsOpen(false)}>About Us</a>
                        <a href="#services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors" onClick={() => setIsOpen(false)}>Our Services</a>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onAuthClick();
                            }}
                            className="w-full mt-2 bg-pink-600 text-white px-5 py-2 rounded-full font-medium hover:bg-pink-700 transition-colors shadow-sm"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
