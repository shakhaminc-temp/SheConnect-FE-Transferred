import React, { useState } from 'react';
import Navbar from '../components/landing-page/Navbar';
import Hero from '../components/landing-page/Hero';
import About from '../components/landing-page/About';
import Services from '../components/landing-page/Services';
import Join from '../components/landing-page/Join';
import Footer from '../components/landing-page/Footer';
import AuthModal from '../components/auth/AuthModal';

function LandingPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authInitialView, setAuthInitialView] = useState('login');

    const openAuth = (view = 'login') => {
        setAuthInitialView(view);
        setIsAuthOpen(true);
    };
    const closeAuth = () => setIsAuthOpen(false);

    return (
        <div className="font-sans antialiased text-gray-900 bg-white min-h-screen flex flex-col">
            <Navbar onAuthClick={() => openAuth('login')} />
            <main className="flex-grow">
                <Hero onGetStarted={() => openAuth('signup_step1')} />
                <About />
                <Services />
                <Join onAuthClick={() => openAuth('signup_step1')} />
            </main>
            <Footer />
            <AuthModal isOpen={isAuthOpen} onClose={closeAuth} initialView={authInitialView} />
        </div>
    );
}

export default LandingPage;
