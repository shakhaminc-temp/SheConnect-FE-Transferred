import api from '../api/axios';

// Offer a new carpool ride
export const offerRide = async (rideData) => {
    const response = await api.post('/carpool/offer', rideData);
    return response.data;
};

// Search for rides as a passenger
export const searchRides = async (start, end) => {
    const response = await api.get(`/carpool/search?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&t=${new Date().getTime()}`);
    return response.data;
};

// Get rides created by the current driver
export const getMyRides = async () => {
    const response = await api.get(`/carpool/my-rides?t=${new Date().getTime()}`);
    return response.data;
};

// Get requests for a specific ride (driver perspective)
export const getRideRequests = async (rideId) => {
    const response = await api.get(`/carpool/${rideId}/requests?t=${new Date().getTime()}`);
    return response.data;
};

// Request to join a ride (passenger perspective)
export const requestRide = async (rideId) => {
    const response = await api.post(`/carpool/${rideId}/request`);
    return response.data;
};

// Get requests made by the current user
export const getMyRequests = async () => {
    const response = await api.get(`/carpool/my-requests?t=${new Date().getTime()}`);
    return response.data;
};

// Accept/Approve a request or an invite
export const approveRequest = async (requestId) => {
    const response = await api.post(`/carpool/request/${requestId}/approve`);
    return response.data;
};

// Seeks / Two-Way Matching
export const publishSeek = async (seekData) => {
    const response = await api.post('/carpool/seek', seekData);
    return response.data;
};

export const searchSeeks = async (start, end) => {
    const response = await api.get('/carpool/seek/search', { params: { start, end, t: new Date().getTime() } });
    return response.data;
};

export const inviteRider = async (rideId, riderId) => {
    const response = await api.post(`/carpool/${rideId}/invite/${riderId}`);
    return response.data;
};

// Initialize payment (mock)
export const payForRequest = async (requestId) => {
    const response = await api.post(`/carpool/request/${requestId}/pay`);
    return response.data;
};

// Complete a ride (driver perspective)
export const completeRide = async (rideId) => {
    const response = await api.post(`/carpool/${rideId}/complete`);
    return response.data;
};

// Rate a ride (passenger perspective)
export const rateRide = async (rideId, rating, review) => {
    const response = await api.post(`/carpool/${rideId}/rate`, { rating, review });
    return response.data;
};
