/**
 * tripStorage.js — localStorage-based shared "database" for live cross-tab matching.
 * 
 * Each browser tab gets a unique sessionId (via sessionStorage).
 * All trips and requests are stored in localStorage so any tab can read them.
 * This enables two people (two tabs) to find each other in real time.
 * 
 * Privacy rules:
 *   "anonymous" → partner only sees: anonymous ID + locations
 *   "details"   → partner sees: name + phone + college + locations
 */

const TRIPS_KEY = 'sheconnect_live_trips';
const REQUESTS_KEY = 'sheconnect_live_requests';
const SESSION_KEY = 'sheconnect_session_id';
const STATUS_KEY = 'sheconnect_live_status';
const ENDED_KEY = 'sheconnect_ended_trips';

// ─── Session Identity ────────────────────────────────────
export const getSessionId = () => {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
};

// ─── Trip Storage ────────────────────────────────────────

const readTrips = () => {
    try {
        return JSON.parse(localStorage.getItem(TRIPS_KEY)) || [];
    } catch {
        return [];
    }
};

const writeTrips = (trips) => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

/**
 * Save the current user's trip to the shared store.
 */
export const saveTrip = (trip, sessionId, privacyChoice, userDetails = {}) => {
    const trips = readTrips();
    const filtered = trips.filter(t => t.sessionId !== sessionId);
    filtered.push({
        ...trip,
        sessionId,
        privacyChoice,
        userName: userDetails.name || 'Anonymous',
        userPhone: userDetails.phone || null,
        userCollege: userDetails.college || null,
        savedAt: new Date().toISOString(),
    });
    writeTrips(filtered);
};

/**
 * Find matching trips from OTHER users.
 */
export const findLiveMatches = (activeTrip, currentSessionId) => {
    const trips = readTrips();

    const normalize = (str) => str?.trim().toLowerCase() || '';
    const extractCity = (str) => normalize(str).split(',')[0].trim();

    const getTransportGroup = (mode) => {
        const m = normalize(mode);
        if (['car', 'cab', 'uber', 'ola', 'auto'].some(opt => m.includes(opt))) return 'road_private';
        if (['train', 'metro', 'railway'].some(opt => m.includes(opt))) return 'rail';
        if (m.includes('bus')) return 'bus';
        if (m.includes('flight') || m.includes('plane')) return 'air';
        return m;
    };

    const locationMatches = (a, b) => {
        const fullA = normalize(a);
        const fullB = normalize(b);
        const cityA = extractCity(a);
        const cityB = extractCity(b);
        return fullA.includes(fullB) || fullB.includes(fullA)
            || cityA === cityB || cityA.includes(cityB) || cityB.includes(cityA);
    };

    return trips
        .filter(t => t.sessionId !== currentSessionId)
        .filter(t => {
            const startOk = locationMatches(activeTrip.start, t.start);
            const endOk = locationMatches(activeTrip.end, t.end);
            const modeOk = getTransportGroup(activeTrip.mode) === getTransportGroup(t.mode);
            return startOk && endOk && modeOk;
        })
        .map(t => {
            // Show ALL details in matches — privacy filtering happens at send/accept
            return {
                id: t.id,
                sessionId: t.sessionId,
                name: t.userName || 'Traveler',
                start: t.start,
                end: t.end,
                mode: t.mode,
                college: t.userCollege || null,
                phone: t.userPhone || null,
                verified: true,
                privacy_type: 'details', // Always show all in match list
                status: 'active',
            };
        });
};

/**
 * Remove the current user's trip from the shared store
 */
export const removeTrip = (sessionId) => {
    const trips = readTrips();
    writeTrips(trips.filter(t => t.sessionId !== sessionId));
};

// ─── Request Storage ─────────────────────────────────────

const readRequests = () => {
    try {
        return JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [];
    } catch {
        return [];
    }
};

const writeRequests = (requests) => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

/**
 * Send a connection request to another user.
 */
export const sendLiveRequest = (fromSessionId, toSessionId, senderInfo, tripDetails) => {
    let requests = readRequests();
    const exists = requests.some(r => r.fromSessionId === fromSessionId && r.toSessionId === toSessionId);
    if (exists) return;

    const isAnonymous = senderInfo.privacyChoice === 'anonymous';
    const anonId = `SC-${fromSessionId.slice(-6).toUpperCase()}`;

    const newRequest = {
        id: Date.now() + Math.random(),
        fromSessionId,
        toSessionId,
        fromName: isAnonymous ? anonId : (senderInfo.name || 'Anonymous'),
        fromPhone: isAnonymous ? null : (senderInfo.phone || null),
        fromCollege: isAnonymous ? null : (senderInfo.college || null),
        fromPrivacy: senderInfo.privacyChoice || 'anonymous',
        tripStart: tripDetails.start,
        tripEnd: tripDetails.end,
        tripMode: tripDetails.mode,
        status: 'PENDING',
        sentAt: new Date().toISOString(),
    };

    // Re-read right before write to minimize race
    requests = readRequests();
    requests.push(newRequest);
    writeRequests(requests);
};

