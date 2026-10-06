import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/authService';
// import { mockUser } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Using mock user — switch to null + fetchProfile() when backend is ready
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);




    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            sessionStorage.removeItem('token');
            setUser(null);
            const errorDetail = error.response?.data?.detail || error.message || "Unknown error";
            throw new Error(`Profile fetch failed: ${errorDetail}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchProfile();
        } else {
            console.log("[AuthContext] No token found in sessionStorage");
            setLoading(false);
        }
    }, []);

    const login = async (userData) => {
        console.log("AuthContext: login function called with", userData);
        try {
            if (userData.access_token) {
                console.log("AuthContext: token found, saving to sessionStorage");
                sessionStorage.setItem('token', userData.access_token);
                if (userData.refresh_token) {
                    sessionStorage.setItem('refresh_token', userData.refresh_token);
                }

                if (userData.user) {
                    console.log("AuthContext: user data provided in login response, setting user state immediately");
                    setUser(userData.user);
                } else {
                    console.log("AuthContext: no user data in response, fetching profile...");
                    await fetchProfile();
                }
                console.log("AuthContext: login sequence finished");
            } else {
                console.log("AuthContext: no token, setting user directly");
                setUser(userData);
            }
        } catch (error) {
            console.error("AuthContext: Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
