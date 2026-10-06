/*import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

const LocationInput = ({ label, value, onChange, placeholder }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`
                );
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching location suggestions:", error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (value && showSuggestions) { // Only fetch if user is typing and wants suggestions
                // Ideally we'd have a separate state for 'inputValue' vs 'selectedValue' to prevent 
                // re-fetching when clicking a suggestion, but for now we'll just check if 
                // the input matches exactly one of the known suggestions to avoid loop, 
            }
            // For a simple implementation, we'll fetch when value changes
            // Optimization: Don't fetch if the value was just set by clicking a suggestion
            // We can handle this by passing a flag or just checking length
            fetchSuggestions();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [value]);


    const handleSelect = (suggestion) => {
        onChange(suggestion.display_name); // Or suggestion.name based on preference
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        // Force show suggestions when typing
                        if (e.target.value.length >= 3) setShowSuggestions(true);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((item) => (
                        <li
                            key={item.place_id}
                            onClick={() => handleSelect(item)}
                            className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                            {item.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationInput; */
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Search } from "lucide-react";
import { autocomplete } from "../services/geoService";

const LocationInput = ({ label, value, onChange, placeholder, error }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [history, setHistory] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Load history on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem("searchHistory");
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const saveToHistory = (item) => {
        const name = item.label || item.name || item.address?.city || item.address?.town || item.address?.suburb || item.address?.village;
        const coords = [parseFloat(item.lat), parseFloat(item.lng || item.lon)];

        const newHistoryItem = { name, coords, id: item.place_id };

        let updatedHistory = [newHistoryItem, ...history.filter(h => h.name !== name)].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value || value.length < 1) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const data = await autocomplete(value);
                setSuggestions(data.results || []);
            } catch (error) {
                console.error("Autocomplete Error:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            if (showSuggestions) {
                fetchSuggestions();
            }
        }, 400);

        return () => clearTimeout(debounceTimer);
    }, [value, showSuggestions]);

    const handleSelect = (item) => {
        const name = item.label || item.name || item.address?.city || item.address?.town;
        const coords = item.coords || [item.lat, item.lng];

        if (!item.coords) {
            saveToHistory(item);
        }

        onChange(name, coords);
        setShowSuggestions(false);
    };

    return (
        <div className="relative group" ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5 transition-colors group-focus-within:text-pink-600">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => {
                        if (value.length >= 1) setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all shadow-sm bg-white/50 backdrop-blur-sm ${error ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-300 focus:ring-pink-500/20 focus:border-pink-500 hover:border-gray-400'}`}
                />
                <MapPin
                    className="absolute left-3 top-3 text-gray-400 group-focus-within:text-pink-500 transition-colors"
                    size={18}
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-3 text-pink-500 animate-spin" size={18} />
                )}
            </div>

            {showSuggestions && (suggestions.length > 0 || (value.length === 0 && history.length > 0)) && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {value.length === 0 ? "Recent Searches" : "Suggestions"}
                        </span>
                        {value.length === 0 && (
                            <span className="text-[10px] text-gray-400">Your latest travels</span>
                        )}
                    </div>
                    <ul className="max-h-64 overflow-y-auto py-1.5">
                        {(value.length === 0 ? history : suggestions).map((item) => (
                            <li
                                key={item.place_id || item.id || Math.random().toString()}
                                onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                                className="px-4 py-3 hover:bg-pink-50 cursor-pointer flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0"
                            >
                                <div className="mt-0.5 bg-gray-100 p-1.5 rounded-lg text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                    {value.length === 0 ? <Loader2 className="animate-none" size={14} /> : <Search size={14} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {item.label || item.name || item.address?.city || item.address?.town}
                                    </span>
                                    {item.display_name && (
                                        <span className="text-xs text-gray-500 truncate max-w-[220px]" >
                                            {item.display_name}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LocationInput;
