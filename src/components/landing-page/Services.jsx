import React from 'react';

const Services = () => {
    const services = [
        {
            title: 'Mentorship Programs',
            description: 'Connect with experienced mentors who can guide you through your career and personal life.',
            icon: '🌱'
        },
        {
            title: 'Networking Events',
            description: 'Join exclusive events, workshops, and meetups designed to expand your professional circle.',
            icon: '🤝'
        },
        {
            title: 'Skill Workshops',
            description: 'Learn new skills from industry experts in our interactive online and offline workshops.',
            icon: '📚'
        },
        {
            title: 'Wellness Support',
            description: 'Access resources and support groups focused on mental and physical well-being.',
            icon: '🧘‍♀️'
        }
    ];

    return (
        <section id="services" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base text-pink-600 font-semibold tracking-wide uppercase">Our Services</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        What We Offer
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        Tailored services designed to help you succeed in every aspect of your life.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center text-center">
                            <div className="text-4xl mb-4 bg-pink-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                            <p className="text-gray-500">{service.description}</p>
                            <button className="mt-auto pt-4 text-pink-600 font-medium hover:text-pink-800 transition-colors">
                                Learn more &rarr;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
