import React, { useEffect, useState } from 'react';
import { GraduationCap, Mail, Phone, Lock, ChevronRight, ChevronLeft, ShieldCheck, Heart, Users, Eye, EyeOff, User } from 'lucide-react';
import { getColleges } from '../../services/authService';

const Signup = ({
    view,
    setView,
    fullName,
    setFullName,
    college,
    setCollege,
    email,
    setEmail,
    phone,
    setPhone,
    gender,
    setGender,
    emergency1,
    setEmergency1,
    emergency2,
    setEmergency2,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otp,
    setOtp,
    handleSignUpStep1,
    handleSignUpStep2,
    handleSignUpStep3,
    handleSignUpStep4,
    handleBackToLogin,
    fieldErrors,
    validateField
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [collegesList, setCollegesList] = useState([]);
    
    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const res = await getColleges();
                setCollegesList(res.data);
            } catch (e) {
                console.error("Failed to fetch colleges");
            }
        };
        fetchColleges();
    }, []);

    const steps = [
        { id: 'signup_step1', label: 'Identity' },
        { id: 'signup_step2', label: 'Safety' },
        { id: 'signup_step3', label: 'Secure' },
        { id: 'signup_step4', label: 'Verify' }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === view);

    return (
        <div className="w-full">
            {/* Progress Indicator */}
            <div className="mb-8 relative">
                <div className="flex justify-between items-center relative z-10 px-2">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${idx <= currentStepIndex
                                ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-200'
                                : 'bg-white text-gray-300 border-gray-100'
                                }`}>
                                {idx < currentStepIndex ? <ShieldCheck size={20} /> : <span className="font-bold text-sm">{idx + 1}</span>}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest mt-2 transition-colors duration-500 ${idx <= currentStepIndex ? 'text-pink-600' : 'text-gray-300'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Connector Line */}
                <div className="absolute top-5 left-8 right-8 h-[2px] bg-gray-100-z-0">
                    <div
                        className="h-full bg-pink-600 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────
                STEP 1: PERSONAL DETAILS
            ───────────────────────────────────────────── */}
            {view === 'signup_step1' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-black text-gray-900 text-center mb-1">Join SheConnect</h3>
                    <p className="text-gray-400 text-center text-sm mb-8 font-medium">Step 1: Tell us about yourself</p>

                    <form onSubmit={handleSignUpStep1} className="space-y-5">
                        {/* Full Name */}
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.fullName ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onBlur={(e) => validateField("fullName", e.target.value)}
                                />
                            </div>
                            {fieldErrors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.fullName}</p>}
                        </div>

                        {/* College Selection */}
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">College</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors z-10" size={18} />
                                <select
                                    required
                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 appearance-none ${fieldErrors.college ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                >
                                    <option value="">Select College</option>
                                    {collegesList.map(c => (
                                        <option key={c.college_id} value={c.college_id}>{c.college_name}</option>
                                    ))}
                                </select>
                            </div>
                            {fieldErrors.college && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.college}</p>}
                        </div>

                        {/* College Email */}
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">College Email</label>
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
                            {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.email}</p>}
                        </div>

                        {/* Phone + Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={16} />
                                    <input
                                        type="tel"
                                        required
                                        className={`w-full pl-10 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 transition-all font-medium text-sm text-gray-900 placeholder:text-gray-300 ${fieldErrors.phone ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                        placeholder="Number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onBlur={(e) => validateField("phone", e.target.value)}
                                    />
                                </div>
                                {fieldErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase tracking-wider">{fieldErrors.phone}</p>}
                            </div>
                            <div className="group">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Gender</label>
                                <select
                                    required
                                    disabled={false}
                                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 transition-all font-medium text-sm text-gray-900 appearance-none disabled:opacity-70"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    Next Step <ChevronRight size={18} />
                                </span>
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <button type="button" onClick={handleBackToLogin} className="text-gray-400 font-bold text-sm hover:text-pink-600 transition-colors">
                                Already have an account? <span className="text-pink-600">Log in</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ─────────────────────────────────────────────
                STEP 2: EMERGENCY CONTACTS
            ───────────────────────────────────────────── */}
            {view === 'signup_step2' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-black text-gray-900 text-center mb-1">Safety First</h3>
                    <p className="text-gray-400 text-center text-sm mb-8 font-medium">Step 2: Trusted contacts for your security</p>

                    <form onSubmit={handleSignUpStep2} className="space-y-6 max-h-[55vh] overflow-y-auto px-1 custom-scrollbar">
                        {/* Contact 1 */}
                        <div className="bg-pink-50/50 p-6 rounded-[32px] border border-pink-100/50 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                                    <Heart size={16} fill="currentColor" />
                                </div>
                                <span className="text-sm font-black text-gray-900 uppercase tracking-wider">Contact #1</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className={`w-full px-5 py-3.5 bg-white border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.emergency1_name ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                    value={emergency1.name}
                                    onChange={(e) => setEmergency1({ ...emergency1, name: e.target.value })}
                                    onBlur={(e) => validateField("emergency1_name", e.target.value)}
                                />
                                {fieldErrors.emergency1_name && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{fieldErrors.emergency1_name}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <input
                                            type="tel"
                                            placeholder="Phone No"
                                            required
                                            className={`w-full px-5 py-3.5 bg-white border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.emergency1_phone ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                            value={emergency1.phone}
                                            onChange={(e) => setEmergency1({ ...emergency1, phone: e.target.value })}
                                            onBlur={(e) => validateField("emergency1_phone", e.target.value)}
                                        />
                                        {fieldErrors.emergency1_phone && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{fieldErrors.emergency1_phone}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            className={`w-full px-5 py-3.5 bg-white border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.emergency1_email ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                            value={emergency1.email}
                                            onChange={(e) => setEmergency1({ ...emergency1, email: e.target.value })}
                                            onBlur={(e) => validateField("emergency1_email", e.target.value)}
                                        />
                                        {fieldErrors.emergency1_email && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{fieldErrors.emergency1_email}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact 2 */}
                        <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100/50 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Users size={16} />
                                </div>
                                <span className="text-sm font-black text-gray-900 uppercase tracking-wider">Contact #2</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className={`w-full px-5 py-3.5 bg-white border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.emergency2_name ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                    value={emergency2.name}
                                    onChange={(e) => setEmergency2({ ...emergency2, name: e.target.value })}
                                    onBlur={(e) => validateField("emergency2_name", e.target.value)}
                                />
                                {fieldErrors.emergency2_name && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{fieldErrors.emergency2_name}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <input
                                            type="tel"
                                            placeholder="Phone No"
                                            required
                                            className={`w-full px-5 py-3.5 bg-white border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.emergency2_phone ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                            value={emergency2.phone}
                                            onChange={(e) => setEmergency2({ ...emergency2, phone: e.target.value })}
                                            onBlur={(e) => validateField("emergency2_phone", e.target.value)}
                                        />
                                        {fieldErrors.emergency2_phone && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{fieldErrors.emergency2_phone}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            className={`w-full px-5 py-3.5 bg-white border-none rounded-2xl focus:ring-2 transition-all font-medium text-gray-900 placeholder:text-gray-300 ${fieldErrors.emergency2_email ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-pink-500'}`}
                                            value={emergency2.email}
                                            onChange={(e) => setEmergency2({ ...emergency2, email: e.target.value })}
                                            onBlur={(e) => validateField("emergency2_email", e.target.value)}
                                        />
                                        {fieldErrors.emergency2_email && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{fieldErrors.emergency2_email}</p>}
                                    </div>
                                </div>
                            </div>
                            {fieldErrors.contactMatch && (
                                <p className="text-center text-[11px] text-red-500 font-black uppercase tracking-widest mt-2 bg-red-50 py-2 rounded-xl border border-red-100 animate-pulse">
                                    {fieldErrors.contactMatch}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4 pb-2">
                            <button type="button" onClick={() => setView('signup_step1')} className="flex-1 py-4 bg-white border border-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button type="submit" className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-2 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    Continue <ChevronRight size={18} />
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ─────────────────────────────────────────────
                STEP 3: PASSWORD
            ───────────────────────────────────────────── */}
            {view === 'signup_step3' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-black text-gray-900 text-center mb-1">Stay Secure</h3>
                    <p className="text-gray-400 text-center text-sm mb-8 font-medium">Step 3: Create a strong password</p>

                    <form onSubmit={handleSignUpStep3} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">New Password</label>
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
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Confirm Password</label>
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

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setView('signup_step2')} className="flex-1 py-4 bg-white border border-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button type="submit" className="flex-[2] py-4 bg-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-pink-100 hover:bg-pink-700 transition-all flex items-center justify-center gap-2">
                                <span className="flex items-center gap-2 text-white">
                                    Sign Up <ChevronRight size={18} />
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ─────────────────────────────────────────────
                STEP 4: VERIFY OTP
            ───────────────────────────────────────────── */}
            {view === 'signup_step4' && (
                <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-100/50">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1">Verify Email</h3>
                    <p className="text-gray-400 text-sm mb-8 font-medium">
                        Enter the 6-digit code sent to <br />
                        <span className="text-gray-900 font-bold">{email}</span>
                    </p>

                    <form onSubmit={handleSignUpStep4} className="space-y-6">
                        <div className="group">
                            <div className="relative max-w-[240px] mx-auto">
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    className="w-full text-center py-5 bg-gray-50 border-none rounded-[24px] focus:ring-4 focus:ring-green-500/20 transition-all font-black text-3xl tracking-[0.5em] text-gray-900 placeholder:text-gray-200"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                                Confirm & Join <ChevronRight size={20} />
                            </button>

                            <button type="button" onClick={() => setView('signup_step3')} className="text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors uppercase tracking-widest">
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Signup;