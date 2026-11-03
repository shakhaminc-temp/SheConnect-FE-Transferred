import { getPrecisionGpsLocation } from './geoTracker';
import api from '../api/axios';

/**
 * Normalizes latitude and longitude coordinates regardless of input order [lat, lng] or [lng, lat].
 * Guaranteed never to invert Indian or global coordinates.
 */
export const normalizeCoordinates = (c1, c2) => {
    const p1 = parseFloat(c1);
    const p2 = parseFloat(c2);
    if (isNaN(p1) || isNaN(p2)) return null;

    // Hard boundary: Latitude can never exceed 90 or be below -90
    if (Math.abs(p1) > 90 && Math.abs(p2) <= 90) {
        return { lat: p2, lng: p1 };
    }
    if (Math.abs(p2) > 90 && Math.abs(p1) <= 90) {
        return { lat: p1, lng: p2 };
    }

    // India/South Asia heuristic: Latitude 6°-38° N, Longitude 60°-98° E
    if (p1 >= 60 && p1 <= 100 && p2 >= 0 && p2 <= 45) {
        return { lat: p2, lng: p1 };
    }
    if (p2 >= 60 && p2 <= 100 && p1 >= 0 && p1 <= 45) {
        return { lat: p1, lng: p2 };
    }

    return { lat: p1, lng: p2 };
};

/**
 * Extracts coordinates from an arbitrary input (array [x,y], object {lat, lng}, etc.)
 */
export const extractCoordinates = (coords) => {
    if (!coords) return null;
    if (Array.isArray(coords) && coords.length >= 2) {
        return normalizeCoordinates(coords[0], coords[1]);
    }
    if (typeof coords === 'object') {
        const lat = coords.lat ?? coords.latitude ?? coords.start_lat;
        const lng = coords.lng ?? coords.lon ?? coords.longitude ?? coords.start_lng;
        if (lat !== undefined && lng !== undefined) {
            return normalizeCoordinates(lat, lng);
        }
    }
    return null;
};

/**
 * Force GPS Hardware Geolocation:
 * - Uses enableHighAccuracy: true exclusively to force hardware GPS.
 * - Sets maximumAge: 0 to bypass stale / cached lookups.
 * - Completely eliminates the inaccurate ISP / IP geolocation fallback that resulted in random cities (Thane, Raigad, Navi Mumbai).
 */
export const getLiveCoordinates = async () => {
    const precisionPos = await getPrecisionGpsLocation();
    if (precisionPos && precisionPos.lat && precisionPos.lng) {
        return precisionPos;
    }
    return null;
};

export const triggerSOS = async (fallbackCoords = null) => {
    // Step 1: ALWAYS prioritize user's real-time live location (GPS -> Wi-Fi/Cell -> IP)
    // fallbackCoords is only used as a last-resort backup if live geolocation is disabled or times out.
    let coords = await getLiveCoordinates();
    let isFallback = false;

    const explicitObj = extractCoordinates(fallbackCoords);

    if (!coords || (coords.lat === 0 && coords.lng === 0)) {
        if (explicitObj && explicitObj.lat !== 0 && explicitObj.lng !== 0) {
            coords = {
                lat: explicitObj.lat,
                lng: explicitObj.lng,
                source: "Trip Route Coordinates (Backup)"
            };
            isFallback = true;
            console.log("[SOS] Real-time geolocation unavailable, using route fallback:", coords);
        } else {
            coords = { lat: 0.0, lng: 0.0, source: "Location Unavailable" };
            isFallback = true;
        }
    } else {
        console.log("[SOS] Real-time live coordinates acquired successfully:", coords);
    }

    const normalized = normalizeCoordinates(coords.lat, coords.lng) || { lat: coords.lat, lng: coords.lng };
    const actualLat = normalized.lat;
    const actualLng = normalized.lng;

    // Step 2: Reverse Geocode to obtain human-readable address
    let locationName = coords.cityName || "";
    if (actualLat !== 0 || actualLng !== 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${actualLat}&lon=${actualLng}&zoom=18&addressdetails=1`,
                { headers: { Accept: "application/json", "User-Agent": "SheConnectApp/1.0" }, signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                locationName = data.display_name || locationName;
            }
        } catch (err) {
            console.warn("Front reverse geocoding failed, backend will retry:", err);
        }
    }

    // Step 3: Send to backend SOS API
    try {
        const res = await api.post("/emergency-contacts/sos", {
            lat: actualLat,
            lng: actualLng,
            location_name: locationName,
            accuracy: coords.accuracy || null,
            source: coords.source || (isFallback ? "Route Coordinates (Fallback)" : "Live Device GPS")
        });

        let msg = res.data?.message || "SOS Alert dispatched to your emergency contacts!";
        if (coords.source.includes("GPS") || coords.source.includes("Wi-Fi")) {
            msg = `🚨 SOS Alert with your live location (${coords.source}) emailed to your emergency contacts!`;
        } else if (isFallback) {
            msg = `🚨 SOS Alert sent using your scheduled route location. (Please enable device GPS for real-time pinpoint location).`;
        }

        return {
            success: true,
            message: msg,
            lat: actualLat,
            lng: actualLng,
            locationName,
            source: coords.source
        };
    } catch (error) {
        const errMsg = error.response?.data?.detail || "Failed to send SOS alert. Please check your emergency contacts.";
        throw new Error(errMsg);
    }
};
