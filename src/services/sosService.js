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
                let locationName = "";
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    locationName = data.display_name || "";
                } catch (err) {
                    console.warn("Reverse geocoding failed:", err);
                }

                const res = await api.post("/emergency-contacts/sos", {
                    lat: latitude,
                    lng: longitude,
                    location_name: locationName
                });

                const msg = res.data?.message || "SOS Alert with live location emailed to your emergency contacts!";
                resolve({ success: true, message: msg });
            } catch (error) {
                const errMsg = error.response?.data?.detail || "Failed to send SOS alert. Please check your emergency contacts.";
                reject(new Error(errMsg));
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    sendWithCoords(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("GPS location unavailable for SOS, using fallback:", error);
                    let lat = 0.0;
                    let lng = 0.0;
                    if (Array.isArray(fallbackCoords) && fallbackCoords.length >= 2) {
                        // In MapLibre / GeoJSON coords are [lng, lat]
                        lng = fallbackCoords[0];
                        lat = fallbackCoords[1];
                    }
                    sendWithCoords(lat, lng);
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            let lat = 0.0;
            let lng = 0.0;
            if (Array.isArray(fallbackCoords) && fallbackCoords.length >= 2) {
                lng = fallbackCoords[0];
                lat = fallbackCoords[1];
            }
            sendWithCoords(lat, lng);
        }
    });
};
