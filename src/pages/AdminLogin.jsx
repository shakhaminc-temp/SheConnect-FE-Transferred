import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/admin/auth/login', {
                email: email.trim(),
                password: password
            });

            const data = res.data;
            localStorage.setItem('sheconnect_admin_token', data.access_token);
            localStorage.setItem('sheconnect_admin_user', JSON.stringify({
                admin_id: data.admin_id,
                name: data.name,
                email: data.email,
                role: data.role,
                college_id: data.college_id,
                college_name: data.college_name
            }));

            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Admin login failed:', err);
            setError(err.response?.data?.detail || 'Invalid administrative credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
            {/* Subtle Pink/Rose ambient decorative circles */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

            {/* Login Card */}
            <div className="w-full max-w-md bg-white border border-pink-100 rounded-3xl p-8 shadow-xl shadow-pink-500/5 relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-pink-600 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-600/20 mb-4">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                        SheConnect <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 font-extrabold border border-pink-200">Admin</span>
                    </h1>
                    <p className="text-gray-500 text-xs mt-1 text-center font-medium">
                        Safety Operations & Multi-Tenant Institute Administration
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Admin Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@sheconnect.app or admin@college.edu"
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-200 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Security Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-200 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">Authenticating Console...</span>
                        ) : (
                            <>
                                <span>Sign In to Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>256-bit Encrypted RBAC Access</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
