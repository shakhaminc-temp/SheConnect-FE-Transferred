import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import StartTrip from './pages/StartTrip';
import Blog from './pages/Blog';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import LiveConnection from './pages/LiveConnection';
import WaitingRoom from './pages/WaitingRoom';
import Carpooling from './pages/Carpooling';
import OfferRide from './pages/OfferRide';
import LiveCarpoolConnection from './pages/LiveCarpoolConnection';
import ChatHistory from './pages/ChatHistory';

import ConnectedPersonal from './components/ConnectedPersonal';
import ConnectedAnonymous from "./components/ConnectedAnonymous";



function App() {
  useEffect(() => {
    // Backend health check removed as it was causing JSON parsing errors
  }, []);

  return (
    <AuthProvider>
      <TripProvider>
        <Router basename="/sheconnect">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/start-trip"
              element={
                <ProtectedRoute>
                  <StartTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <Blog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-connection"
              element={
                <ProtectedRoute>
                  <LiveConnection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiting-room"
              element={
                <ProtectedRoute>
                  <WaitingRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carpooling"
              element={
                <ProtectedRoute>
                  <Carpooling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offer-ride"
              element={
                <ProtectedRoute>
                  <OfferRide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-carpool"
              element={
                <ProtectedRoute>
                  <LiveCarpoolConnection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat-history"
              element={
                <ProtectedRoute>
                  <ChatHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connected-personal"
              element={
                <ProtectedRoute>
                  <ConnectedPersonal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connected-anonymous"
              element={
                <ConnectedAnonymous />
              }
            />
          </Routes>
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
