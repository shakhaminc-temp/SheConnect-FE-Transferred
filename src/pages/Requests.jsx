import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
    User,
    Menu,
    X as CloseIcon,
    ArrowRight,
    MapPin,
    Clock,
    UserPlus,
    Truck,
    Shield,
    CheckCircle2,
    XCircle,
    Send,
    Eye,
    ChevronDown,
    ChevronUp,
    Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip, TRIP_STATUS, REQUEST_STATUS } from '../context/TripContext';
import { useNavigate } from 'react-router-dom';
import PrivacyModal from '../components/common/PrivacyModal';

const Requests = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const {
        tripStatus,
        activeTrip,
        receivedRequests,
        sentRequests,
        matches,
        acceptRequest,
        declineRequest,
        cancelRequest,
        connectedPartner,
        privacyChoice,
        setPrivacyChoice,
    } = useTrip();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('received');
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [expandedProfile, setExpandedProfile] = useState(null);

    const handleAcceptClick = (request) => {
        setSelectedRequest(request);
        setShowPrivacyModal(true);
    };

    const handlePrivacyConfirm = (selectedPrivacyChoice) => {
        if (!selectedRequest) return;
        setPrivacyChoice(selectedPrivacyChoice);
        acceptRequest(selectedRequest.id, selectedPrivacyChoice);
        setShowPrivacyModal(false);
        setSelectedRequest(null);
        // Navigate after a small delay for the state to update
        setTimeout(() => {
            navigate('/live-connection');
        }, 100);
    };

    const handleDecline = (requestId) => {
        declineRequest(requestId);
    };

    // Filter only pending received requests
    const pendingReceived = receivedRequests.filter(r => r.status === 'pending' || r.status === REQUEST_STATUS.PENDING);

    // Build sent requests display from context (only pending or accepted, excluded cancelled/rejected)
    const sentDisplay = sentRequests
        .filter(sr => sr.status === 'PENDING' || sr.status === 'ACCEPTED' || sr.status === REQUEST_STATUS?.PENDING || sr.status === REQUEST_STATUS?.ACCEPTED)
        .map(sr => {
            const matchData = matches.find(m => m.id === sr.matchId) || {};
            return { ...sr, ...matchData };
        });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user && !loading) {
        return <div className="p-10 text-center">Please login to view requests.</div>;
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

                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-pink-600 font-bold uppercase tracking-widest text-xs mb-2">Travel Partners</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                Trip <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Requests</span> 🤝
                            </h2>
                            <p className="mt-2 text-gray-500 font-medium font-sans">Connect with verified partners to start your safe journey.</p>
                        </div>
                    </div>

                    {/* My Current Trip Status */}
                    {activeTrip && (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${tripStatus === TRIP_STATUS.CONNECTED ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${tripStatus === TRIP_STATUS.CONNECTED ? 'text-green-400' : 'text-amber-300'}`}>
                                            {tripStatus === TRIP_STATUS.CONNECTED ? 'Connected' : tripStatus}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white leading-tight">
                                        {activeTrip.start} <ArrowRight className="inline-block mx-2 text-pink-500" size={24} /> {activeTrip.end}
                                    </h3>
                                    <div className="flex items-center gap-6 text-sm text-gray-400 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Truck size={16} className="text-pink-500" />
                                            <span className="capitalize">{activeTrip.mode}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => navigate('/waiting-room')}
                                        className="px-6 py-4 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
                                    >
                                        Waiting Room
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'received' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Received {pendingReceived.length > 0 && <span className="ml-2 bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingReceived.length}</span>}
                            {activeTab === 'received' && <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 rounded-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'sent' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Sent {sentDisplay.length > 0 && <span className="ml-2 bg-gray-200 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded-full">{sentDisplay.length}</span>}
                            {activeTab === 'sent' && <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 rounded-full"></div>}
                        </button>
                    </div>

                    {/* Connect Requests Section */}
                    <div className="space-y-6">
                        {activeTab === 'received' ? (
                            <div className="grid grid-cols-1 gap-6">
                                {pendingReceived.length > 0 ? (
                                    pendingReceived.map((request) => (
                                        <div key={request.id} className="bg-white p-8 rounded-[40px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.05)] transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="absolute top-4 right-8">
                                                <span className="text-[10px] bg-pink-50 text-pink-600 font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-pink-100/50 shadow-sm">
                                                    {request.connectionType === 'details' ? 'Personal Request' : 'Anonymous Request'}
                                                </span>
                                            </div>

                                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-4 lg:mt-0">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-2xl border border-gray-100 shadow-inner group-hover:bg-pink-50 transition-colors">
                                                        {request.connectionType === 'details' ? request.name.charAt(0) : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-xl font-black text-gray-900 tracking-tight">
                                                                {request.connectionType === 'details' ? request.name : `Anonymous User`}
                                                            </h4>
                                                            {request.verified && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                                                            {request.connectionType === 'details' && (
                                                                <span className="text-[10px] bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                                    {request.college}
                                                                </span>
                                                            )}
                                                            {request.rating && (
                                                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                                    <Star size={12} className="fill-yellow-400 text-yellow-500" />
                                                                    <span className="text-xs font-bold text-yellow-700">{request.rating}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400 font-bold">
                                                            <div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-3 py-1 rounded-lg border border-pink-100/50">
                                                                <MapPin size={14} />
                                                                <span>{request.start} → {request.end}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={16} />
                                                                <span>{new Date(request.requested_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Truck size={14} />
                                                                <span className="capitalize">{request.mode}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* Profile Preview Toggle */}
                                                    <button
                                                        onClick={() => setExpandedProfile(expandedProfile === request.id ? null : request.id)}
                                                        className="py-4 px-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold flex items-center justify-center gap-2 border border-transparent hover:border-blue-100"
                                                    >
                                                        <Eye size={18} />
                                                        {expandedProfile === request.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecline(request.id)}
                                                        className="py-4 px-6 rounded-2xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold flex items-center justify-center gap-2 border border-transparent hover:border-rose-100"
                                                    >
                                                        <CloseIcon size={20} />
                                                        Decline
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptClick(request)}
                                                        className="py-4 px-8 rounded-2xl bg-gray-900 text-white font-black text-sm hover:shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-3 bg-gradient-to-r hover:from-pink-600 hover:to-rose-600"
                                                    >
                                                        Accept <ArrowRight size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* ── Expandable Profile Preview ── */}
                                            {expandedProfile === request.id && (
                                                <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Profile Verification</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Name</p>
                                                            <p className="text-sm font-bold text-gray-800">
                                                                {request.connectionType === 'details' ? request.name : 'Hidden (Anonymous)'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">College</p>
                                                            <p className="text-sm font-bold text-gray-800">
                                                                {request.connectionType === 'details' ? request.college : 'Hidden'}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Trip Route</p>
                                                            <p className="text-sm font-bold text-pink-600">{request.start} → {request.end}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Transport</p>
                                                            <p className="text-sm font-bold text-gray-800 capitalize">{request.mode}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Verified</p>
                                                            <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                                                                {request.verified ? <><CheckCircle2 size={14} className="text-green-500" /> Yes</> : <><XCircle size={14} className="text-gray-400" /> No</>}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Requested</p>
                                                            <p className="text-sm font-bold text-gray-800">{new Date(request.requested_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No Pending Requests" submessage="When other girls want to connect for a trip, they'll appear right here!" />
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {sentDisplay.length > 0 ? (
                                    sentDisplay.map((sr, idx) => (
                                        <div key={sr.matchId || idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-xl border border-gray-100">
                                                    {sr.name ? sr.name.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900">{sr.name || `User #${sr.matchId}`}</h4>
                                                    <div className="flex items-center gap-3 text-sm text-gray-400 font-bold">
                                                        {sr.start && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={12} /> {sr.start} → {sr.end}
                                                            </span>
                                                        )}
                                                        {sr.mode && (
                                                            <span className="flex items-center gap-1 capitalize">
                                                                <Truck size={12} /> {sr.mode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${sr.status === 'PENDING' || sr.status === REQUEST_STATUS?.PENDING ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                        sr.status === 'ACCEPTED' || sr.status === REQUEST_STATUS?.ACCEPTED ? 'bg-green-50 text-green-600 border border-green-200' :
                                                            'bg-gray-50 text-gray-500 border border-gray-200'
                                                    }`}>
                                                    {(sr.status === 'PENDING' || sr.status === REQUEST_STATUS?.PENDING) && <><Clock size={12} className="inline mr-1" />Pending</>}
                                                    {(sr.status === 'ACCEPTED' || sr.status === REQUEST_STATUS?.ACCEPTED) && <><CheckCircle2 size={12} className="inline mr-1" />Accepted</>}
                                                </div>
                                                {(sr.status === 'PENDING' || sr.status === REQUEST_STATUS?.PENDING) && (
                                                    <button
                                                        onClick={() => cancelRequest(sr.id || sr.matchId)}
                                                        className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-1"
                                                        title="Cancel this request"
                                                    >
                                                        <CloseIcon size={14} /> Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No Sent Requests" submessage="Start a trip and find partners from the Waiting Room to see your sent requests here." />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Privacy Modal */}
            <PrivacyModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                onConfirm={handlePrivacyConfirm}
                partnerName={selectedRequest?.connectionType === 'details' ? selectedRequest?.name : 'Anonymous User'}
            />
        </div>
    );
};

const EmptyState = ({ message, submessage }) => (
    <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full text-gray-300 mb-2">
            <UserPlus size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900">{message}</h3>
        <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">{submessage}</p>
    </div>
);

export default Requests;
