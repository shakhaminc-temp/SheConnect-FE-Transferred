import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createTrip as apiCreateTrip, getMyTrips, getTripMatches, sendTripRequest, getMyRequests, respondToRequest, endTrip as apiEndTrip } from '../services/travelService';
import { useAuth } from './AuthContext';

import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';

const normalizeCoords = (coords) => {
    if (!coords) return null;
    if (Array.isArray(coords) && coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }
    if (typeof coords === 'object') {
        const lat = parseFloat(coords.lat ?? coords.latitude);
        const lng = parseFloat(coords.lng ?? coords.lon ?? coords.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }
    return null;
};

export const TRIP_STATUS = {
    IDLE: 'IDLE',
    WAITING: 'WAITING',
    REQUEST_PENDING: 'REQUEST_PENDING',
    CONNECTED: 'CONNECTED',
    TIMEOUT: 'TIMEOUT',
    COMPLETED: 'COMPLETED',
};

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeTrip, setActiveTrip] = useState(null);
    const [tripStatus, setTripStatus] = useState(TRIP_STATUS.IDLE);
    const [matches, setMatches] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [connectedPartner, setConnectedPartner] = useState(null);
    const [timeoutLimitMs] = useState(5 * 60 * 1000); // 5 mins
    
    // Live connection states (stubs for UI)
    const [weMet, setWeMet] = useState({ me: false, partner: false });
    const [iReached, setIReached] = useState({ me: false, partner: false });
    const bothMet = weMet.me && weMet.partner;
    const bothReached = iReached.me && iReached.partner;
    const [partnerEndedTrip, setPartnerEndedTrip] = useState(false);
    const [privacyChoice, setPrivacyChoice] = useState('details');

    const pressWeMet = useCallback(() => setWeMet(prev => ({ ...prev, me: true, partner: true })), []); // Stub auto-partner
    const pressIReached = useCallback(() => setIReached(prev => ({ ...prev, me: true, partner: true })), []);
    const revertToWaiting = useCallback(() => {
        setTripStatus(TRIP_STATUS.WAITING);
        setConnectedPartner(null);
        setWeMet({ me: false, partner: false });
        setIReached({ me: false, partner: false });
        setPartnerEndedTrip(false);
    }, []);
    
    // Restore active trip from backend on mount
    useEffect(() => {
        if (!user) {
            setActiveTrip(null);
            setTripStatus(TRIP_STATUS.IDLE);
            setMatches([]);
            setSentRequests([]);
            setReceivedRequests([]);
            setConnectedPartner(null);
            setWeMet({ me: false, partner: false });
            setIReached({ me: false, partner: false });
            setPartnerEndedTrip(false);
            return;
        }
        const fetchActiveTrip = async () => {
            try {
                // 1. Fetch requests to check if currently connected
                let isConnected = false;
                let acceptedSent = null;
                let acceptedReceived = null;
                try {
                    const reqs = await getMyRequests();
                    acceptedSent = reqs.sent.find(r => r.status === 'accepted');
                    acceptedReceived = reqs.received.find(r => r.status === 'accepted');
                    isConnected = !!(acceptedSent || acceptedReceived);
                } catch (e) {
                    console.error("Failed to fetch requests", e);
                }

                // 2. Fetch active trips and filter stale ones
                const trips = await getMyTrips(true, 10, 0);
                let validTrip = null;

                for (const trip of trips) {
                    const tripTime = new Date(trip.travel_date).getTime();
                    const flexMs = (trip.time_flex_minutes || 30) * 60000;
                    const bufferMs = 60 * 60000; // 1 hour buffer
                    
                    // If not connected and time has passed significantly, consider it stale
                    const isStale = !isConnected && (Date.now() > tripTime + flexMs + bufferMs);

                    if (isStale && trip.status === 'SEARCHING') {
                        try {
                            await apiEndTrip(trip.travel_id);
                            console.log(`Cleaned up stale trip ${trip.travel_id}`);
                        } catch (e) {
                            console.error("Failed to cleanup stale trip", e);
                        }
                    } else if (!validTrip) {
                        validTrip = trip;
                    }
                }

                if (validTrip) {
                    setActiveTrip({
                        ...validTrip,
                        id: validTrip.travel_id,
                        start: validTrip.start_label,
                        end: validTrip.end_label,
                        start_lat: validTrip.start_lat,
                        start_lng: validTrip.start_lng,
                        end_lat: validTrip.end_lat,
                        end_lng: validTrip.end_lng,
                        mode: validTrip.mode_of_transport,
                        vehicleNo: validTrip.vehicle_no,
                        createdAt: validTrip.created_at,
                    });
                    
                    if (isConnected) {
                        setTripStatus(TRIP_STATUS.CONNECTED);
                        setConnectedPartner({
                             id: acceptedSent ? acceptedSent.sent_to : acceptedReceived.sent_by,
                             request_id: acceptedSent ? acceptedSent.request_id : acceptedReceived.request_id,
                        });
                    } else {
                        setTripStatus(TRIP_STATUS.WAITING);
                    }
                } else {
                    setActiveTrip(null);
                    setTripStatus(TRIP_STATUS.IDLE);
                    setConnectedPartner(null);
                }
            } catch (err) {
                console.error("Error fetching active trip", err);
            }
        };
        fetchActiveTrip();
    }, [user]);

    // Live Polling
    useEffect(() => {
        let pollInterval;
        const isSearching = tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING;
        
        if (isSearching && activeTrip) {
            const poll = async () => {
                try {
                    const matchData = await getTripMatches(activeTrip.id);
                    const mappedMatches = (matchData.matches || []).map(m => ({
                        id: m.match_id,
                        name: m.anonymous_id ? `Traveler ${m.anonymous_id.substring(0,4)}` : "Verified User",
                        start: m.start_location,
                        end: m.end_location,
                        mode: m.mode_of_transport,
                        rating: m.rating,
                        distance: m.start_distance_m,
                        verified: true,
                    }));
                    setMatches(prev => JSON.stringify(prev) === JSON.stringify(mappedMatches) ? prev : mappedMatches);
                    
                    const reqData = await getMyRequests();
                    const mappedReceived = (reqData.received || [])
                        .filter(r => r.status === 'pending')
                        .map(r => ({
                            id: r.request_id,
                            fromName: `Traveler (Trip ${r.sender_travel_id})`,
                            tripStart: r.partner_start || "Matched Route",
                            tripEnd: r.partner_end || "",
                            status: r.status,
                            partnerUserId: r.sent_by,
                            connectionType: r.sender_privacy_mode === 'DETAILS' ? 'details' : 'anonymous',
                            name: r.partner_name,
                            college: r.partner_college,
                            phone: r.partner_phone,
                            anonymous_id: r.partner_anonymous_id,
                            rating: r.partner_rating,
                            start: r.partner_start,
                            end: r.partner_end,
                            verified: true
                        }));
                    setReceivedRequests(prev => JSON.stringify(prev) === JSON.stringify(mappedReceived) ? prev : mappedReceived);
                    
                    const mappedSent = (reqData.sent || [])
                        .filter(r => r.status === 'pending' || r.status === 'accepted')
                        .map(r => ({
                            id: r.request_id,
                            matchId: r.receiver_travel_id.toString(),
                            status: r.status.toUpperCase(),
                            partnerUserId: r.sent_to,
                            connectionType: r.receiver_privacy_mode === 'DETAILS' ? 'details' : 'anonymous',
                            name: r.partner_name,
                            college: r.partner_college,
                            phone: r.partner_phone,
                            anonymous_id: r.partner_anonymous_id,
                            rating: r.partner_rating,
                            start: r.partner_start,
                            end: r.partner_end
                        }));
                    setSentRequests(prev => JSON.stringify(prev) === JSON.stringify(mappedSent) ? prev : mappedSent);
                    
                    const acceptedSent = mappedSent.find(r => r.status === 'ACCEPTED');
                    const acceptedReceivedRaw = (reqData.received || []).find(r => r.status === 'accepted');

                    if (acceptedSent) {
                        setTripStatus(TRIP_STATUS.CONNECTED);
                        setConnectedPartner({ 
                            id: acceptedSent.partnerUserId,
                            request_id: acceptedSent.id,
                            privacy_type: acceptedSent.connectionType,
                            name: acceptedSent.name,
                            college: acceptedSent.college,
                            phone: acceptedSent.phone,
                            anonymous_id: acceptedSent.anonymous_id,
                            rating: acceptedSent.rating,
                            start: acceptedSent.start,
                            end: acceptedSent.end
                        });
                    } else if (acceptedReceivedRaw) {
                        setTripStatus(TRIP_STATUS.CONNECTED);
                        setConnectedPartner({
                            id: acceptedReceivedRaw.sent_by,
                            request_id: acceptedReceivedRaw.request_id,
                            privacy_type: acceptedReceivedRaw.sender_privacy_mode === 'DETAILS' ? 'details' : 'anonymous',
                            name: acceptedReceivedRaw.partner_name,
                            college: acceptedReceivedRaw.partner_college,
                            phone: acceptedReceivedRaw.partner_phone,
                            anonymous_id: acceptedReceivedRaw.partner_anonymous_id,
                            rating: acceptedReceivedRaw.partner_rating,
                            start: acceptedReceivedRaw.partner_start,
                            end: acceptedReceivedRaw.partner_end
                        });
                    } else if (tripStatus === TRIP_STATUS.REQUEST_PENDING && mappedSent.filter(r => r.status === 'PENDING').length === 0) {
                        setTripStatus(TRIP_STATUS.WAITING);
                    }
                } catch (err) {
                    console.error("Error polling", err);
                }
            };
            
            poll(); // run immediately
            pollInterval = setInterval(poll, 15000);
        }
        return () => clearInterval(pollInterval);
    }, [tripStatus, activeTrip, getMyRequests]);

    const createTrip = useCallback(async (tripData) => {
        try {
            let startCoordObj = normalizeCoords(tripData.startCoords);
            if (!startCoordObj && tripData.start) {
                const fetched = await getCoordsFromLocation(tripData.start);
                startCoordObj = normalizeCoords(fetched);
            }

            let endCoordObj = normalizeCoords(tripData.endCoords);
            if (!endCoordObj && tripData.end) {
                const fetched = await getCoordsFromLocation(tripData.end);
                endCoordObj = normalizeCoords(fetched);
            }

            if (!startCoordObj || !endCoordObj) {
                alert("Could not determine coordinates for start or destination location. Please select a valid location.");
                return false;
            }

            const response = await apiCreateTrip({
                start: {
                    lat: startCoordObj.lat,
                    lng: startCoordObj.lng,
                    label: tripData.start
                },
                end: {
                    lat: endCoordObj.lat,
                    lng: endCoordObj.lng,
                    label: tripData.end
                },
                start_time: new Date(Date.now() + 5 * 60000).toISOString(), // 5 mins in future to account for latency
                time_flex_minutes: 30,
                transport_mode: tripData.mode,
                vehicle_no: tripData.vehicleNo || null
            });
            setActiveTrip({
                id: response.travel_id || response.trip_id,
                start: tripData.start,
                end: tripData.end,
                start_lat: startCoordObj.lat,
                start_lng: startCoordObj.lng,
                end_lat: endCoordObj.lat,
                end_lng: endCoordObj.lng,
                mode: tripData.mode,
                vehicleNo: tripData.vehicleNo || null,
                createdAt: new Date().toISOString()
            });
            setTripStatus(TRIP_STATUS.WAITING);
            return true;
        } catch (err) {
            console.error("Create Trip Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Could not create trip. " + errMsg);
            return false;
        }
    }, []);

    const sendRequest = useCallback(async (matchId, privacyChoice) => {
        try {
            const senderTripId = activeTrip?.id || activeTrip?.travel_id;
            if (!senderTripId) {
                alert("No active trip found. Please start a trip first.");
                return;
            }
            const receiverTripId = parseInt(matchId, 10);
            if (isNaN(receiverTripId)) {
                alert("Invalid match selected.");
                return;
            }
            const res = await sendTripRequest(senderTripId, receiverTripId, privacyChoice);
            setSentRequests(prev => [...prev, { id: res?.request_id, matchId: matchId.toString(), status: 'PENDING' }]);
            setTripStatus(TRIP_STATUS.REQUEST_PENDING);
        } catch (err) {
            console.error("Send Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error sending request: " + errMsg);
        }
    }, [activeTrip]);

    const cancelRequest = useCallback(async (matchIdOrRequestId) => {
        try {
            const target = sentRequests.find(r => r.matchId === matchIdOrRequestId.toString() || r.id === matchIdOrRequestId);
            if (target?.id) {
                await respondToRequest(target.id, 'cancelled');
            } else if (typeof matchIdOrRequestId === 'number') {
                await respondToRequest(matchIdOrRequestId, 'cancelled');
            }
            setSentRequests(prev => prev.filter(r => r.matchId !== matchIdOrRequestId.toString() && r.id !== matchIdOrRequestId));
            setTripStatus(TRIP_STATUS.WAITING);
        } catch (err) {
            console.error("Cancel Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error cancelling request: " + errMsg);
        }
    }, [sentRequests]);

    const acceptRequest = useCallback(async (requestId, privacyChoice) => {
        try {
            await respondToRequest(requestId, 'accepted', privacyChoice);
            const req = receivedRequests.find(r => r.id === requestId);
            setTripStatus(TRIP_STATUS.CONNECTED);
            if (req) {
                setConnectedPartner({
                    id: req.partnerUserId,
                    request_id: requestId,
                    privacy_type: req.connectionType,
                    name: req.name,
                    college: req.college,
                    phone: req.phone,
                    anonymous_id: req.anonymous_id,
                    start: req.start,
                    end: req.end
                });
            }
        } catch (err) {
            console.error("Accept Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error accepting request: " + errMsg);
        }
    }, [receivedRequests]);

    const declineRequest = useCallback(async (requestId) => {
        try {
            await respondToRequest(requestId, 'rejected');
            setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error("Decline Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error declining request: " + errMsg);
        }
    }, []);

    const endTrip = useCallback(async () => {
        try {
            if (activeTrip?.id) {
                await apiEndTrip(activeTrip.id);
            } else {
                await apiEndTrip();
            }
        } catch (err) {
            console.error("End Trip Error:", err);
        } finally {
            setActiveTrip(null);
            setTripStatus(TRIP_STATUS.IDLE);
            setMatches([]);
            setSentRequests([]);
            setReceivedRequests([]);
            setConnectedPartner(null);
            setWeMet({ me: false, partner: false });
            setIReached({ me: false, partner: false });
            setPartnerEndedTrip(false);
        }
    }, [activeTrip]);

    const retryMatching = useCallback(() => setTripStatus(TRIP_STATUS.WAITING), []);
    const triggerTimeout = useCallback(() => setTripStatus(TRIP_STATUS.TIMEOUT), []);
    const emergencyAction = useCallback(() => alert("Emergency Action Triggered!"), []);

    const contextValue = useMemo(() => ({
        tripStatus, activeTrip, matches, sentRequests, receivedRequests, connectedPartner,
        createTrip, sendRequest, cancelRequest, acceptRequest, declineRequest, endTrip, retryMatching, triggerTimeout, emergencyAction,
        hasActiveTrip: tripStatus !== TRIP_STATUS.IDLE, timeoutLimitMs,
        weMet, iReached, bothMet, bothReached, partnerEndedTrip, pressWeMet, pressIReached, revertToWaiting, privacyChoice, setPrivacyChoice
    }), [
        tripStatus, activeTrip, matches, sentRequests, receivedRequests, connectedPartner,
        timeoutLimitMs, weMet, iReached, bothMet, bothReached, partnerEndedTrip, privacyChoice,
        createTrip, sendRequest, cancelRequest, acceptRequest, declineRequest, endTrip, retryMatching, triggerTimeout, emergencyAction, pressWeMet, pressIReached, revertToWaiting
    ]);

    return (
        <TripContext.Provider value={contextValue}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) throw new Error("useTrip must be used within TripProvider");
    return context;
};