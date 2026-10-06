import React from 'react';
import { Shield, User, Lock, ArrowRight, X } from 'lucide-react';

const PrivacyModal = ({ isOpen, onClose, onConfirm, partnerName }) => {
    const [selectedType, setSelectedType] = React.useState('anonymous');

    if (!isOpen) return null;

    const options = [
        {
            id: 'anonymous',
            title: 'Stay Anonymous',
            desc: 'Only show your Anonymous ID. Your name and phone number will remain hidden.',
            icon: Shield,
            color: 'bg-blue-50 text-blue-600',
            borderColor: 'border-blue-100'
        },
        {
            id: 'details',
            title: 'Share Personal Details',
            desc: 'Share your name, college, and phone number to build more trust.',
            icon: User,
            color: 'bg-pink-50 text-pink-600',
            borderColor: 'border-pink-100'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 border border-gray-100">
                                <Lock size={12} />
                                <span>Privacy Choice</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                How do you want to <span className="text-pink-600">Connect?</span>
                            </h2>
                            <p className="mt-2 text-gray-400 font-medium text-sm">
                                Choose the level of information you want to share with <span className="text-gray-900 font-bold">{partnerName}</span>.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-10">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedType(option.id)}
                                className={`w-full text-left p-6 rounded-[32px] border-2 transition-all duration-300 flex items-start gap-5 group relative overflow-hidden ${selectedType === option.id
                                        ? 'border-pink-600 bg-pink-50/30'
                                        : 'border-gray-50 bg-white hover:border-gray-100'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 ${selectedType === option.id ? 'scale-110 ' + option.color : 'bg-gray-50 text-gray-400'
                                    }`}>
                                    <option.icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-black tracking-tight mb-1 ${selectedType === option.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                                        }`}>
                                        {option.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                        {option.desc}
                                    </p>
                                </div>
                                {selectedType === option.id && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-pink-600 animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => onConfirm(selectedType)}
                            className="w-full py-5 rounded-[24px] bg-gray-900 text-white font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-pink-600 hover:to-rose-600"
                        >
                            Continue to Connect <ArrowRight size={18} />
                        </button>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            You can always update this later in settings
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;
