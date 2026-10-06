import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MapLibreMap from '../components/MapLibre';
import {
    Menu,
    Shield,
    MapPin,
    CheckCircle2,
    Navigation2,
    MessageCircle,
    Phone,
    AlertCircle,
    LogOut,
    GraduationCap,
    Eye,
    EyeOff,
    Handshake,
    Flag,
    Bell,
    AlertTriangle,
    Star,
    X,
    Car,
} from 'lucide-react';
import api from '../api/axios';
import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';
import { rateRide, completeRide } from '../services/carpoolService';
import Chatroom from '../components/Chatroom';
import useChatWebSocket from '../hooks/useChatWebSocket';

const LiveCarpoolConnection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Expecting state: { ride, partner, role }
    // role: 'rider' | 'driver'
    const state = location.state || {};
    const ride = state.ride;
    const partner = state.partner;
    const role = state.role || 'rider';

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [distance, setDistance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Simulated Trip States (like normal SheConnect)
    const [weMet, setWeMet] = useState({ me: false, partner: false });
    const [iReached, setIReached] = useState({ me: false, partner: false });
    const bothMet = weMet.me && weMet.partner;
    const bothReached = iReached.me && iReached.partner;
    const [partnerEndedTrip, setPartnerEndedTrip] = useState(false);

    const pressWeMet = () => setWeMet(prev => ({ ...prev, me: true, partner: true }));
    const pressIReached = () => setIReached(prev => ({ ...prev, me: true, partner: true }));

    // Modals
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [showCarpoolPromo, setShowCarpoolPromo] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showPartnerLeft, setShowPartnerLeft] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');

    const chatState = useChatWebSocket(partner?.id || partner?.user_id, partner?.request_id, false);

    // Redirect if no ride context
    useEffect(() => {
        if (!ride || !partner) {
            navigate('/carpooling', { replace: true });
        }
    }, [ride, partner, navigate]);

    // Both reached → open feedback form
    useEffect(() => {
        if (bothReached && !showFeedback) {
            setShowFeedback(true);
        }
    }, [bothReached]);

    // Haversine
    const calculateDistance = (coords1, coords2) => {
        if (!coords1 || !coords2) return null;
        const R = 6371;
        const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
        const dLon = (coords2[1] - coords1[1]) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    // Fetch coords after both met
    useEffect(() => {
        if (!ride) return;
        if (!bothMet) {
            setLoading(false);
            return;
        }
        async function fetchCoordinates() {
            try {
                const [routeStart, routeEnd] = await Promise.all([
                    getCoordsFromLocation(ride.start_location),
                    getCoordsFromLocation(ride.end_location)
                ]);
                setStartCoords(routeStart);
                setEndCoords(routeEnd);
                if (routeStart && routeEnd) {
                    setDistance(calculateDistance(routeStart, routeEnd));
                }
            } catch (err) {
                console.error("Error fetching coordinates:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCoordinates();
    }, [ride, bothMet]);



    const handleEndTrip = () => {
        navigate(role === 'driver' ? '/offer-ride' : '/carpooling');
    };

    const handleFeedbackSubmit = async () => {
        try {
            if (role === 'rider') {
                await rateRide(ride.ride_id, feedbackRating, feedbackText);
            } else if (role === 'driver') {
                await completeRide(ride.ride_id);
            }
            
            // Locally mark this ride as completed so the Start Trip buttons don't keep showing up
            const completedRides = JSON.parse(localStorage.getItem('completedCarpools') || '[]');
            if (!completedRides.includes(ride.ride_id)) {
                completedRides.push(ride.ride_id);
                localStorage.setItem('completedCarpools', JSON.stringify(completedRides));
            }
        } catch (err) {
            console.error("Feedback error", err);
        }
        
        setShowFeedback(false);
        navigate('/carpooling');
    };

    const emergencyAction = () => {
        const success = chatState.sendEmergency();
        if (success) {
            alert("Emergency Alert sent to your partner!");
        } else {
            alert("Failed to send alert. Connection lost.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!ride || !partner) return null;

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

                <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">

                    {/* ── Status Banner ── */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-30"></div>

                        <div className="flex items-center gap-5 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${bothMet ? 'bg-green-50 text-green-600' : 'bg-pink-50 text-pink-600'
                                }`}>
                                {bothMet ? <CheckCircle2 size={32} /> : <Navigation2 size={32} className="animate-pulse" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">
                                    {bothMet ? 'Carpool in Progress! 🚀' : 'Coordinate Meeting 🤝'}
                                </h2>
                                <p className="text-gray-400 font-medium text-sm mt-1">
                                    {bothMet
                                        ? 'You are traveling together. Press "I Reached" when you arrive.'
                                        : `Press "We Met" when you find your partner at the start point.`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* We Met Button */}
                            {!bothMet && (
                                <button
                                    onClick={pressWeMet}
                                    disabled={weMet.me}
                                    className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 ${weMet.me
                                        ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                                        : 'bg-gray-900 text-white hover:shadow-2xl group relative overflow-hidden'
                                        }`}
                                >
                                    {!weMet.me && <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                    <span className="relative flex items-center gap-3">
                                        <Handshake size={18} />
                                        {weMet.me ? 'Waiting for Partner...' : 'We Met'}
                                    </span>
                                </button>
                            )}

                            {/* I Reached Button — only after both met */}
                            {bothMet && (
                                <button
                                    onClick={pressIReached}
                                    disabled={iReached.me}
                                    className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 ${iReached.me
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default'
                                        : 'bg-gray-900 text-white hover:shadow-2xl group relative overflow-hidden'
                                        }`}
                                >
                                    {!iReached.me && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                    <span className="relative flex items-center gap-3">
                                        <Flag size={18} />
                                        {iReached.me ? 'Waiting for Partner...' : 'I Reached'}
                                    </span>
                                </button>
                            )}

                            {/* End Trip — RED button */}
                            <button
                                onClick={() => setShowEndConfirm(true)}
                                className="px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-[0_8px_16px_-4px_rgba(220,38,38,0.3)]"
                            >
                                <LogOut size={16} /> End Trip
                            </button>

                            {/* Emergency */}
                            {/* <button
                                onClick={emergencyAction}
                                className="px-6 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2 shadow-[0_8px_16px_-4px_rgba(225,29,72,0.3)]"
                            >
                                <AlertCircle size={16} /> SOS
                            </button> */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map — only after both met */}
                        <div className="lg:col-span-2">
                            {bothMet ? (
                                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[450px] relative">
                                    <div className="absolute top-6 left-6 z-10">
                                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-700">Active Route</span>
                                        </div>
                                    </div>
                                    <MapLibreMap startCoords={startCoords} endCoords={endCoords} showSOS={false} />
                                </div>
                            ) : (
                                <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center space-y-4 h-[450px] flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-300">
                                        <MapPin size={36} className="animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">Map Hidden</h3>
                                    <p className="text-gray-400 font-medium text-sm max-w-xs">
                                        Both you and your partner need to press <strong>"We Met"</strong> to reveal the route map.
                                    </p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${weMet.me ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {weMet.me ? <CheckCircle2 size={14} /> : <Handshake size={14} />}
                                            You: {weMet.me ? 'Pressed ✓' : 'Not yet'}
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${weMet.partner ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {weMet.partner ? <CheckCircle2 size={14} /> : <Handshake size={14} />}
                                            Partner: {weMet.partner ? 'Pressed ✓' : 'Not yet'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel */}
                        <div className="space-y-6">
                            {/* Chatroom */}
                            {isChatOpen ? (
                                <Chatroom partner={partner} onClose={() => setIsChatOpen(false)} chatState={chatState} />
                            ) : (
                                <>
                                    {/* Partner Card */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-pink-50 transition-colors"></div>
                                        <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                                            {role === 'driver' ? 'Rider Profile' : 'Driver Profile'} <div className="w-1 h-1 rounded-full bg-pink-600"></div>
                                        </h3>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-2xl border border-gray-100 shadow-inner group-hover:bg-pink-50 transition-colors">
                                                {partner.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 tracking-tight">{partner.name || 'Partner'}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-pink-100 text-pink-600 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                        {partner.college || 'Verified'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-50">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><MapPin size={16} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Route</p>
                                                    <p className="text-sm font-bold text-gray-700">{ride.start_location?.split(',')[0]} → {ride.end_location?.split(',')[0]}</p>
                                                </div>
                                            </div>
                                            {partner.phone && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><Phone size={16} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Contact</p>
                                                        <p className="text-sm font-bold text-gray-700">{partner.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-6">
                                            <button
                                                onClick={() => setIsChatOpen(true)}
                                                className="flex-1 py-3 bg-pink-50 text-pink-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-100 transition-colors"
                                            >
                                                <MessageCircle size={16} /> Chat
                                            </button>
                                            <button
                                                onClick={emergencyAction}
                                                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors"
                                            >
                                                <AlertCircle size={16} /> Emergency
                                            </button>
                                        </div>
                                    </div>

                                    {/* Trip Summary */}
                                    <div className="bg-gray-900 p-6 rounded-3xl text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500 rounded-full blur-[80px] opacity-10"></div>
                                        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Route</h3>
                                        <div className="space-y-4 relative z-10">
                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
                                                    <div className="w-0.5 h-8 border-l border-dashed border-white/20 my-1"></div>
                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                </div>
                                                <div className="flex flex-col justify-between py-0.5">
                                                    <div className="text-sm font-black">{ride.start_location?.split(',')[0]}</div>
                                                    <div className="text-sm font-black">{ride.end_location?.split(',')[0]}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Transport</div>
                                                <div className="text-xs font-black text-pink-400 uppercase tracking-widest capitalize">Carpool</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ══════ MODALS ══════ */}

            {/* ── End Trip Confirmation ── */}
            {showEndConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle size={36} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">End This Trip?</h3>
                        <p className="text-gray-500 font-medium text-sm">
                            Are you sure you want to end this trip? Your partner will be notified that you have left. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowEndConfirm(false);
                                    setShowFeedback(true);
                                }}
                                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-[0_8px_16px_-4px_rgba(220,38,38,0.3)]"
                            >
                                Yes, End Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Feedback Form (Both Reached) ── */}
            {showFeedback && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                        <button
                            onClick={() => { setShowFeedback(false); handleEndTrip(); }}
                            className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 size={36} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Trip Complete! 🎉</h3>
                            <p className="text-gray-400 font-medium text-sm mt-1">
                                {bothReached 
                                    ? 'You and your partner have both reached the destination. How was your experience?'
                                    : 'Please rate your experience with your partner before ending the trip.'}
                            </p>
                        </div>

                        {/* Star Rating */}
                        <div className="text-center">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Rate Your Trip</p>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setFeedbackRating(star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={36}
                                            className={`transition-colors ${star <= feedbackRating
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Text */}
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">
                                Comments (Optional)
                            </label>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Share your experience..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleFeedbackSubmit}
                            disabled={role === 'rider' && feedbackRating === 0}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${role === 'driver' || feedbackRating > 0
                                ? 'bg-gray-900 text-white hover:shadow-2xl'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Submit & Finish
                        </button>
                    </div>
                </div>
            )}

            {/* ── Emergency Alert Modal ── */}
            {chatState.emergencyAlert && (
                <div className="fixed inset-0 bg-red-900/50 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(225,29,72,0.5)] border-4 border-rose-500 space-y-6">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <AlertCircle size={48} className="text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight text-rose-600">EMERGENCY SOS</h3>
                            <p className="text-gray-700 font-bold text-base">
                                Your partner ({chatState.emergencyAlert.realName || partner?.name || 'Traveler'}) needs help immediately!
                            </p>
                            {chatState.emergencyAlert.realCollege && (
                                <p className="text-sm font-medium text-gray-600 mt-2">
                                    <span className="font-bold">College:</span> {chatState.emergencyAlert.realCollege}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => chatState.setEmergencyAlert(false)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveCarpoolConnection;
