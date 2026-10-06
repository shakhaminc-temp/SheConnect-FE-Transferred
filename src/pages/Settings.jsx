import React, { useState } from 'react';
import { Menu, Settings as SettingsIcon, Bell, Eye, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Settings = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const settingSections = [
        {
            title: "Notifications",
            icon: Bell,
            color: "text-blue-500 bg-blue-50",
            desc: "Manage how you receive trip alerts and messages"
        },
        {
            title: "Privacy & Visibility",
            icon: Eye,
            color: "text-purple-500 bg-purple-50",
            desc: "Control who can see your travel profile and college info"
        },
        {
            title: "Safety Shield",
            icon: Shield,
            color: "text-green-500 bg-green-50",
            desc: "Configure emergency trigger settings and location sharing"
        },
        {
            title: "Help & Support",
            icon: HelpCircle,
            color: "text-orange-500 bg-orange-50",
            desc: "Contact 24/7 support or read safety guidelines"
        }
    ];

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative text-gray-900">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter">She<span className="text-pink-600">Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-4xl mx-auto p-6 md:p-10">
                    <div className="mb-10 text-gray-900">
                        <p className="text-pink-600 font-bold uppercase tracking-widest text-xs mb-2">Preferences</p>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                            App <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Settings</span> ⚙️
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-pink-50 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"></div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-50">
                                    <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-[20px] shadow-lg shadow-pink-100 text-white">
                                        <SettingsIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">App Preferences</h3>
                                        <p className="text-gray-400 font-medium font-sans">Customize your SheConnect experience</p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-gray-900">
                                    {settingSections.map((section, index) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={index}
                                                className="w-full text-gray-900 p-6 rounded-3xl border border-gray-50 hover:border-pink-100 hover:bg-pink-50/30 transition-all flex items-center justify-between group/item"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={`p-4 rounded-2xl ${section.color} transition-transform group-hover/item:scale-110`}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-black text-gray-900 tracking-tight">{section.title}</h4>
                                                        <p className="text-sm text-gray-400 font-bold font-sans">{section.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded-xl text-gray-300 group-hover/item:text-pink-600 group-hover/item:bg-pink-100 transition-all">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-10 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <h4 className="text-xl font-black mb-2">Beta Access</h4>
                            <p className="text-gray-400 font-medium leading-relaxed max-w-sm">Some advanced settings like "Dark Mode" and "Voice Alerts" are coming in the next update!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