/**
 * Get incoming requests for this session
 */
export const getIncomingRequests = (sessionId) => {
    return readRequests().filter(r => r.toSessionId === sessionId && r.status === 'PENDING');
};

/**
 * Detect crossed requests: I sent to X, and X also sent to me.
 */
export const checkCrossedRequests = (sessionId) => {
    const requests = readRequests();
    const mySent = requests.filter(r => r.fromSessionId === sessionId && r.status === 'PENDING');
    for (const sent of mySent) {
        const crossed = requests.find(
            r => r.fromSessionId === sent.toSessionId &&
                r.toSessionId === sessionId &&
                r.status === 'PENDING'
        );
        if (crossed) return crossed;
    }
    return null;
};

/**
 * Get sent requests from this session
 */
export const getSentRequests = (sessionId) => {
    return readRequests().filter(r => r.fromSessionId === sessionId);
};

/**
 * Accept a request — update its status and store acceptor's details
 */
export const acceptLiveRequest = (requestId, acceptorInfo = {}) => {
    const requests = readRequests();
    const isAnonymous = acceptorInfo.privacyChoice === 'anonymous';
    const anonId = acceptorInfo.sessionId ? `SC-${acceptorInfo.sessionId.slice(-6).toUpperCase()}` : 'SC-ANON';

    const updated = requests.map(r =>
        r.id === requestId ? {
            ...r,
            status: 'ACCEPTED',
            acceptorName: isAnonymous ? anonId : (acceptorInfo.name || 'Anonymous'),
            acceptorPhone: isAnonymous ? null : (acceptorInfo.phone || null),
            acceptorCollege: isAnonymous ? null : (acceptorInfo.college || null),
            acceptorPrivacy: acceptorInfo.privacyChoice || 'anonymous',
            acceptorSessionId: acceptorInfo.sessionId || null,
        } : r
    );
    writeRequests(updated);
    return updated.find(r => r.id === requestId);
};

/**
 * Decline a request
 */
export const declineLiveRequest = (requestId) => {
    const requests = readRequests();
    writeRequests(requests.map(r =>
        r.id === requestId ? { ...r, status: 'DECLINED' } : r
    ));
};

/**
 * Check if any of our SENT requests have been accepted
 */
export const checkAcceptedRequests = (sessionId) => {
    return readRequests().filter(
        r => r.fromSessionId === sessionId && r.status === 'ACCEPTED'
    );
};

/**
 * Clean up all data for a session (on trip end)
 */
export const cleanupSession = (sessionId) => {
    removeTrip(sessionId);
    const requests = readRequests();
    writeRequests(requests.filter(
        r => r.fromSessionId !== sessionId && r.toSessionId !== sessionId
    ));
    clearStatus(sessionId);
};

// ─── We Met / I Reached Status ───────────────────────────

const readStatus = () => {
    try {
        return JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
    } catch {
        return {};
    }
};

const writeStatus = (status) => {
    localStorage.setItem(STATUS_KEY, JSON.stringify(status));
};

export const setWeMet = (sessionId) => {
    const status = readStatus();
    status[sessionId] = { ...(status[sessionId] || {}), weMet: true };
    writeStatus(status);
};

export const getWeMetStatus = (mySessionId, partnerSessionId) => {
    const status = readStatus();
    return {
        me: status[mySessionId]?.weMet || false,
        partner: status[partnerSessionId]?.weMet || false,
    };
};

export const setIReached = (sessionId) => {
    const status = readStatus();
    status[sessionId] = { ...(status[sessionId] || {}), iReached: true };
    writeStatus(status);
};

export const getIReachedStatus = (mySessionId, partnerSessionId) => {
    const status = readStatus();
    return {
        me: status[mySessionId]?.iReached || false,
        partner: status[partnerSessionId]?.iReached || false,
    };
};

export const clearStatus = (sessionId) => {
    const status = readStatus();
    delete status[sessionId];
    writeStatus(status);
};

// ─── Partner Ended Trip Detection ────────────────────────

const readEnded = () => {
    try {
        return JSON.parse(localStorage.getItem(ENDED_KEY)) || {};
    } catch {
        return {};
    }
};

const writeEnded = (data) => {
    localStorage.setItem(ENDED_KEY, JSON.stringify(data));
};

/**
 * Mark that this session has ended their trip.
 * partnerSessionId is stored so the partner's tab can detect it.
 */
export const markTripEnded = (sessionId, partnerSessionId) => {
    const ended = readEnded();
    ended[sessionId] = { endedAt: Date.now(), partnerSessionId };
    writeEnded(ended);
};

/**
 * Check if partner has ended their trip.
 * Returns true if the partnerSessionId has marked trip as ended.
 */
export const checkPartnerEnded = (partnerSessionId) => {
    const ended = readEnded();
    return !!ended[partnerSessionId];
};

/**
 * Clear ended flag for a session
 */
export const clearEndedFlag = (sessionId) => {
    const ended = readEnded();
    delete ended[sessionId];
    writeEnded(ended);
};
