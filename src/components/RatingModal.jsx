import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, onSubmit, driverName }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);
        try {
            await onSubmit({ rating, review });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Failed to submit rating", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 to-pink-500 p-6 text-white relative">
                    {!submitted && (
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    )}
                    <h2 className="text-2xl font-black text-center">Trip Completed!</h2>
                    <p className="text-pink-100 text-center font-medium mt-1">
                        How was your ride with {driverName || 'your driver'}?
                    </p>
                </div>

                <div className="p-8">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star size={40} className="fill-green-500" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-gray-500 font-medium">Your feedback helps keep our community safe and reliable.</p>
                        </div>
                    ) : (
                        <>
                            {/* Star Rating */}
                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(rating)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star 
                                            size={48} 
                                            className={`${
                                                star <= (hover || rating) 
                                                    ? 'fill-yellow-400 text-yellow-400' 
                                                    : 'fill-gray-100 text-gray-200'
                                            } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Review Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Leave a compliment or review (optional)</label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Safe driving, great music, very polite..."
                                    className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-pink-500 outline-none resize-none transition-all h-28 text-gray-900 font-medium"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || loading}
                                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Submit Rating'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
