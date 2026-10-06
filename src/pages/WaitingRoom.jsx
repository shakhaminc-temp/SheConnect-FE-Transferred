import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PrivacyModal from '../components/common/PrivacyModal';
import {
    Menu,
    MapPin,
    ArrowRight,
    Clock,
    Truck,
    Users,
    Shield,
    AlertTriangle,
    RefreshCw,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Send,
    Phone,
    GraduationCap,
    UserCheck,
    Eye,
    EyeOff,
    Inbox,
    X,
    Star,
} from 'lucide-react';
import { useTrip, TRIP_STATUS } from '../context/TripContext';

const WaitingRoom = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {
        tripStatus,
        activeTrip,
        matches,
        sentRequests,
        receivedRequests,
        connectedPartner,
        sendRequest,
        cancelRequest,
        acceptRequest,
        declineRequest,
        retryMatching,
        endTrip,
        emergencyAction,
        timeoutLimitMs,
        setPrivacyChoice,
    } = useTrip();

    const [elapsed, setElapsed] = useState(0);

    // Privacy modal state
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // { type: 'send' | 'accept', id: ... }

    // Redirect if no active trip
    useEffect(() => {
        if (tripStatus === TRIP_STATUS.IDLE) {
            navigate('/start-trip', { replace: true });
        }
    }, [tripStatus, navigate]);

    // Redirect when connected → Live Connection
    useEffect(() => {
        if (tripStatus === TRIP_STATUS.CONNECTED && connectedPartner) {
            navigate('/live-connection', { replace: true });
        }
    }, [tripStatus, connectedPartner, navigate]);

    // Timer
    useEffect(() => {
        if (tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) {
            const interval = setInterval(() => {
                if (activeTrip?.createdAt) {
                    setElapsed(Date.now() - new Date(activeTrip.createdAt).getTime());
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [tripStatus, activeTrip]);

    const isRequestSent = (matchId) =>
        sentRequests.some(r => r.matchId === matchId.toString() && (r.status === 'PENDING' || r.status === 'pending'));

    const getRequestStatus = (matchId) => {
        const req = sentRequests.find(r => r.matchId === matchId);
        return req?.status || null;
    };

    const formatTime = (ms) => {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    // ── Privacy Modal Handlers ──
    const handleSendClick = (matchId) => {
        setPendingAction({ type: 'send', id: matchId });
        setShowPrivacyModal(true);
    };

    const handleAcceptClick = (requestId) => {
        setPendingAction({ type: 'accept', id: requestId });
        setShowPrivacyModal(true);
    };

    const handlePrivacyConfirm = (choice) => {
        setShowPrivacyModal(false);
        if (!pendingAction) return;

        setPrivacyChoice(choice);
        if (pendingAction.type === 'send') {
            sendRequest(pendingAction.id, choice);
        } else if (pendingAction.type === 'accept') {
            acceptRequest(pendingAction.id, choice);
        }
        setPendingAction(null);
    };

    const handlePrivacyClose = () => {
        setShowPrivacyModal(false);
        setPendingAction(null);
    };

    const remaining = Math.max(0, timeoutLimitMs - elapsed);
    const progress = Math.min(100, (elapsed / timeoutLimitMs) * 100);

    if (tripStatus === TRIP_STATUS.IDLE) return null;

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

                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
                    {/* ── Trip Details Banner ── */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${tripStatus === TRIP_STATUS.TIMEOUT ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${tripStatus === TRIP_STATUS.TIMEOUT ? 'text-amber-400' : 'text-green-400'}`}>
                                        {tripStatus === TRIP_STATUS.TIMEOUT ? 'Search Timed Out' : 'Searching for Partners'}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                    {activeTrip?.start} <ArrowRight className="inline-block mx-2 text-pink-500" size={20} /> {activeTrip?.end}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-bold">
                                    <div className="flex items-center gap-2">
                                        <Truck size={14} className="text-pink-500" />
                                        <span className="capitalize">{activeTrip?.mode}</span>
                                    </div>
                                    {activeTrip?.vehicleNo && (
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-pink-500" />
                                            <span>{activeTrip.vehicleNo}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-pink-500" />
                                        <span>{new Date(activeTrip?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { endTrip(); navigate('/start-trip'); }}
                                className="px-5 py-3 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
                            >
                                Cancel Trip
                            </button>
                        </div>
                    </div>

                    {/* ── Timer Progress Bar ── */}
                    {(tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-pink-600" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Wait Time</span>
                                </div>
                                <span className="text-sm font-black text-gray-900 tabular-nums">{formatTime(remaining)} remaining</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${progress > 80 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-pink-500 to-rose-500'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* ── Timeout Overlay ── */}
                    {tripStatus === TRIP_STATUS.TIMEOUT && (
                        <div className="bg-white p-10 rounded-3xl shadow-lg border-2 border-amber-100 text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full text-amber-600 mb-2">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Search Timed Out</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto text-sm">
                                We couldn't find a match in time. You can try again or trigger emergency assistance.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button onClick={retryMatching} className="px-6 py-3 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all flex items-center justify-center gap-2 group">
                                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Check Again
                                </button>
                                <button onClick={emergencyAction} className="px-6 py-3 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                                    <AlertCircle size={16} /> Emergency
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Status Indicator ── */}
                    {(tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {matches.length === 0 ? (
                                    <Loader2 size={18} className="text-pink-600 animate-spin" />
                                ) : (
                                    <CheckCircle2 size={18} className="text-green-600" />
                                )}
                                <span className="text-sm font-black text-gray-900">
                                    {matches.length === 0
                                        ? 'Searching for travel partners on your route...'
                                        : `${matches.length} ${matches.length === 1 ? 'partner' : 'partners'} found!`}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden sm:block">
                                {activeTrip?.start} → {activeTrip?.end}
                            </span>
                        </div>
                    )}

                    {/* ── Incoming Requests ── */}
                    {receivedRequests.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Inbox size={16} className="text-green-600" />
                                <span className="text-xs font-black text-green-700 uppercase tracking-widest">
                                    Incoming Requests ({receivedRequests.length})
                                </span>
                            </div>
                            {receivedRequests.map(req => (
                                <div key={req.id} className="bg-green-50 p-5 rounded-2xl border border-green-200">
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-lg">
                                                {req.fromName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-black text-gray-900">{req.fromName}</h4>
                                                    {req.rating && (
                                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                            <Star size={10} className="fill-yellow-400 text-yellow-500" />
                                                            <span className="text-[10px] font-bold text-yellow-700">{req.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-bold mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} className="text-pink-500" />
                                                        {req.tripStart} → {req.tripEnd}
                                                    </span>
                                                    {req.fromPrivacy === 'details' && req.fromPhone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={12} className="text-blue-500" />
                                                            {req.fromPhone}
                                                        </span>
                                                    )}
                                                    {req.fromPrivacy === 'details' && req.fromCollege && (
                                                        <span className="flex items-center gap-1">
                                                            <GraduationCap size={12} className="text-purple-500" />
                                                            {req.fromCollege}
                                                        </span>
                                                    )}
                                                    {req.fromPrivacy === 'anonymous' && (
                                                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                                            <EyeOff size={10} /> Anonymous
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAcceptClick(req.id)}
                                                className="px-5 py-3 rounded-xl bg-green-600 text-white font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2"
                                            >
                                                <UserCheck size={16} /> Accept
                                            </button>
                                            <button
                                                onClick={() => declineRequest(req.id)}
                                                className="px-4 py-3 rounded-xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Matches List ── */}
                    {(tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) && matches.length > 0 && (
                        <div className="space-y-3">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Matched Partners</span>
                            {matches.map(user => (
                                <div key={user.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-xl border border-gray-100 group-hover:bg-pink-50 transition-colors">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-base font-black text-gray-900">{user.name}</h4>
                                                    {user.verified && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                                                    {user.rating && (
                                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                            <Star size={10} className="fill-yellow-400 text-yellow-500" />
                                                            <span className="text-[10px] font-bold text-yellow-700">{user.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-bold">
                                                    <div className="flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg">
                                                        <MapPin size={12} />
                                                        <span>{user.start} → {user.end}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Truck size={12} />
                                                        <span className="capitalize">{user.mode}</span>
                                                    </div>
                                                    {user.college && (
                                                        <div className="flex items-center gap-1 text-purple-500">
                                                            <GraduationCap size={12} /><span>{user.college}</span>
                                                        </div>
                                                    )}
                                                    {user.phone && (
                                                        <div className="flex items-center gap-1 text-blue-500">
                                                            <Phone size={12} /><span>{user.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isRequestSent(user.id) ? (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                                                    <Send size={14} /> Sent ✓
                                                </span>
                                                <button
                                                    onClick={() => cancelRequest(user.id)}
                                                    className="px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-1"
                                                    title="Cancel this request"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleSendClick(user.id)}
                                                className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 bg-gray-900 text-white hover:shadow-lg bg-gradient-to-r hover:from-pink-600 hover:to-rose-600"
                                            >
                                                <Send size={14} /> Send Request
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Empty State ── */}
                    {(tripStatus === TRIP_STATUS.WAITING) && matches.length === 0 && receivedRequests.length === 0 && (
                        <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-50 rounded-full text-pink-300 mb-2">
                                <Users size={28} className="animate-pulse" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900">Looking for Partners...</h3>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">
                                Open another browser tab, create the same trip, and both will discover each other automatically!
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Privacy Modal (for Send / Accept) ── */}
            <PrivacyModal
                isOpen={showPrivacyModal}
                onClose={handlePrivacyClose}
                onConfirm={handlePrivacyConfirm}
                partnerName={pendingAction?.type === 'accept' ? 'Requester' : 'Partner'}
            />
        </div>
    );
};

export default WaitingRoom;
