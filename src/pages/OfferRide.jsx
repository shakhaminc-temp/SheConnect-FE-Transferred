import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, IndianRupee, ArrowRight, Loader2, CheckCircle2, Menu, Clock, Truck, Shield, RefreshCw, Send, X, Inbox, Star } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LocationInput from '../components/LocationInput';
import MapLibreMap from '../components/MapLibre';
import { offerRide, getRideRequests, approveRequest } from '../services/carpoolService';
import { useAuth } from '../context/AuthContext';
import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';

const OfferRide = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Form State
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [totalSeats, setTotalSeats] = useState(3);
    const [pricePerSeat, setPricePerSeat] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [loadingCoords, setLoadingCoords] = useState(false);
    const startFromSuggestion = useRef(false);
    const endFromSuggestion = useRef(false);

    // Wait Room State
    const [activeRide, setActiveRide] = useState(null);
    const [requests, setRequests] = useState([]);
    const [potentialRiders, setPotentialRiders] = useState([]);
    const [polling, setPolling] = useState(false);
    const [pollingError, setPollingError] = useState('');
    const [elapsed, setElapsed] = useState(0);

    // Geocoding effects
    useEffect(() => {
        if (startLocation.length < 3) {
            setStartCoords(null);
            startFromSuggestion.current = false;
            return;
        }
        if (startFromSuggestion.current) {
            startFromSuggestion.current = false;
            return;
        }
        const timer = setTimeout(async () => {
            const coords = await getCoordsFromLocation(startLocation);
            if (coords) setStartCoords(coords);
        }, 800);
        return () => clearTimeout(timer);
    }, [startLocation]);

    useEffect(() => {
        if (endLocation.length < 3) {
            setEndCoords(null);
            endFromSuggestion.current = false;
            return;
        }
        if (endFromSuggestion.current) {
            endFromSuggestion.current = false;
            return;
        }
        const timer = setTimeout(async () => {
            const coords = await getCoordsFromLocation(endLocation);
            if (coords) setEndCoords(coords);
        }, 800);
        return () => clearTimeout(timer);
    }, [endLocation]);


    // Load existing active ride from local storage if page refreshes
    useEffect(() => {
        const savedRide = sessionStorage.getItem('activeOfferedRide');
        if (savedRide) {
            setActiveRide(JSON.parse(savedRide));
        }
    }, []);

    // Timer for waiting room
    useEffect(() => {
        if (activeRide) {
            const interval = setInterval(() => {
                if (activeRide.created_at) {
                    setElapsed(Date.now() - new Date(activeRide.created_at).getTime());
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [activeRide]);

    const formatTime = (ms) => {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const fetchRequests = async () => {
        if (!activeRide) return;
        try {
            setPolling(true);
            setPollingError('');
            const reqs = await getRideRequests(activeRide.ride_id);
            setRequests(reqs);
            
            try {
                const { searchSeeks } = await import('../services/carpoolService');
                const seeks = await searchSeeks(activeRide.start_location, activeRide.end_location);
                setPotentialRiders(seeks);
            } catch (seekErr) {
                console.error("Error fetching potential riders:", seekErr);
            }
            
        } catch (err) {
            console.error("Error fetching requests:", err);
            setPollingError(err.response?.data?.detail || err.message || 'Unknown error');
            if (err.response?.status === 404) {
                alert("This ride no longer exists. Returning to offer form.");
                setActiveRide(null);
                setRequests([]);
                setPotentialRiders([]);
                sessionStorage.removeItem('activeOfferedRide');
                setPolling(false);
            }
        } finally {
            setPolling(false);
        }
    };

    useEffect(() => {
        let interval;
        if (activeRide && activeRide.status === 'PROPOSED') {
            fetchRequests(); 
            interval = setInterval(fetchRequests, 3000); 
        } else {
            setPolling(false);
        }
        return () => clearInterval(interval);
    }, [activeRide]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!startLocation || !endLocation || !departureDate || !departureTime || !totalSeats || !pricePerSeat) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            const datetimeString = `${departureDate}T${departureTime}:00`;
            const departureDateTime = new Date(datetimeString).toISOString();

            const rideData = {
                start_location: startLocation,
                end_location: endLocation,
                departure_time: departureDateTime,
                total_seats: parseInt(totalSeats),
                price_per_seat: parseFloat(pricePerSeat),
                tags: "safe, verified"
            };

            const createdRide = await offerRide(rideData);
            setActiveRide(createdRide);
            sessionStorage.setItem('activeOfferedRide', JSON.stringify(createdRide));
        } catch (err) {
            setError('Failed to offer ride. ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await approveRequest(requestId);
            fetchRequests();
            setActiveRide(prev => {
                const updated = { ...prev, available_seats: prev.available_seats - 1 };
                sessionStorage.setItem('activeOfferedRide', JSON.stringify(updated));
                return updated;
            });
        } catch (err) {
            alert('Failed to approve request: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleInvite = async (riderId) => {
        try {
            const { inviteRider } = await import('../services/carpoolService');
            await inviteRider(activeRide.ride_id, riderId);
            alert('Invite sent to rider!');
            fetchRequests();
        } catch (err) {
            alert('Failed to invite rider: ' + (err.response?.data?.detail || err.message));
        }
    };

    const endWait = () => {
        setActiveRide(null);
        setRequests([]);
        sessionStorage.removeItem('activeOfferedRide');
        navigate('/carpooling');
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative">
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter">She<span className="text-pink-600">Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
                    {!activeRide ? (
                        <>
                            {/* Map Section */}
                            <div className="mb-8 relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-[24px] blur opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                                <div className="relative bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/20">
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100/50 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Route Preview</span>
                                        </div>
                                    </div>
                                    {loadingCoords ? (
                                        <div className="h-[450px] flex flex-col items-center justify-center bg-gray-50 gap-4">
                                            <Users className="animate-bounce text-pink-400" size={32} />
                                            <div className="text-sm font-medium text-gray-400">Personalizing your map...</div>
                                        </div>
                                    ) : (
                                        <MapLibreMap startCoords={startCoords} endCoords={endCoords} showSOS={false} />
                                    )}
                                </div>
                            </div>

                            {/* Offer Form */}
                            <div className="bg-white/70 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-4xl font-black mb-2 text-gray-900 tracking-tight leading-tight">Propose a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Ride</span></h2>
                                    <p className="text-gray-500 font-medium mb-8">Set your route, time, and seats to find passengers along your way.</p>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-50">
                                            <div className="relative z-50">
                                                <LocationInput 
                                                    label="Starting Point"
                                                    value={startLocation}
                                                    onChange={(val, coords) => {
                                                        setStartLocation(val);
                                                        if (coords) {
                                                            const isDifferent = !startCoords || startCoords[0] !== coords[0] || startCoords[1] !== coords[1];
                                                            if (isDifferent) {
                                                                startFromSuggestion.current = true;
                                                                setStartCoords(coords);
                                                            }
                                                        }
                                                    }}
                                                    placeholder="Where are you leaving from?"
                                                />
                                            </div>
                                            <div className="relative z-40">
                                                <LocationInput 
                                                    label="Destination"
                                                    value={endLocation}
                                                    onChange={(val, coords) => {
                                                        setEndLocation(val);
                                                        if (coords) {
                                                            const isDifferent = !endCoords || endCoords[0] !== coords[0] || endCoords[1] !== coords[1];
                                                            if (isDifferent) {
                                                                endFromSuggestion.current = true;
                                                                setEndCoords(coords);
                                                            }
                                                        }
                                                    }}
                                                    placeholder="Where are you heading?"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Departure Date</label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                                                    <input 
                                                        type="date" 
                                                        value={departureDate}
                                                        onChange={e => setDepartureDate(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all hover:bg-white hover:border-gray-300"
                                                        min={new Date().toISOString().split('T')[0]}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Departure Time</label>
                                                <div className="relative group">
                                                    <Clock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                                                    <input 
                                                        type="time" 
                                                        value={departureTime}
                                                        onChange={e => setDepartureTime(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all hover:bg-white hover:border-gray-300"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Available Seats</label>
                                                <div className="relative group">
                                                    <Users className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                                                    <input 
                                                        type="number" 
                                                        min="1" max="8"
                                                        value={totalSeats}
                                                        onChange={e => setTotalSeats(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all hover:bg-white hover:border-gray-300"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 ml-1 mb-1">Price Per Seat (₹)</label>
                                                <div className="relative group">
                                                    <IndianRupee className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                                                    <input 
                                                        type="number" 
                                                        min="0" step="10"
                                                        value={pricePerSeat}
                                                        onChange={e => setPricePerSeat(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all hover:bg-white hover:border-gray-300"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button 
                                                type="submit"
                                                disabled={loading}
                                                className="w-full relative group overflow-hidden py-4 px-6 rounded-2xl transition-all duration-300 bg-gray-900 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] disabled:opacity-70"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <span className="relative flex items-center justify-center text-white font-bold text-lg">
                                                    {loading ? <Loader2 className="animate-spin" size={24} /> : <><Users className="mr-3" size={24} /> Publish Ride</>}
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
                            </div>
                        </>
                    ) : (
                        /* Waiting Room Match Style */
                        <div className="space-y-6">
                            {/* Trip Details Banner */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
                                                Waiting for Riders
                                            </span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                            {activeRide.start_location?.split(',')[0]} <ArrowRight className="inline-block mx-2 text-pink-500" size={20} /> {activeRide.end_location?.split(',')[0]}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Truck size={14} className="text-pink-500" />
                                                <span className="capitalize">Carpool</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-pink-500" />
                                                <span>{activeRide.available_seats} Seats Left</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-pink-500" />
                                                <span>{new Date(activeRide.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const firstApproved = requests.find(r => r.status === 'APPROVED');
                                                const partnerData = firstApproved ? firstApproved.rider : { name: 'Riders' };
                                                navigate('/live-carpool', {
                                                    state: {
                                                        ride: activeRide,
                                                        partner: { ...partnerData, request_id: firstApproved?.request_id },
                                                        role: 'driver'
                                                    }
                                                });
                                            }}
                                            disabled={!requests.some(r => r.status === 'APPROVED')}
                                            className="px-5 py-3 rounded-2xl bg-pink-600 text-white font-black text-xs uppercase tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none"
                                        >
                                            Start Trip
                                        </button>
                                        <button
                                            onClick={endWait}
                                            className="px-5 py-3 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
                                        >
                                            Cancel Ride
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Timer Box */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-pink-600" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Wait Time</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 tabular-nums">{formatTime(elapsed)} elapsed</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {requests.length === 0 ? (
                                        <Loader2 size={18} className="text-pink-600 animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={18} className="text-green-600" />
                                    )}
                                    <span className="text-sm font-black text-gray-900">
                                        {requests.length === 0
                                            ? 'Searching for riders on your route...'
                                            : `${requests.length} ${requests.length === 1 ? 'request' : 'requests'} found!`}
                                    </span>
                                </div>
                                <button 
                                    onClick={fetchRequests}
                                    disabled={polling}
                                    className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-pink-600 transition-colors flex items-center gap-1 hidden sm:flex"
                                >
                                    <RefreshCw size={14} className={polling ? 'animate-spin' : ''} /> Refresh
                                </button>
                            </div>

                            {/* Incoming Requests */}
                            {requests.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Inbox size={16} className="text-green-600" />
                                        <span className="text-xs font-black text-green-700 uppercase tracking-widest">
                                            Incoming Requests ({requests.length})
                                        </span>
                                    </div>
                                    {requests.map(req => (
                                        <div key={req.request_id} className="bg-green-50 p-5 rounded-2xl border border-green-200">
                                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-lg">
                                                        {req.rider?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-base font-black text-gray-900">{req.rider?.name || 'Rider'}</h4>
                                                            {req.rider?.rating && (
                                                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                                    <Star size={10} className="fill-yellow-400 text-yellow-500" />
                                                                    <span className="text-[10px] font-bold text-yellow-700">{req.rider.rating}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-bold mt-1">
                                                            <span className={`px-2 py-0.5 inline-flex rounded text-[10px] font-black uppercase tracking-widest mt-1 ${
                                                                req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                                req.status === 'PENDING_RIDER_APPROVAL' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-pink-100 text-pink-600'
                                                            }`}>
                                                                {req.status.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {req.status === 'PENDING_DRIVER_APPROVAL' || req.status === 'PENDING' ? (
                                                        <button
                                                            onClick={() => handleApprove(req.request_id)}
                                                            disabled={activeRide.available_seats <= 0}
                                                            className="px-5 py-3 rounded-xl bg-green-600 text-white font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 size={16} /> Approve
                                                        </button>
                                                    ) : req.status === 'PENDING_RIDER_APPROVAL' ? (
                                                        <span className="text-xs text-amber-600 font-bold uppercase tracking-widest">
                                                            Waiting for Rider
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-700 font-black text-xs uppercase tracking-widest">
                                                            <CheckCircle2 size={16} /> Approved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Potential Riders List */}
                            {potentialRiders.length > 0 && (
                                <div className="space-y-3 mt-8 pt-8 border-t border-gray-100">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Riders Looking For This Route</span>
                                    {potentialRiders.map(seek => (
                                        <div key={seek.seek_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-xl border border-gray-100 group-hover:bg-pink-50 transition-colors">
                                                        {seek.rider?.name?.charAt(0) || 'R'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-base font-black text-gray-900">{seek.rider?.name || 'Rider'}</h4>
                                                            {seek.rider?.rating && (
                                                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                                    <Star size={10} className="fill-yellow-400 text-yellow-500" />
                                                                    <span className="text-[10px] font-bold text-yellow-700">{seek.rider.rating}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-bold">
                                                            <div className="flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg">
                                                                <MapPin size={12} />
                                                                <span>{seek.start_location?.split(',')[0]} → {seek.end_location?.split(',')[0]}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-purple-500">
                                                                <Calendar size={12} />
                                                                <span>Wants to go on {new Date(seek.departure_date).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleInvite(seek.rider_id)}
                                                    disabled={activeRide.available_seats <= 0 || requests.some(r => r.rider_id === seek.rider_id)}
                                                    className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 bg-gray-900 text-white hover:shadow-lg bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
                                                >
                                                    {requests.some(r => r.rider_id === seek.rider_id) ? (
                                                        <><Send size={14} /> Invited</>
                                                    ) : (
                                                        <><Send size={14} /> Invite Rider</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {requests.length === 0 && potentialRiders.length === 0 && (
                                <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-50 rounded-full text-pink-300 mb-2">
                                        <Users size={28} className="animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">Waiting for Riders...</h3>
                                    <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">
                                        Your ride is active. We will notify you when a rider makes a request.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OfferRide;
