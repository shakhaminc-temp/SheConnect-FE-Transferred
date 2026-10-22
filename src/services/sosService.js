import api from '../api/axios';

/**
 * Triggers an SOS alert with the user's current live location.
 * Sends the live location and SOS email to the user's emergency contacts.
 *
 * @param {Array<number>} [fallbackCoords] - Optional fallback [lng, lat] or [lat, lng]
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const triggerSOS = async (fallbackCoords = null) => {
    return new Promise((resolve, reject) => {
        const sendWithCoords = async (latitude, longitude) => {
            try {
                // Ensure latitude and longitude are oriented correctly
                let actualLat = parseFloat(latitude);
                let actualLng = parseFloat(longitude);
                if (abs(actualLat) > 90 && abs(actualLng) <= 90) {
                    const temp = actualLat;
                    actualLat = actualLng;
                    actualLng = temp;
                }

                let locationName = "";
                if (actualLat !== 0 || actualLng !== 0) {
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${actualLat}&lon=${actualLng}&zoom=18&addressdetails=1`
                        );
                        const data = await response.json();
                        locationName = data.display_name || "";
                    } catch (err) {
                        console.warn("Front reverse geocoding failed, backend will retry:", err);
                    }
                }

                const res = await api.post("/emergency-contacts/sos", {
                    lat: actualLat,
                    lng: actualLng,
                    location_name: locationName
                });

                const msg = res.data?.message || "SOS Alert with live location emailed to your emergency contacts!";
                resolve({ success: true, message: msg });
            } catch (error) {
                const errMsg = error.response?.data?.detail || "Failed to send SOS alert. Please check your emergency contacts.";
                reject(new Error(errMsg));
            }
        };

        const abs = Math.abs;

        const parseFallback = (coords) => {
            if (!coords) return [0.0, 0.0];
            if (Array.isArray(coords) && coords.length >= 2) {
                let p1 = parseFloat(coords[0]);
                let p2 = parseFloat(coords[1]);
                // If passed [lat, lng] (e.g. Pune lat ~ 18, lng ~ 73)
                if (abs(p1) <= 90 && abs(p2) > 90) return [p1, p2];
                // If passed [lng, lat] (GeoJSON format: lng ~ 73, lat ~ 18)
                if (abs(p2) <= 90 && abs(p1) > 90) return [p2, p1];
                return [p1, p2];
            }
            if (typeof coords === 'object') {
                const lat = parseFloat(coords.lat ?? coords.latitude ?? 0);
                const lng = parseFloat(coords.lng ?? coords.lon ?? coords.longitude ?? 0);
                return [lat, lng];
            }
            return [0.0, 0.0];
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    sendWithCoords(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("GPS location unavailable for SOS, using fallback:", error);
                    const [fallbackLat, fallbackLng] = parseFallback(fallbackCoords);
                    sendWithCoords(fallbackLat, fallbackLng);
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            const [fallbackLat, fallbackLng] = parseFallback(fallbackCoords);
            sendWithCoords(fallbackLat, fallbackLng);
        }
    });
};
