import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import api from "../api/axios";

const MapLibreMap = ({ startCoords, endCoords, mode = 'route', showSOS = true }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeAnimationRef = useRef(null);
  const markersRef = useRef([]);

  const [sosStatus, setSosStatus] = useState("idle"); // idle, sending, success, error
  const userLocationMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const endCoordsRef = useRef(endCoords);
  const lastFetchRef = useRef(0);
  const lastLocationRef = useRef(null);

  useEffect(() => {
    endCoordsRef.current = endCoords;
  }, [endCoords]);

  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 999;
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // distance in km
  };

  // Initialization Effect
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [78.9629, 20.5937],
      zoom: 4,
      antialias: true,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), "bottom-left");

    // Add Live tracking right here
    const createLiveMarkerElement = () => {
      const el = document.createElement("div");
      el.className = "live-marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#3b82f6";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 0 10px rgba(59, 130, 246, 0.8)";
      return el;
    };

    const fetchLiveRoute = async (userLngLat) => {
      const endC = endCoordsRef.current;
      if (!endC || !map.current || !map.current.getSource("route")) return;
      const getLngLat = (coords) => (coords && !isNaN(coords[0]) && !isNaN(coords[1]) ? [coords[1], coords[0]] : null);
      const endLL = getLngLat(endC);
      if (!endLL) return;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLngLat[0]},${userLngLat[1]};${endLL[0]},${endLL[1]}?geometries=geojson&overview=full`;
      try {
        const response = await fetch(osrmUrl);
        const data = await response.json();
        if (data.routes && data.routes.length > 0 && map.current && map.current.getSource("route")) {
          const roadCoords = data.routes[0].geometry.coordinates;
          map.current.getSource("route").setData({
             type: "Feature",
             geometry: { type: "LineString", coordinates: roadCoords }
          });
        }
      } catch (e) {
        console.error("Live routing error", e);
      }
    };

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLngLat = [longitude, latitude];

          if (!userLocationMarkerRef.current && map.current) {
            userLocationMarkerRef.current = new maplibregl.Marker({ element: createLiveMarkerElement() })
              .setLngLat(userLngLat)
              .addTo(map.current);
          } else if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLngLat(userLngLat);
          }

          if (endCoordsRef.current && map.current && map.current.getSource("route")) {
             const dist = calculateDistance(lastLocationRef.current, userLngLat);
             
             if (lastLocationRef.current === null) {
                 // Seed the initial location, but don't overwrite the initial route yet
                 lastLocationRef.current = userLngLat;
             } else if (dist > 0.02 && dist < 10) { 
                 // Only recalculate if they actually physically moved > 20 meters.
                 // (dist < 10km prevents sudden jumps if GPS glitches)
                 lastLocationRef.current = userLngLat;
                 fetchLiveRoute(userLngLat);
             }
          }
        },
        (error) => console.error("Error watching position:", error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Map Update Effect
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;
    let isStale = false;

    // Clear previous animations
    if (routeAnimationRef.current) {
      cancelAnimationFrame(routeAnimationRef.current);
    }

    const updateMapElements = async () => {
      // Deep comparison check to skip redundant updates
      const prevStart = mapInstance._lastStartCoords;
      const prevEnd = mapInstance._lastEndCoords;

      const isSame = (c1, c2) => {
        if (!c1 && !c2) return true;
        if (!c1 || !c2) return false;
        return c1[0] === c2[0] && c1[1] === c2[1];
      };

      const coordinatesChanged = !isSame(prevStart, startCoords) || !isSame(prevEnd, endCoords);

      mapInstance._lastStartCoords = startCoords;
      mapInstance._lastEndCoords = endCoords;

      // If coordinates haven't changed, ensure the route is fully drawn if it was mid-animation
      if (!coordinatesChanged) {
        if (mapInstance.getSource("route") && mapInstance._fullRouteCoords) {
          mapInstance.getSource("route").setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: mapInstance._fullRouteCoords },
          });
        }
        return;
      }

      // Cleanup existing markers using Ref instead of DOM search
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const getLngLat = (coords) => (coords && !isNaN(coords[0]) && !isNaN(coords[1]) ? [coords[1], coords[0]] : null);
      const startLL = getLngLat(startCoords);
      const endLL = getLngLat(endCoords);

      const createMarkerElement = (color, label) => {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "40px";
        el.style.height = "50px";
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.innerHTML = `
          <div style="background: white; padding: 2px 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: -4px; position: relative; z-index: 1; border: 1px solid rgba(0,0,0,0.05); color: ${color}">${label}</div>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        `;
        return el;
      };

      if (startLL) {
        const label = mode === 'starts' ? 'You' : 'Source';
        const color = mode === 'starts' ? '#ec4899' : '#ef4444'; // Pink for You, Red for Source
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`<strong>${label}</strong>`);
        const marker = new maplibregl.Marker({ element: createMarkerElement(color, label), anchor: 'bottom' })
          .setLngLat(startLL)
          .setPopup(popup)
          .addTo(mapInstance);
        markersRef.current.push(marker);
      }
      if (endLL) {
        const label = mode === 'starts' ? 'Partner' : 'Destination';
        const color = mode === 'starts' ? '#3b82f6' : '#2563eb'; // Blue for Partner/Dest
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`<strong>${label}</strong>`);
        const marker = new maplibregl.Marker({ element: createMarkerElement(color, label), anchor: 'bottom' })
          .setLngLat(endLL)
          .setPopup(popup)
          .addTo(mapInstance);
        markersRef.current.push(marker);
      }

      if (startLL && endLL) {
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLL[0]},${startLL[1]};${endLL[0]},${endLL[1]}?geometries=geojson&overview=full`;
          const response = await fetch(osrmUrl);
          const data = await response.json();

          if (isStale) return; // Cleanup check

          if (data.routes && data.routes.length > 0) {
            const roadCoordinates = data.routes[0].geometry.coordinates;
            mapInstance._fullRouteCoords = roadCoordinates;
            setupRouteLayers(roadCoordinates);
          } else {
            const fallback = [startLL, endLL];
            mapInstance._fullRouteCoords = fallback;
            setupRouteLayers(fallback);
          }
        } catch (error) {
          console.error("OSRM Routing Error:", error);
          if (!isStale) setupRouteLayers([startLL, endLL]);
        }
      } else {
        removeRoute();
        // Fly to single marker if only one exists
        if (startLL) mapInstance.flyTo({ center: startLL, zoom: 14, speed: 1.2 });
        else if (endLL) mapInstance.flyTo({ center: endLL, zoom: 14, speed: 1.2 });
      }
    };

    const removeRoute = () => {
      if (mapInstance.getLayer("route")) mapInstance.removeLayer("route");
      if (mapInstance.getLayer("route-glow")) mapInstance.removeLayer("route-glow");
      if (mapInstance.getSource("route")) mapInstance.removeSource("route");
    };

    const setupRouteLayers = (fullCoordinates) => {
      if (isStale) return;
      removeRoute();

      mapInstance.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [fullCoordinates[0], fullCoordinates[0]],
          },
        },
      });

      mapInstance.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        paint: { "line-color": "#ec4899", "line-width": 10, "line-blur": 8, "line-opacity": 0.3 },
      });

      mapInstance.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#ec4899", "line-width": 5 },
      });

      // Frame the full route immediately
      const bounds = fullCoordinates.reduce((b, coord) => b.extend(coord), new maplibregl.LngLatBounds(fullCoordinates[0], fullCoordinates[0]));
      mapInstance.fitBounds(bounds, { padding: 60, animate: true, duration: 2000, maxZoom: 14 });

      // Robust Animation Loop
      let currentStep = 0;
      const totalSteps = fullCoordinates.length;
      const stepSize = Math.max(1, Math.ceil(totalSteps / 60)); // Complete in ~1 second (60fps)

      const animateLine = () => {
        if (isStale) return;

        currentStep += stepSize;

        if (currentStep >= totalSteps) {
          // ENSURE COMPLETION: Set the exact full geom at the end
          if (mapInstance.getSource("route")) {
            mapInstance.getSource("route").setData({
              type: "Feature",
              geometry: { type: "LineString", coordinates: fullCoordinates },
            });
          }
          return;
        }

        const partialCoords = fullCoordinates.slice(0, currentStep);
        // GeoJSON LineString requires at least 2 coordinates
        if (partialCoords.length === 1) {
            partialCoords.push(partialCoords[0]);
        }
        
        if (mapInstance.getSource("route")) {
          try {
            mapInstance.getSource("route").setData({
              type: "Feature",
              geometry: { type: "LineString", coordinates: partialCoords },
            });
          } catch (e) {
            console.warn("Route animation error:", e);
          }
        }

        routeAnimationRef.current = requestAnimationFrame(animateLine);
      };

      animateLine();
    };

    if (mapInstance.loaded()) {
      updateMapElements();
    } else {
      mapInstance.once("load", updateMapElements);
    }

    return () => {
      isStale = true;
      if (routeAnimationRef.current) cancelAnimationFrame(routeAnimationRef.current);
    };
  }, [startCoords, endCoords]);

  const handleSOS = async () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setSosStatus("sending");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          let locationName = "";
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            locationName = data.display_name || "";
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
          }
          await api.post("/emergency-contacts/sos", { lat: latitude, lng: longitude, location_name: locationName });
          setSosStatus("success");
          setTimeout(() => setSosStatus("idle"), 3000);
        } catch (error) {
          console.error("SOS failed:", error);
          setSosStatus("error");
          setTimeout(() => setSosStatus("idle"), 3000);
        }
      },
      (error) => {
        console.error("Could not get location for SOS:", error);
        setSosStatus("error");
        setTimeout(() => setSosStatus("idle"), 3000);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="map-wrapper" style={{ position: "relative", width: "100%", height: "450px", marginTop: "1rem" }}>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(0,0,0,0.05)",
          animation: "fadeIn 0.8s ease-out"
        }}
      />
      {/* SOS BUTTON */}
      {showSOS && (
        <button
        onClick={handleSOS}
        disabled={sosStatus === "sending"}
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          zIndex: 10,
          backgroundColor: sosStatus === "success" ? "#10b981" : "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontWeight: "900",
          fontSize: "16px",
          boxShadow: "0 4px 15px rgba(220, 38, 38, 0.5)",
          cursor: sosStatus === "sending" ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          animation: sosStatus === "idle" ? "pulse 2s infinite" : "none"
        }}
      >
        {sosStatus === "sending" ? "..." : sosStatus === "success" ? "SENT" : "SOS"}
      </button>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .maplibregl-ctrl-group {
          border-radius: 12px !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .maplibregl-popup-content {
          border-radius: 12px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default MapLibreMap;
