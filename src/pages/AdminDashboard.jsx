import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldAlert, Users, School, Car, AlertTriangle, LogOut, CheckCircle,
    Search, RefreshCw, MapPin
} from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Admin State
    const [admin, setAdmin] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'users', 'colleges'
    const [loading, setLoading] = useState(true);

    // SOS Alerts State
    const [sosAlerts, setSosAlerts] = useState([]);
    const [sosFilter, setSosFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Users State
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');

    // Colleges State
    const [colleges, setColleges] = useState([]);
    const [newCollegeName, setNewCollegeName] = useState('');

    // Load Admin Profile from Storage
    useEffect(() => {
        const storedUser = localStorage.getItem('sheconnect_admin_user');
        const token = localStorage.getItem('sheconnect_admin_token');
        if (!storedUser || !token) {
            navigate('/admin/login');
            return;
        }
        setAdmin(JSON.parse(storedUser));
    }, [navigate]);

    // Setup headers helper
    const getHeaders = useCallback(() => {
        const token = localStorage.getItem('sheconnect_admin_token');
        return { Authorization: `Bearer ${token}` };
    }, []);

    // Fetch Dashboard Stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/admin/dashboard-stats', { headers: getHeaders() });
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, [getHeaders]);

    // Fetch SOS Alerts
    const fetchSOSAlerts = useCallback(async () => {
        try {
            const url = sosFilter ? `/admin/sos-alerts?status_filter=${sosFilter}` : '/admin/sos-alerts';
            const res = await api.get(url, { headers: getHeaders() });
            setSosAlerts(res.data);
        } catch (err) {
            console.error('Failed to fetch SOS alerts:', err);
        }
    }, [sosFilter, getHeaders]);

    // Fetch Users
    const fetchUsers = useCallback(async () => {
        try {
            const url = userSearch ? `/admin/users?search=${encodeURIComponent(userSearch)}` : '/admin/users';
            const res = await api.get(url, { headers: getHeaders() });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }, [userSearch, getHeaders]);

    // Fetch Colleges
    const fetchColleges = useCallback(async () => {
        try {
            const res = await api.get('/admin/colleges', { headers: getHeaders() });
            setColleges(res.data);
        } catch (err) {
            console.error('Failed to fetch colleges:', err);
        }
    }, [getHeaders]);

    // Initial Load & Polling for SOS (Safety First)
    useEffect(() => {
        if (!admin) return;
        setLoading(true);
        Promise.all([fetchStats(), fetchSOSAlerts(), fetchUsers(), fetchColleges()]).finally(() => setLoading(false));

        // Poll for active emergencies every 10 seconds
        const interval = setInterval(() => {
            fetchStats();
            fetchSOSAlerts();
        }, 10000);

        return () => clearInterval(interval);
    }, [admin, fetchStats, fetchSOSAlerts, fetchUsers, fetchColleges]);

    // Handle SOS Status Update (Acknowledge / Resolve)
    const handleUpdateSOS = async (alertId, newStatus) => {
        setActionLoading(true);
        try {
            await api.patch(
                `/admin/sos-alerts/${alertId}/status`,
                { status: newStatus, resolution_notes: `Handled via Admin Console by ${admin.name}` },
                { headers: getHeaders() }
            );
            await fetchSOSAlerts();
            await fetchStats();
        } catch (err) {
            alert('Failed to update alert status: ' + (err.response?.data?.detail || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    // Handle User Status Toggle (Platform Kill-switch / Ban)
    const handleToggleUser = async (userId, currentStatus) => {
        const confirmMsg = currentStatus
            ? "Are you sure you want to suspend this user account? They will be immediately blocked from logging in or booking rides."
            : "Activate and unblock this user?";
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.patch(
                `/admin/users/${userId}/status`,
                { is_active: !currentStatus },
                { headers: getHeaders() }
            );
            await fetchUsers();
            await fetchStats();
        } catch (err) {
            alert('Failed to update user status: ' + (err.response?.data?.detail || err.message));
        }
    };

    // Handle Add College (Super Admin Only)
    const handleCreateCollege = async (e) => {
        e.preventDefault();
        if (!newCollegeName.trim()) return;
        try {
            await api.post(`/admin/colleges?name=${encodeURIComponent(newCollegeName.trim())}`, {}, { headers: getHeaders() });
            setNewCollegeName('');
            await fetchColleges();
            await fetchStats();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to onboard college');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('sheconnect_admin_token');
        localStorage.removeItem('sheconnect_admin_user');
        navigate('/admin/login');
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center text-pink-600">
                <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    return (
        <div className="min-h-screen bg-[#FFF5F7] text-gray-900 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-pink-100 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-pink-600 to-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-600/20">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-gray-900 tracking-tight">SheConnect</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isSuperAdmin ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}>
                                {isSuperAdmin ? 'Executive Super Admin' : `${admin?.college_name || 'Institute'} Admin`}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Logged in as {admin?.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-pink-200"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
                {/* Emergency Siren Banner if Active SOS Exists */}
                {stats?.active_sos > 0 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 border border-red-500 text-white flex items-center justify-between shadow-xl shadow-red-600/20 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xl">
                                🚨
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider">
                                    {stats.active_sos} Active Emergency SOS Triggered!
                                </h3>
                                <p className="text-xs text-red-100">
                                    Immediate attention required. Dispatch emergency responders or verify commuter safety.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('sos')}
                            className="px-4 py-2 bg-white text-red-700 font-black text-xs uppercase tracking-wider rounded-xl shadow hover:bg-red-50 transition-all cursor-pointer"
                        >
                            View Emergency Incident
                        </button>
                    </div>
                )}

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between text-gray-500 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Commuters</span>
                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                                <Users className="w-4 h-4 text-pink-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-gray-900">{stats?.total_users || 0}</div>
                        <div className="text-[11px] text-emerald-600 font-bold mt-1">
                            {stats?.active_users || 0} Active Verified
                        </div>
                    </div>

                    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between text-gray-500 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Carpools</span>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                <Car className="w-4 h-4 text-rose-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-gray-900">{stats?.total_rides || 0}</div>
                        <div className="text-[11px] text-gray-400 mt-1">Shared Journeys</div>
                    </div>

                    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between text-gray-500 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Active SOS Alerts</span>
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                        </div>
                        <div className={`text-2xl font-black ${stats?.active_sos > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                            {stats?.active_sos || 0}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">{stats?.total_sos || 0} All-Time Incidents</div>
                    </div>

                    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between text-gray-500 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Institution Coverage</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                <School className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-gray-900">
                            {isSuperAdmin ? stats?.total_colleges || 0 : 1}
                        </div>
                        <div className="text-[11px] text-purple-600 font-bold mt-1">
                            {isSuperAdmin ? 'Partner Universities' : admin?.college_name || 'Local Campus'}
                        </div>
                    </div>
                </div>

                {/* Dashboard Tabs Navigation */}
                <div className="flex border-b border-pink-100 gap-2 bg-white px-4 pt-2 rounded-t-2xl shadow-sm">
                    <button
                        onClick={() => setActiveTab('sos')}
                        className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'sos'
                                ? 'border-pink-600 text-pink-600 bg-pink-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Emergency SOS Logs ({sosAlerts.filter(a => a.status === 'ACTIVE').length} Active)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'users'
                                ? 'border-pink-600 text-pink-600 bg-pink-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>User Moderation & Safety</span>
                    </button>

                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab('colleges')}
                            className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'colleges'
                                    ? 'border-pink-600 text-pink-600 bg-pink-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <School className="w-4 h-4" />
                            <span>Institutions & Multi-Tenancy</span>
                        </button>
                    )}
                </div>

                {/* TAB 1: SOS INCIDENTS TABLE */}
                {activeTab === 'sos' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                                <span>Security Operations Center (SOC) Feed</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <select
                                    value={sosFilter}
                                    onChange={(e) => setSosFilter(e.target.value)}
                                    className="bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="ACTIVE">Active Only</option>
                                    <option value="ACKNOWLEDGED">Acknowledged</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="FALSE_ALARM">False Alarm</option>
                                </select>
                                <button
                                    onClick={fetchSOSAlerts}
                                    className="p-2 bg-white border border-pink-200 rounded-xl hover:bg-pink-50 text-gray-600 cursor-pointer shadow-sm"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {sosAlerts.length === 0 ? (
                            <div className="bg-white border border-pink-100 rounded-2xl p-12 text-center text-gray-400 shadow-sm">
                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
                                <p className="text-sm font-bold text-gray-800">All Clear — No Active Emergencies</p>
                                <p className="text-xs mt-1 text-gray-500">Live tracking and SOS dispatches will appear here immediately when triggered.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-pink-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#FFF5F7] text-gray-600 font-bold uppercase tracking-wider border-b border-pink-100">
                                            <tr>
                                                <th className="py-3.5 px-4">Status</th>
                                                <th className="py-3.5 px-4">Commuter</th>
                                                <th className="py-3.5 px-4">College</th>
                                                <th className="py-3.5 px-4">Location / Address</th>
                                                <th className="py-3.5 px-4">Coordinates & Accuracy</th>
                                                <th className="py-3.5 px-4">Time</th>
                                                <th className="py-3.5 px-4 text-right">Emergency Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-pink-50">
                                            {sosAlerts.map((alert) => (
                                                <tr key={alert.alert_id} className={alert.status === 'ACTIVE' ? 'bg-red-50/60' : 'hover:bg-pink-50/30'}>
                                                    <td className="py-3.5 px-4">
                                                        <span className={`px-2.5 py-1 rounded-full font-black text-[10px] tracking-wider uppercase ${
                                                            alert.status === 'ACTIVE'
                                                                ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                                                                : alert.status === 'ACKNOWLEDGED'
                                                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                                                : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                        }`}>
                                                            {alert.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-gray-900">
                                                        <div>{alert.user_name}</div>
                                                        <div className="text-[11px] text-gray-500 font-normal">{alert.user_phone || alert.user_email}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                                                        {alert.college}
                                                    </td>
                                                    <td className="py-3.5 px-4 max-w-xs truncate text-gray-700" title={alert.location_name}>
                                                        {alert.location_name || "Location Coordinates Provided"}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                                                        <div>{alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}</div>
                                                        <div className="text-[10px] text-gray-500">{alert.source || 'Hardware GPS'} {alert.accuracy ? `(±${alert.accuracy}m)` : ''}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                                                        {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <a
                                                                href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
                                                            >
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span>Map</span>
                                                            </a>
                                                            {alert.status === 'ACTIVE' && (
                                                                <button
                                                                    disabled={actionLoading}
                                                                    onClick={() => handleUpdateSOS(alert.alert_id, 'RESOLVED')}
                                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer shadow-sm"
                                                                >
                                                                    Mark Safe
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: USER MODERATION TABLE */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-black text-gray-900">Registered Female Commuters</h2>
                            <div className="relative w-72">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search by name, email, phone..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-pink-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-white border border-pink-100 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#FFF5F7] text-gray-600 font-bold uppercase tracking-wider border-b border-pink-100">
                                        <tr>
                                            <th className="py-3.5 px-4">User</th>
                                            <th className="py-3.5 px-4">Institution / College</th>
                                            <th className="py-3.5 px-4">Safety Verification</th>
                                            <th className="py-3.5 px-4">Safety Rating</th>
                                            <th className="py-3.5 px-4">Account Status</th>
                                            <th className="py-3.5 px-4 text-right">Moderation Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-pink-50">
                                        {users.map((u) => (
                                            <tr key={u.user_id} className="hover:bg-pink-50/30">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-gray-900">{u.name}</div>
                                                    <div className="text-[11px] text-gray-500 font-normal">{u.email_id} {u.phone_no ? `• ${u.phone_no}` : ''}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-700 font-medium">
                                                    {u.college}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        u.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {u.is_verified ? 'Verified Email' : 'Pending Verification'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-amber-500 font-bold">
                                                    ⭐ {u.rating}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                        u.is_active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                        {u.is_active ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => handleToggleUser(u.user_id, u.is_active)}
                                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                                                            u.is_active
                                                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        }`}
                                                    >
                                                        {u.is_active ? 'Suspend Account' : 'Activate User'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: INSTITUTIONS (SUPER ADMIN ONLY) */}
                {activeTab === 'colleges' && isSuperAdmin && (
                    <div className="space-y-6">
                        <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Onboard New University or College</h3>
                            <form onSubmit={handleCreateCollege} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newCollegeName}
                                    onChange={(e) => setNewCollegeName(e.target.value)}
                                    placeholder="Enter College Name (e.g., COEP Technological University, Pune)"
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-pink-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm"
                                >
                                    Register College
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {colleges.map((col) => (
                                <div key={col.college_id} className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                                            <School className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 uppercase">{col.college_name}</h4>
                                            <p className="text-[11px] text-gray-400 font-medium">Tenant ID #{col.college_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-pink-50 text-xs">
                                        <span className="text-gray-500">Enrolled Commuters:</span>
                                        <span className="font-bold text-gray-900">{col.total_students}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
