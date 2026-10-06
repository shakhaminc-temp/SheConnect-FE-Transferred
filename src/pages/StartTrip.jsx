import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, Users, Menu, AlertCircle, ArrowRight } from 'lucide-react';
import LocationInput from '../components/LocationInput';
import MapLibreMap from '../components/MapLibre';
import Sidebar from '../components/Sidebar';
import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';
import PrivacyModal from '../components/common/PrivacyModal';
import { useTrip, TRIP_STATUS } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { getSessionId } from '../utils/tripStorage';

const StartTrip = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        tripStatus,
        activeTrip,
        createTrip,
        endTrip,
        hasActiveTrip,
    } = useTrip();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [loadingCoords, setLoadingCoords] = useState(false);

    const [transportMode, setTransportMode] = useState('');
    const [transportNo, setTransportNo] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Track if coords were manually set from a suggestion to skip redundant geocoding
    const startFromSuggestion = useRef(false);
    const endFromSuggestion = useRef(false);

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case 'startLocation':
                if (!value || value.trim().length < 3) error = "Starting point is required (min 3 chars)";
                break;
            case 'endLocation':
                if (!value || value.trim().length < 3) error = "Destination is required (min 3 chars)";
                else if (value === startLocation) error = "Destination cannot be same as start";
                break;
            case 'transportMode':
                if (!value) error = "Please select a transport mode";
                break;
            case 'transportNo':
                // Vehicle number is optional — only validate if user enters something
                if (value && value.trim().length > 0) {
                    const cleanValue = value.replace(/\s+/g, '').toUpperCase();
                    switch (transportMode) {
                        case 'car':
                        case 'uber/cab':
                        case 'auto-rickshaw':
                            const rtoRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
                            if (!rtoRegex.test(cleanValue)) {
                                error = "Use format: MH 12 AB 1234 (10 chars)";
                            }
                            break;
                        case 'train':
                            const trainNoRegex = /^[0-9]{5}$/;
                            const trainNameRegex = /^[A-Za-z\s]+$/;
                            if (!trainNoRegex.test(value) && !trainNameRegex.test(value)) {
                                error = "Enter 5-digit number or Train Name";
                            }
                            break;
                        case 'metro':
                            const metroRegex = /^[A-Za-z\s]+$/;
                            if (!metroRegex.test(value)) {
                                error = "Please enter Metro line/name (text only)";
                            }
                            break;
                        case 'bus':
                            if (!/^[0-9]+$/.test(cleanValue)) {
                                error = "Enter bus number (digits only)";
                            }
                            break;
                        default:
                            if (value.trim().length < 3) error = "Enter valid ID (min 3 chars)";
                            break;
                    }
                }
                break;
            default:
                break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const getPlaceholder = () => {
        switch (transportMode) {
            case 'car':
            case 'uber/cab':
            case 'auto-rickshaw':
                return "e.g. MH 12 AB 1234 (optional)";
            case 'train':
                return "e.g. 12123 or Deccan Queen (optional)";
            case 'metro':
                return "e.g. Blue Line or Pink Line (optional)";
            case 'bus':
                return "e.g. 123 (optional)";
            default:
                return "Vehicle/ID number (optional)";
        }
    };

    const validateForm = () => {
        const e1 = validateField('startLocation', startLocation);
        const e2 = validateField('endLocation', endLocation);
        const e3 = validateField('transportMode', transportMode);
        const e4 = validateField('transportNo', transportNo);
        return e1 && e2 && e3 && e4;
    };

    // Fetch start coordinates
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

    // Fetch end coordinates
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (hasActiveTrip) return;
        if (validateForm()) {
            let sCoords = startCoords;
            let eCoords = endCoords;

            if (!sCoords || !eCoords) {
                setLoadingCoords(true);
                if (!sCoords && startLocation) {
                    sCoords = await getCoordsFromLocation(startLocation);
                    if (sCoords) setStartCoords(sCoords);
                }
                if (!eCoords && endLocation) {
                    eCoords = await getCoordsFromLocation(endLocation);
                    if (eCoords) setEndCoords(eCoords);
                }
                setLoadingCoords(false);
            }

            if (!sCoords || !eCoords) {
                alert("Please select a valid starting point and destination.");
                return;
            }
            const sid = getSessionId();
            const tabSuffix = sid.slice(-4).toUpperCase();
            const userDetails = {
                name: user?.name || user?.username || `Traveler #${tabSuffix}`,
                phone: user?.phone || user?.contact || null,
                college: user?.college || null,
            };
            const success = await createTrip(
                {
                    start: startLocation,
                    startCoords: sCoords,
                    end: endLocation,
                    endCoords: eCoords,
                    mode: transportMode,
                    vehicleNo: transportNo || null,
                },
                userDetails
            );
            if (success) {
                navigate('/waiting-room');
            }
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans">
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
                    {/* ── Active Trip Banner ── */}
                    {hasActiveTrip && (
                        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-[28px] border border-amber-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">You have an active trip</h3>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {activeTrip?.start} → {activeTrip?.end} · <span className="capitalize">{activeTrip?.mode}</span>
                                            {' · Status: '}<span className="text-amber-700 font-black text-xs uppercase">{tripStatus}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => endTrip()}
                                        className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        Cancel Trip
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (tripStatus === TRIP_STATUS.CONNECTED) navigate('/live-connection');
                                            else navigate('/waiting-room');
                                        }}
                                        className="px-6 py-3 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2"
                                    >
                                        {tripStatus === TRIP_STATUS.CONNECTED ? 'View Connection' : 'Go to Waiting Room'}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map Section */}
                    <div className={`mb-8 relative group ${hasActiveTrip ? 'opacity-50 pointer-events-none' : ''}`}>
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
                                <MapLibreMap startCoords={startCoords} endCoords={endCoords} />
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className={`bg-white/70 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 relative overflow-hidden ${hasActiveTrip ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                        Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Safe Journey</span>
                                    </h1>
                                    <p className="mt-2 text-gray-500 font-medium">Connect with verified partners for a worry-free trip.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-2xl border border-pink-100">
                                    <Users size={18} className="text-pink-600" />
                                    <span className="text-sm font-bold text-pink-700">1.2k active travelers</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="relative">
                                        <LocationInput
                                            label="Starting Point"
                                            value={startLocation}
                                            onChange={(val, coords) => {
                                                setStartLocation(val);
                                                validateField('startLocation', val);
                                                if (coords) {
                                                    const isDifferent = !startCoords || startCoords[0] !== coords[0] || startCoords[1] !== coords[1];
                                                    if (isDifferent) {
                                                        startFromSuggestion.current = true;
                                                        setStartCoords(coords);
                                                    }
                                                }
                                            }}
                                            placeholder="Where should we pick you up?"
                                            error={fieldErrors.startLocation}
                                        />
                                        {fieldErrors.startLocation && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.startLocation}</p>}
                                    </div>
                                    <div className="relative">
                                        <LocationInput
                                            label="Destination"
                                            value={endLocation}
                                            onChange={(val, coords) => {
                                                setEndLocation(val);
                                                validateField('endLocation', val);
                                                if (coords) {
                                                    const isDifferent = !endCoords || endCoords[0] !== coords[0] || endCoords[1] !== coords[1];
                                                    if (isDifferent) {
                                                        endFromSuggestion.current = true;
                                                        setEndCoords(coords);
                                                    }
                                                }
                                            }}
                                            placeholder="Where are you heading?"
                                            error={fieldErrors.endLocation}
                                        />
                                        {fieldErrors.endLocation && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.endLocation}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label htmlFor="transportMode" className="block text-sm font-bold text-gray-700 ml-1">
                                            Preferred Transport
                                        </label>
                                        <div className="relative group">
                                            <select
                                                id="transportMode"
                                                value={transportMode}
                                                onChange={(e) => {
                                                    setTransportMode(e.target.value);
                                                    validateField('transportMode', e.target.value);
                                                }}
                                                className={`w-full pl-5 pr-12 py-3.5 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none appearance-none transition-all hover:bg-white hover:border-gray-300 ${fieldErrors.transportMode ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-pink-500/10 focus:border-pink-500'}`}
                                                required
                                            >
                                                <option value="">Choose your mode</option>
                                                <option value="car">Car</option>
                                                <option value="bus">Public Bus</option>
                                                <option value="train">Railway</option>
                                                <option value="uber/cab">Uber / Ola / Cab</option>
                                                <option value="auto-rickshaw">Auto Rickshaw</option>
                                                <option value="metro">Metro Rail</option>
                                            </select>
                                            <Truck className="absolute right-4 top-4 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                                        </div>
                                        {fieldErrors.transportMode && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.transportMode}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="transportNo" className="block text-sm font-bold text-gray-700 ml-1">
                                            Travel ID / Vehicle No. <span className="text-gray-300 font-medium">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="transportNo"
                                            value={transportNo}
                                            onChange={(e) => {
                                                setTransportNo(e.target.value);
                                                validateField('transportNo', e.target.value);
                                            }}
                                            className={`w-full px-5 py-3.5 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all hover:bg-white hover:border-gray-300 ${fieldErrors.transportNo ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:ring-pink-500/10 focus:border-pink-500'}`}
                                            placeholder={getPlaceholder()}
                                        />
                                        {fieldErrors.transportNo && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.transportNo}</p>}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={hasActiveTrip}
                                        className={`w-full relative group overflow-hidden py-4 px-6 rounded-2xl transition-all duration-300 ${hasActiveTrip
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-gray-900 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)]'
                                            }`}
                                    >
                                        {!hasActiveTrip && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        )}
                                        <span className="relative flex items-center justify-center text-white font-bold text-lg">
                                            <Users className="mr-3" size={24} />
                                            {hasActiveTrip ? 'Active Trip Exists' : 'Broadcast Trip Request'}
                                        </span>
                                    </button>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span>Your exact coordinates are hidden until you connect with a partner.</span>
                                    </div>
                                    <p className="text-center mt-2 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                                        Verified travel partners will see your path & general area only
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-50"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StartTrip;
