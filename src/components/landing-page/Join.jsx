import React from 'react';

const Join = ({ onAuthClick }) => {
    return (
        <section className="bg-pink-600 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Ready to join the movement?</span>
                    <span className="block text-pink-200">Start your journey with She Connect today.</span>
                </h2>
                <div className="mt-8 flex justify-center">
                    <div className="inline-flex rounded-md shadow">
                        <button
                            onClick={onAuthClick}
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-pink-50"
                        >
                            Sign Up Now
                        </button>
                    </div>
                    <div className="ml-3 inline-flex rounded-md shadow">
                        <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-700 hover:bg-pink-800">
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Join;
