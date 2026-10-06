import React, { useState } from 'react';
import {
    User,
    Lock,
    Save,
    Eye,
    EyeOff,
    Menu,
    ShieldCheck,
    Shield,
    Check
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        // Simulate API call
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswords({ newPassword: '', confirmPassword: '' });

        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fafc] font-sans p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-gray-100 text-center max-w-sm">
                    <User size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">Access Restricted</h3>
                    <p className="text-gray-500 font-medium">Please login to view your profile.</p>
                </div>
            </div>
        );
    }

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

                <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
                    <div className="mb-10">
                        <p className="text-pink-600 font-bold uppercase tracking-widest text-xs mb-2">Member Space</p>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Profile</span> ✨
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-gray-900">
                        <div className="lg:col-span-2 space-y-10">
                            {/* Personal Details Card */}
                            <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-pink-50 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-50">
                                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-[20px] shadow-lg shadow-pink-100 text-white">
                                            <User size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Personal Details</h3>
                                            <p className="text-gray-400 font-medium">Verified account information</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</p>
                                            <p className="text-xl font-bold text-gray-800">{user.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-xl font-bold text-gray-800">{user.email_id}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                            <p className="text-xl font-bold text-gray-800">{user.phone_no}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">College</p>
                                            <p className="text-xl font-bold text-gray-800">{user.college || 'IMCC Pune'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Password Card */}
                            <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-50">
                                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-[20px] shadow-lg shadow-gray-100 text-white">
                                            <Lock size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security</h3>
                                            <p className="text-gray-400 font-medium">Update your account password</p>
                                        </div>
                                    </div>

                                    {message.text && (
                                        <div className={`p-5 rounded-[24px] mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'error'
                                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                                : 'bg-green-50 text-green-700 border border-green-100'
                                            }`}>
                                            <div className={`p-1.5 rounded-full ${message.type === 'error' ? 'bg-rose-200' : 'bg-green-200'}`}>
                                                <ShieldCheck size={16} />
                                            </div>
                                            <span className="font-bold text-sm">{message.text}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordSubmit} className="space-y-8 max-w-xl text-gray-900">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[10px]">New Password</label>
                                            <div className="relative group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={passwords.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-semibold pr-14"
                                                    placeholder="Min. 6 characters"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-4 text-gray-300 hover:text-pink-500 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider text-[10px]">Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwords.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all font-semibold"
                                                placeholder="Repeat your password"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-gray-900 text-white px-8 py-5 rounded-2xl hover:shadow-[0_20px_40px_rgba(236,72,153,0.3)] transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 relative group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <span className="relative flex items-center gap-2">
                                                <Save size={20} />
                                                Update Password
                                            </span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Sidebar */}
                        <div className="space-y-10">
                            <div className="bg-rose-600 p-8 rounded-[40px] shadow-2xl shadow-rose-200 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="bg-white/20 p-4 rounded-[24px] shadow-inner mb-6 w-fit">
                                        <Shield size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-2">Safe Contacts</h3>
                                    <p className="text-rose-100 font-medium text-sm mb-8 leading-relaxed">Guardians alerted during emergencies.</p>

                                    <div className="space-y-4">
                                        {user.emergency_contacts && user.emergency_contacts.length > 0 ? (
                                            user.emergency_contacts.map((contact, index) => (
                                                <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-sm">{contact.emergency_name}</p>
                                                        <p className="text-xs text-rose-100 font-medium opacity-80">{contact.phone_no}</p>
                                                        {contact.email && <p className="text-xs text-rose-100 font-medium opacity-80">{contact.email}</p>}
                                                    </div>
                                                    <div className="bg-green-400 p-1.5 rounded-full shadow-lg">
                                                        <Check size={12} className="text-white" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <button className="w-full py-4 px-6 border border-white/30 rounded-2xl text-sm font-bold hover:bg-white/20 transition-all font-black">
                                                Add Contact +
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl text-white">
                                <h3 className="text-xl font-black mb-4">Security Tip 🛡️</h3>
                                <p className="text-sm font-medium leading-relaxed text-gray-400">
                                    Never share your login OTP or password with anyone, even if they claim to be from the SheConnect team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
