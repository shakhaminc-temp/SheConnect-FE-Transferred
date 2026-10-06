import React, { useState } from 'react';
import { MapPin, ArrowLeft, X } from 'lucide-react';

const MatchMakingModal = ({ isOpen, onClose, tripDetails, onConnect, matches = [] }) => {
    // Potential Matches
    const [potentialMatches] = useState(matches);
    const [sentRequestIds, setSentRequestIds] = useState([]);

    const handleConnectClick = (user) => {
        setSentRequestIds(prev => [...prev, user.id]);
        if (onConnect) onConnect(user);
    };

    // Filter matches where start AND end location match AND transport group matches
    const normalize = (str) => str?.trim().toLowerCase() || '';

    const getTransportGroup = (mode) => {
        const m = normalize(mode);
        if (['car', 'cab', 'uber', 'ola', 'auto'].some(opt => m.includes(opt))) return 'road_private';
        if (['train', 'metro', 'railway'].some(opt => m.includes(opt))) return 'rail';
        if (m.includes('bus')) return 'bus';
        if (m.includes('flight') || m.includes('plane')) return 'air';
        return m;
    };

    const filteredMatches = potentialMatches.filter((u) => {
        const tripStart = normalize(tripDetails.start);
        const tripEnd = normalize(tripDetails.end);
        const matchStart = normalize(u.start);
        const matchEnd = normalize(u.end);

        // Route Match
        const startMatches = matchStart.includes(tripStart) || tripStart.includes(matchStart);
        const endMatches = matchEnd.includes(tripEnd) || tripEnd.includes(matchEnd);

        // Transport Match (Flexible)
        const modeMatches = getTransportGroup(u.mode) === getTransportGroup(tripDetails.mode);

        return startMatches && endMatches && modeMatches;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/40 backdrop-blur-sm font-sans animate-in fade-in duration-300">
            {/* Modal Container */}
            <div className="bg-[#f8fafc] w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Modal Header */}
                <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-pink-50 rounded-xl text-pink-600 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Find <span className="text-pink-600">Travel Partner</span> 🌍
                            </h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {tripDetails.start} → {tripDetails.end}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {filteredMatches.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full text-pink-300 shadow-inner">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">No matches found</h3>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">
                                We couldn't find anyone traveling the same route by {tripDetails.mode} right now.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                {filteredMatches.length} VERIFIED {filteredMatches.length === 1 ? 'PARTNER' : 'PARTNERS'} FOUND
                            </p>
                            {filteredMatches.map(user => (
                                <div key={user.id} className="bg-white p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all group border-transparent hover:border-pink-100">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-xl border border-gray-100 group-hover:bg-pink-50 transition-colors">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-gray-900 leading-none">{user.name}</h4>
                                                    {user.verified && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                        {user.college || 'Verified Traveler'}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[10px] text-pink-500 font-black uppercase tracking-widest">
                                                        <MapPin size={10} />
                                                        <span>Near {user.area || 'Unknown Area'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleConnectClick(user)}
                                            disabled={sentRequestIds.includes(user.id)}
                                            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${sentRequestIds.includes(user.id)
                                                    ? 'bg-green-500 text-white cursor-default shadow-green-100'
                                                    : 'bg-gray-900 text-white hover:bg-pink-600 shadow-gray-200 hover:shadow-pink-100'
                                                }`}
                                        >
                                            {sentRequestIds.includes(user.id) ? 'Request Sent' : 'Connect'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-4 bg-white border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Only verified users traveling on your route are shown
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MatchMakingModal;
