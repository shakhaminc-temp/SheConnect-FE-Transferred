import React, { useState } from 'react';
import {
    Home as HomeIcon,
    MapPin,
    FileText,
    Shield,
    Users,
    UserPlus,
    ArrowRight,
    Menu,
    Compass,
    Star,
    Clock,
    Hourglass
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const featuredActions = [
        {
            title: "Start a Trip",
            desc: "Plan your route and find verified female partners.",
            icon: MapPin,
            path: "/start-trip",
            color: "bg-pink-600",
            lightColor: "bg-pink-50"
        },
        {
            title: "Community Blogs",
            desc: "Read safety tips and stories from fellow travelers.",
            icon: FileText,
            path: "/blogs",
            color: "bg-blue-600",
            lightColor: "bg-blue-50"
        },
        {
            title: "Waiting Room",
            desc: "Find and connect with travel partners on your route.",
            icon: Hourglass,
            path: "/waiting-room",
            color: "bg-purple-600",
            lightColor: "bg-purple-50"
        }
    ];

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter">She<span className="text-pink-600">Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">
                    {/* Hero Section */}
                    <div className="relative bg-white p-8 md:p-12 rounded-[48px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-pink-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-100 rounded-full blur-[120px] opacity-40"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-pink-100">
                                    <Star size={14} className="fill-pink-600" />
                                    <span>Welcome, {user?.name || 'Explorer'}</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                                    Your Safe Journey <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600">Starts Here.</span>
                                </h2>
                                <p className="text-gray-500 text-lg font-medium max-w-lg leading-relaxed">
                                    Connect with verified female travelers, share your experiences, and explore the world with confidence and safety.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Link to="/start-trip" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center gap-2 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="relative flex items-center gap-2">
                                            Start Your Trip <ArrowRight size={18} />
                                        </span>
                                    </Link>
                                    <Link to="/blogs" className="px-8 py-4 bg-white text-gray-900 border border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                                        Explore Stories
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:flex flex-1 justify-center relative">
                                <div className="w-80 h-80 bg-gradient-to-br from-pink-500 to-rose-500 rounded-[64px] shadow-2xl rotate-6 flex items-center justify-center relative group overflow-hidden">
                                    <Compass size={120} className="text-white opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <HomeIcon size={80} className="text-white drop-shadow-2xl -rotate-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={index}
                                    to={action.path}
                                    className="bg-white p-8 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-white hover:border-pink-100 transition-all group"
                                >
                                    <div className={`${action.lightColor} ${action.color.replace('bg-', 'text-')} w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                                        <Icon size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">{action.title}</h3>
                                    <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6">
                                        {action.desc}
                                    </p>
                                    <div className="flex items-center text-pink-600 font-black text-xs uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Access Now <ArrowRight size={14} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Safety Notice Footer */}
                    <div className="bg-gray-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full blur-[120px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-5 rounded-3xl shadow-xl shadow-pink-900/40">
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black tracking-tight mb-2">Our Safety Promise</h4>
                                    <p className="text-gray-400 font-medium max-w-md">
                                        Every traveler on SheConnect is identity-verified. We're committed to creating a secure community for women globally.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-4 border border-white/10">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-pink-100 flex items-center justify-center overflow-hidden">
                                            <Users size={18} className="text-pink-600" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-pink-400">
                                    5.2k+ Verified Members
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
