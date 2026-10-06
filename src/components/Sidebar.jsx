import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    User,
    MapPin,
    FileText,
    Settings,
    LogOut,
    X,
    Car,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const { hasActiveTrip, endTrip } = useTrip();

    const menuItems = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/start-trip', icon: MapPin, label: 'Start Trip', indicator: hasActiveTrip },
        { path: '/carpooling', icon: Car, label: 'Carpooling', badge: 'New' },
        { path: '/chat-history', icon: MessageSquare, label: 'Chat History' },
        { path: '/blogs', icon: FileText, label: 'Blogs' },
        { path: '/profile', icon: User, label: 'Profile' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
                    <h1 className="text-2xl font-black tracking-tighter text-gray-900">
                        She<span className="text-pink-600">Connect</span>
                    </h1>
                    <button onClick={onClose} className="md:hidden text-gray-400 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100vh-100px)] justify-between p-4">
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive(item.path)
                                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 translate-x-1'
                                        : item.highlight ? 'text-pink-600 bg-pink-50 hover:bg-pink-100'
                                            : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3.5">
                                        <div className="relative">
                                            <Icon
                                                size={22}
                                                className={`${isActive(item.path) ? 'text-white' : item.highlight ? 'text-pink-600' : 'text-gray-400 group-hover:text-pink-500'} transition-colors`}
                                            />
                                            {item.indicator && !isActive(item.path) && (
                                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            )}
                                        </div>
                                        <span className={`font-semibold ${isActive(item.path) ? 'text-white' : ''}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${isActive(item.path) ? 'bg-white text-pink-600' : 'bg-pink-600 text-white'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 border-t border-gray-50 px-2 pb-6">
                        <button
                            onClick={async () => {
                                if (hasActiveTrip) {
                                    try {
                                        await endTrip();
                                    } catch (err) {
                                        console.error("Failed to end trip on logout", err);
                                    }
                                }
                                logout();
                            }}
                            className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group"
                        >
                            <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
                            <span className="font-semibold">Logout</span>
                        </button>

                        <div className="mt-8 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-[20px] border border-pink-100/50">
                            <p className="text-[11px] font-bold text-pink-600 uppercase tracking-widest mb-1">Support</p>
                            <p className="text-xs text-pink-700/70 font-medium leading-relaxed">Need help? We're here for you 24/7.</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
