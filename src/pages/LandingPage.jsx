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

    const openAuth = () => setIsAuthOpen(true);
    const closeAuth = () => setIsAuthOpen(false);

    return (
        <div className="font-sans antialiased text-gray-900 bg-white min-h-screen flex flex-col">
            <Navbar onAuthClick={openAuth} />
            <main className="flex-grow">
                <Hero />
                <About />
                <Services />
                <Join onAuthClick={openAuth} />
            </main>
            <Footer />
            <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
        </div>
    );
}

export default LandingPage;
