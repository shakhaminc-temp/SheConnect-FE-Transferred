import React from 'react';

const Hero = () => {
    return (
        <section id="home" className="relative pt-20 pb-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                    Empowering Women to <br />
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Connect & Thrive</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Join a community of inspiring women. Network, learn, and grow together in a supportive environment designed for your success.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button className="px-8 py-4 bg-pink-600 text-white rounded-full font-semibold text-lg hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Get Started
                    </button>
                    <button className="px-8 py-4 bg-white text-pink-600 border border-pink-200 rounded-full font-semibold text-lg hover:bg-pink-50 transition-all shadow-md hover:shadow-lg">
                        Learn More
                    </button>
                </div>
            </div>

            {/* Optional visual element or image placeholder */}
            <div className="mt-16 w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white/40 backdrop-blur-sm border border-white/50 p-2">
                <div className="aspect-[16/9] bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center text-gray-400">
                    <span className="text-lg">Interactive Community Dashboard Preview</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
