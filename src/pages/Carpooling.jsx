import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Calendar, Clock, Truck, PlusCircle, Search, ArrowRight, ArrowLeft, Shield, ShieldCheck, Menu, Loader2, IndianRupee, Users, CreditCard, ChevronRight, CheckCircle2, Navigation, Send, X, Inbox, Star, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LocationInput from '../components/LocationInput';
import MapLibreMap from '../components/MapLibre';
import RatingModal from '../components/RatingModal';
import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';
import { getMyRequests, getMyRides, rateRide, searchRides, requestRide, publishSeek, approveRequest } from '../services/carpoolService';

const Carpooling = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('find');
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [myRequests, setMyRequests] = useState([]);
    const [myOfferedRides, setMyOfferedRides] = useState([]);
    const [availableRides, setAvailableRides] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [rideToRate, setRideToRate] = useState(null);
    const navigate = useNavigate();

    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [loadingCoords, setLoadingCoords] = useState(false);
    const startFromSuggestion = useRef(false);
    const endFromSuggestion = useRef(false);

    useEffect(() => {
        fetchMyRequests();
        const interval = setInterval(() => {
            fetchMyRequests();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchMyRequests = async () => {
        try {
            const data = await getMyRequests();
            const offeredData = await getMyRides();
            setMyOfferedRides(offeredData);
            setMyRequests(data);
        } catch (error) {
            console.error("Failed to fetch my requests", error);
        }
    };

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


    const handleRateSubmit = async ({ rating, review }) => {
        if (rideToRate) {
            await rateRide(rideToRate.ride_id, rating, review);
        }
    };
    
    const handlePublishSeek = async (e) => {
        if(e) e.preventDefault();
        if (!startLocation || !endLocation || !searchDate) {
            alert("Please enter starting point, destination, and date to publish your search.");
            return;
        }
        try {
            const departureDateTime = new Date(`${searchDate}T00:00:00`).toISOString();
            await publishSeek({
                start_location: startLocation,
                end_location: endLocation,
                departure_date: departureDateTime
            });
            alert("Search published! Drivers traveling this route will now see you in their Waiting Room.");
        } catch (error) {
            console.error("Failed to publish seek", error);
            alert("Failed to publish search.");
        }
    };

    const handleSearch = async (e) => {
        if(e) e.preventDefault();
        if (!startLocation || !endLocation) {
            alert("Please enter both starting point and destination.");
            return;
        }
        setIsSearching(true);
        setHasSearched(false);
        try {
            const results = await searchRides(startLocation, endLocation);
            setAvailableRides(results);
        } catch (error) {
            console.error("Failed to search rides", error);
            alert("Failed to search for rides.");
        } finally {
            setIsSearching(false);
            setHasSearched(true);
        }
    };

    const handleRequestRide = async (rideId) => {
        try {
            await requestRide(rideId);
            alert("Request sent successfully! The driver will be notified.");
            fetchMyRequests(); // Refetch so it immediately shows up
        } catch (error) {
            console.error("Failed to request ride", error);
            alert(error.response?.data?.detail || "Failed to request ride.");
        }
    };

    const handleAcceptInvite = async (requestId) => {
        try {
            await approveRequest(requestId);
            const data = await getMyRequests();
            setMyRequests(data);
            const req = data.find(r => r.request_id === requestId);
            if (req && req.status === 'APPROVED') {
                navigate('/live-carpool', {
                    state: {
                        ride: req.ride,
                        partner: { ...(req.ride?.driver || { name: 'Driver' }), request_id: req.request_id },
                        role: 'rider'
                    }
                });
            } else {
                alert("Invite accepted! You are now joined to this ride.");
            }
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to accept invite.");
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter text-gray-900">
                        She<span className="text-pink-600">Connect</span>
                    </h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600 focus:outline-none">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                    
                    {/* Tabs */}
                    <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-full md:w-fit overflow-x-auto mb-8 mx-auto">
                        <button 
                            onClick={() => setActiveTab('find')}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === 'find' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Find a Ride
                        </button>
                        <button 
                            onClick={() => setActiveTab('offer')}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === 'offer' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
                            }`}
                        >
                            Offer a Ride
                        </button>

                    </div>

                    {activeTab === 'find' && (
                        <>
                            {/* Map Section */}
                            <div className="mb-8 relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-[24px] blur opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                                <div className="relative bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/20">
                                    <div className="absolute top-4 left-4 z-10">
                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100/50 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Carpool Route</span>
                                        </div>
                                    </div>
                                    {loadingCoords ? (
                                        <div className="h-[450px] flex flex-col items-center justify-center bg-gray-50 gap-4">
                                            <Users className="animate-bounce text-pink-400" size={32} />
                                            <div className="text-sm font-medium text-gray-400">Loading map...</div>
                                        </div>
                                    ) : (
                                        <MapLibreMap startCoords={startCoords} endCoords={endCoords} showSOS={false} />
                                    )}
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="bg-white/70 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 relative overflow-hidden mb-8">
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                                        <div>
                                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                                Find a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Carpool</span>
                                            </h1>
                                            <p className="mt-2 text-gray-500 font-medium">Join verified women drivers on their regular commute.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSearch} className="space-y-8">
                                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                                                    placeholder="Leaving from..."
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
                                                    placeholder="Going to..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                            <div className="space-y-1">
                                                <label className="block text-sm font-bold text-gray-700 ml-1">
                                                    Departure Date
                                                </label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                                                    <input 
                                                        type="date" 
                                                        value={searchDate}
                                                        onChange={e => setSearchDate(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all hover:bg-white hover:border-gray-300"
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex flex-col md:flex-row gap-4">
                                            <button
                                                type="submit"
                                                disabled={isSearching}
                                                className="flex-1 relative group overflow-hidden py-4 px-6 rounded-2xl transition-all duration-300 bg-gray-900 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] disabled:opacity-70"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <span className="relative flex items-center justify-center text-white font-bold text-lg">
                                                    {isSearching ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={24} /> Searching...</span> : <span className="flex items-center gap-2"><Search size={24} /> Search Rides</span>}
                                                </span>
                                            </button>
                                            
                                        </div>
                                    </form>
                                </div>
                                {/* Decorative */}
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
                            </div>

                            {/* Empty State for No Results */}
                            {hasSearched && availableRides.length === 0 && (
                                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[28px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full text-gray-400 mb-4 border border-gray-100">
                                            <Search size={28} />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">No Rides Found</h3>
                                        <p className="text-gray-500 font-medium">We couldn't find any drivers on this route right now. Try publishing your need so drivers can find you!</p>
                                    </div>
                                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-pink-50 rounded-full blur-[50px] opacity-50 pointer-events-none"></div>
                                </div>
                            )}

                            {/* Search Results Matches Style */}
                            {availableRides.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Available Rides</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {availableRides.map(ride => (
                                            <div key={ride.ride_id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                    
                                                    <div className="flex items-start sm:items-center gap-4 w-full">
                                                        <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 font-black text-xl border border-pink-100 shrink-0">
                                                            {ride.driver?.name?.charAt(0) || 'D'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between w-full mb-1">
                                                                <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                                                                    {ride.driver?.name || 'Driver'}
                                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                                    {ride.driver?.rating && (
                                                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                                                                            <Star size={10} className="fill-yellow-400 text-yellow-500" />
                                                                            <span className="text-[10px] font-bold text-yellow-700">{ride.driver.rating}</span>
                                                                        </div>
                                                                    )}
                                                                </h4>
                                                                <div className="text-right">
                                                                    <p className="text-lg font-black text-pink-600">₹{ride.price_per_seat}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-bold">
                                                                <div className="flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg">
                                                                    <MapPin size={12} />
                                                                    <span>{ride.start_location?.split(',')[0]} → {ride.end_location?.split(',')[0]}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    <span>{new Date(ride.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-purple-600">
                                                                    <Users size={12} /><span>{ride.available_seats} Seats</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {(() => {
                                                        const existingRequest = myRequests.find(r => r.ride?.ride_id === ride.ride_id);
                                                        
                                                        if (existingRequest) {
                                                            if (existingRequest.status === 'APPROVED' && existingRequest.ride?.status !== 'COMPLETED') {
                                                                const completedRides = JSON.parse(localStorage.getItem('completedCarpools') || '[]');
                                                                if (!completedRides.includes(existingRequest.ride?.ride_id)) {
                                                                    return (
                                                                        <button 
                                                                            onClick={() => navigate('/live-carpool', {
                                                                                state: {
                                                                                    ride: existingRequest.ride,
                                                                                    partner: { ...(existingRequest.ride?.driver || { name: 'Driver' }), request_id: existingRequest.request_id },
                                                                                    role: 'rider'
                                                                                }
                                                                            })}
                                                                            className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 bg-green-600 text-white hover:shadow-lg hover:bg-green-700 w-full sm:w-auto"
                                                                        >
                                                                            Start Trip <ArrowRight size={16} />
                                                                        </button>
                                                                    );
                                                                }
                                                            }
                                                            return (
                                                                <button 
                                                                    disabled
                                                                    className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 bg-gray-100 text-gray-400 w-full sm:w-auto"
                                                                >
                                                                    Requested
                                                                </button>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <button 
                                                                onClick={() => handleRequestRide(ride.ride_id)}
                                                                className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 bg-gray-900 text-white hover:shadow-lg bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 w-full sm:w-auto"
                                                            >
                                                                Request to Join <ArrowRight size={16} />
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'offer' && (
                        <div className="bg-white/70 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-12 text-center relative overflow-hidden">
                             <div className="relative z-10 space-y-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 text-pink-500 rounded-full mb-2">
                                    <Car size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Propose a Ride</h2>
                                <p className="text-gray-500 font-medium max-w-md mx-auto">Drive and share your expenses on your regular commute. Get matched with riders automatically.</p>
                                <button 
                                    onClick={() => navigate('/offer-ride')}
                                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-lg hover:shadow-gray-300 transition-all mt-4"
                                >
                                    Create Route <ArrowRight size={18} />
                                </button>
                             </div>
                             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
                        </div>
                    )}


                </div>
            </main>
            
            <RatingModal 
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleRateSubmit}
                driverName={rideToRate?.driver?.name}
            />
        </div>
    );
};

export default Carpooling;
