import React from 'react';
import { Mail, Key, Lock, ShieldCheck, ArrowLeft, Send, Check, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = ({
    view,
    setView,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otp,
    setOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleBackToLogin,
    setMessage,
    fieldErrors,
    validateField,
    loading
}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* FORGOT PASSWORD - STEP 1 (EMAIL) */}
            {view === 'forgot_email' && (
                <>
                    <div className="text-center mb-1">
                        <h3 className="text-3xl font-black text-gray-900">Reset Password</h3>
                        <p className="text-gray-400 text-sm font-medium mt-1 mb-8">Receive an OTP to reset your account</p>
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-left">Registered Email ID</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.email ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                    placeholder="yourname@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={(e) => validateField("email", e.target.value)}
                                />
                            </div>
                            {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider text-left">{fieldErrors.email}</p>}
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-50">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    {loading ? 'Sending...' : <><Send size={18} /> Generate OTP</>}
                                </span>
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <button type="button" onClick={handleBackToLogin} className="text-gray-400 font-bold text-sm hover:text-pink-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                                <ArrowLeft size={16} /> Back to Login
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* FORGOT PASSWORD - STEP 2 (OTP) */}
            {view === 'forgot_otp' && (
                <>
                    <div className="text-center mb-1">
                        <h3 className="text-3xl font-black text-gray-900">Verify OTP</h3>
                        <p className="text-gray-400 text-sm font-medium mt-1 mb-8">Enter the code sent to <span className="text-pink-600 font-bold">{email}</span></p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-left">Activation Code</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 transition-all font-black text-xl tracking-[0.5em] text-gray-900 placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-medium"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-50">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    {loading ? 'Verifying...' : <><Check size={18} /> Verify & Continue</>}
                                </span>
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <button type="button" onClick={() => { setView('forgot_email'); setMessage({ type: '', text: '' }); }} className="text-pink-600 font-bold text-sm hover:text-pink-500 transition-colors">
                                Didn't receive OTP? <span className="underline">Resend OTP</span>
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* FORGOT PASSWORD - STEP 3 (RESET) */}
            {view === 'forgot_reset' && (
                <>
                    <div className="text-center mb-1">
                        <h3 className="text-3xl font-black text-gray-900">Set New Password</h3>
                        <p className="text-gray-400 text-sm font-medium mt-1 mb-8">Choose a strong, unique password</p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-left">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.password ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={(e) => validateField("password", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider text-left">{fieldErrors.password}</p>}
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-left">Confirm New Password</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.confirmPassword ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                    placeholder="********"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={(e) => validateField("confirmPassword", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 transition-colors p-1"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider text-left">{fieldErrors.confirmPassword}</p>}
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-50">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    {loading ? 'Updating...' : <><Lock size={18} /> Reset Password</>}
                                </span>
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ForgotPassword;
