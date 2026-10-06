import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

                {/* Brand */}
                <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        She Connect
                    </span>
                    <p className="mt-4 text-gray-400">
                        Empowering women globally. Join us to connect, learn, and grow.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold text-white mb-2">Quick Links</h3>
                    <a href="#home" className="text-gray-400 hover:text-white transition-colors">Home</a>
                    <a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a>
                    <a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a>
                </div>

                {/* Socials / Contact */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Connect With Us</h3>
                    <div className="flex justify-center md:justify-start space-x-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                            <span className="sr-only">Twitter</span>
                            🐦
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                            <span className="sr-only">Instagram</span>
                            📸
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            💼
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} She Connect. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
