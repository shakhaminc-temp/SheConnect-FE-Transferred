import api from '../api/axios';

// Create a new trip
export const createTrip = async (tripData) => {
    const response = await api.post('/travel/trips', tripData);
    return response.data;
};

// Get current user's trips
export const getMyTrips = async (activeOnly = false, limit = 50, offset = 0) => {
    const response = await api.get(`/travel/trips?active_only=${activeOnly}&limit=${limit}&offset=${offset}`);
    return response.data;
};

// Get details for a specific trip
export const getTripDetails = async (tripId) => {
    const response = await api.get(`/travel/trips/${tripId}`);
    return response.data;
};

// Get route geometry for MapLibre
export const getTripRoute = async (tripId) => {
    const response = await api.get(`/travel/trips/${tripId}/route`);
    return response.data;
};

// Get matching trips for a given trip
export const getTripMatches = async (tripId) => {
    const response = await api.get(`/travel/trips/${tripId}/matches`);
    return response.data;
};

// Send a trip request to another user
export const sendTripRequest = async (senderTripId, receiverTripId, privacyMode = "ANONYMOUS") => {
    const response = await api.post('/travel/request', {
        sender_trip_id: senderTripId,
        receiver_trip_id: receiverTripId,
        privacy_mode: privacyMode
    });
    return response.data;
};

// Get received and sent trip requests
export const getMyRequests = async () => {
    const response = await api.get('/travel/requests');
    return response.data;
};

// Respond to a trip request (accepted/rejected)
export const respondToRequest = async (requestId, status, privacyMode = "ANONYMOUS") => {
    const response = await api.put(`/travel/request/${requestId}`, { status, privacy_mode: privacyMode });
    return response.data;
};

// Cancel a trip request
export const cancelTripRequest = async (requestId) => {
    const response = await api.put(`/travel/request/${requestId}`, { status: 'cancelled' });
    return response.data;
};

// End a trip (marks as completed and cleans up)
export const endTrip = async (tripId = null) => {
    let url = '/travel/end';
    if (tripId) {
        url += `?trip_id=${tripId}`;
    }
    const response = await api.post(url);
    return response.data;
};
