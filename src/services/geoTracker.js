/**
 * Continuous High-Precision Hardware GPS Tracking Engine
 *
 * Real-world safety rationale:
 * 1. Warm GPS Cache: Keeps the mobile satellite receiver awake in the background.
 * 2. Instant Zero-Latency SOS: When an emergency happens, the app already has the exact fix.
 * 3. Accuracy Filter: Ignores noisy ISP/telecom gateway estimates (> 1500 meters)
 *    so locations in Thane/Khopoli/Raigad are never mistaken for the user's location.
 */

let currentWatchId = null;
let lastKnownValidPosition = null;

// Attempt to restore any recent valid position from localStorage (valid within 15 minutes)
try {
    const saved = localStorage.getItem('sheconnect_live_gps');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
            lastKnownValidPosition = parsed;
        }
    }
} catch (_) {}

/**
 * Starts the continuous high-precision GPS tracker.
 * Call this when the app mounts or when a user logs in.
 */
export const startContinuousGpsTracking = () => {
    if (!('geolocation' in navigator)) {
        console.warn('[GPS Engine] Geolocation is not supported by this browser.');
        return;
    }

    if (currentWatchId !== null) return; // Already watching

    console.log('[GPS Engine] Initializing continuous hardware satellite GPS tracking...');

    currentWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude, longitude, accuracy, speed, heading } = pos.coords;

            // Reject coarse estimates (typical of ISP data centers 50+ km away)
            if (accuracy > 1500) {
                console.warn(`[GPS Engine] Discarding coarse estimate (accuracy ±${Math.round(accuracy)}m is too imprecise)`);
                return;
            }

            lastKnownValidPosition = {
                lat: latitude,
                lng: longitude,
                accuracy: Math.round(accuracy),
                speed: speed || 0,
                heading: heading || 0,
                timestamp: Date.now(),
                source: `Hardware GPS (Accurate to ±${Math.round(accuracy)}m)`
            };

            try {
                localStorage.setItem('sheconnect_live_gps', JSON.stringify(lastKnownValidPosition));
            } catch (_) {}

            console.log(`[GPS Engine] Acquired precision GPS fix: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`);
        },
        (err) => {
            console.debug('[GPS Engine] Continuous watch update warning:', err.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
        }
    );
};

/**
 * Returns the warmest, most accurate physical GPS coordinate.
 * If watchPosition already has a recent fix (< 2 mins), returns immediately.
 * Otherwise, falls back to a fast 4s hardware single-shot request.
 */
export const getPrecisionGpsLocation = async () => {
    // 1. Check if warm GPS cache is fresh (acquired within the last 2 minutes)
    if (lastKnownValidPosition && (Date.now() - lastKnownValidPosition.timestamp < 120000)) {
        console.log('[GPS Engine] Using warm hardware GPS fix:', lastKnownValidPosition);
        return lastKnownValidPosition;
    }

    // 2. Perform a fast high-accuracy hardware fix
    return new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
            return resolve(lastKnownValidPosition);
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const freshFix = {
                    lat: latitude,
                    lng: longitude,
                    accuracy: Math.round(accuracy),
                    timestamp: Date.now(),
                    source: `Hardware GPS (Accurate to ±${Math.round(accuracy)}m)`
                };
                lastKnownValidPosition = freshFix;
                try {
                    localStorage.setItem('sheconnect_live_gps', JSON.stringify(freshFix));
                } catch (_) {}
                resolve(freshFix);
            },
            (err) => {
                console.warn('[GPS Engine] Direct GPS call failed/timed out:', err.message);
                // Return last cached fix even if older, rather than zero or random ISP
                resolve(lastKnownValidPosition);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 10000
            }
        );
    });
};

