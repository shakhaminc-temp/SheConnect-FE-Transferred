import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '../../context/AuthContext';
import { loginUser, signupUser, verifySignupOtp, forgotPassword, verifyForgotOtp, resetPassword } from "../../services/authService";

const AuthModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [view, setView] = useState('login'); // login, signup_step1, signup_step2, signup_step3, signup_step4, forgot_email, forgot_otp, forgot_reset

    // Login & Common State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'
    const [loading, setLoading] = useState(false);

    // Signup Specific State
    const [fullName, setFullName] = useState('');
    const [college, setCollege] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');

    const [emergency1, setEmergency1] = useState({ name: '', phone: '', email: '' });
    const [emergency2, setEmergency2] = useState({ name: '', phone: '', email: '' });

    const [fieldErrors, setFieldErrors] = useState({}); // { email: 'Error message', ... }

    if (!isOpen) return null;

    const resetState = () => {
        setView('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        setFullName('');
        setCollege('');
        setPhone('');
        setGender('');
        setEmergency1({ name: '', phone: '', email: '' });
        setEmergency2({ name: '', phone: '', email: '' });
        setMessage({ type: '', text: '' });
        setFieldErrors({});
        onClose();
    };

    const handleBackToLogin = () => {
        setView('login');
        setMessage({ type: '', text: '' });
    };

    // --- Validation Helpers ---
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePhone = (phone) => {
        return /^[6-9]\d{9}$/.test(phone);
    };

    const validateName = (name) => {
        return /^[a-zA-Z\s]{2,50}$/.test(name);
    };

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "fullName":
            case "emergency1_name":
            case "emergency2_name":
                if (!validateName(value)) error = "Use only letters (2-50 chars)";
                break;
            case "email":
            case "emergency1_email":
            case "emergency2_email":
                if (value && !validateEmail(value)) error = "Invalid email format";
                break;
            case "phone":
            case "emergency1_phone":
            case "emergency2_phone":
                if (!validatePhone(value)) error = "Must be 10 digits (starting 6-9)";
                break;
            case 'password': {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?':{}|<>])(?=.*\d).{8,10}$/;

  if (!passwordRegex.test(value)) {
    error = '8-10 chars, 1 uppercase, 1 special, 1 number';
  }

  break;
}
            case "confirmPassword":
                if (value !== password) error = "Passwords do not match";
                break;
            default:
                break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: error }));
        return error === "";
    };

    // --- Login Handler ---
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        console.log("Login sequence started...");

        if (loading) {
            console.warn("Login already in progress, skipping.");
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            console.log("Validating credentials:", { email, passwordLength: password?.length });

            if (!email || !password) {
                setMessage({ type: 'error', text: "Please enter both email and password" });
                setLoading(false);
                return;
            }

            if (!validateEmail(email)) {
                setMessage({ type: 'error', text: "Please enter a valid college email format" });
                setLoading(false);
                return;
            }

            console.log("Calling loginUser service...");
            const response = await loginUser(email, password);
            console.log("Service response:", response);

            if (!response || !response.data) {
                throw new Error("No response from authentication service");
            }

            const { access_token, first_login } = response.data;

            if (access_token) {
                console.log("Login success! token found. Updating context...");

                // Show success message immediately before context update to avoid perceived lag
                setMessage({ type: "success", text: "Login successful! Redirecting..." });

                try {
                    await login(response.data);
                    console.log("Context updated successfully");
                    console.log("Redirecting to /home...");
                    navigate("/home");
                    resetState();
                } catch (loginError) {
                    console.error("Error during context login:", loginError);
                    setMessage({ type: 'error', text: loginError.message || 'Failed to fetch user profile. Please try again.' });
                    setLoading(false);
                    return;
                }
            } else if (first_login) {
                console.log("Verification required (first_login). Moving to OTP view.");
                setOtpToken(response.data.otp_token);
                setMessage({ type: "success", text: "Email not verified. OTP sent." });
                setView('signup_step4');
            } else {
                console.error("Unknown response structure:", response.data);
                setMessage({ type: "error", text: "Server returned an unexpected response" });
            }

        } catch (error) {
            console.error("Login catch block triggered:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || error.message || "Login failed"
            });
        } finally {
            setLoading(false);
            console.log("Login sequence finished (loading=false).");
        }
    };

    // --- Sign Up Flow Handlers ---
    const handleSignUpStep1 = (e) => {
        e.preventDefault();

        const isNameValid = validateField("fullName", fullName);
        const isEmailValid = validateField("email", email);
        const isPhoneValid = validateField("phone", phone);

        if (!college) {
            setFieldErrors(prev => ({ ...prev, college: "Please select a college" }));
        } else {
            setFieldErrors(prev => ({ ...prev, college: "" }));
        }

        if (isNameValid && isEmailValid && isPhoneValid && college && gender) {
            setView('signup_step2');
            setMessage({ type: '', text: '' });
        }
    };

    const handleSignUpStep2 = (e) => {
        e.preventDefault();

        const v1_name = validateField("emergency1_name", emergency1.name);
        const v1_phone = validateField("emergency1_phone", emergency1.phone);
        const v2_name = validateField("emergency2_name", emergency2.name);
        const v2_phone = validateField("emergency2_phone", emergency2.phone);

        // Duplicate/Self Checks
        let contactMatchError = "";
        if (emergency1.phone === emergency2.phone) {
            contactMatchError = "Contacts must be different";
        } else if (emergency1.phone === phone || emergency2.phone === phone) {
            contactMatchError = "Cannot use own number";
        }

        setFieldErrors(prev => ({ ...prev, contactMatch: contactMatchError }));

        if (v1_name && v1_phone && v2_name && v2_phone && !contactMatchError) {
            setView('signup_step3');
            setMessage({ type: '', text: '' });
        }
    };

    const handleSignUpStep3 = async (e) => {
        e.preventDefault();

        const isPassValid = validateField("password", password);
        const isConfirmValid = validateField("confirmPassword", confirmPassword);

        if (!isPassValid || !isConfirmValid) return;

        setLoading(true);
        try {
            const payload = {
                name: fullName,
                email_id: email,
                phone_no: phone,
                password: password,
                confirm_password: confirmPassword,
                college_id: parseInt(college),
                emergency_contacts: [
                    {
                        emergency_name: emergency1.name,
                        phone_no: emergency1.phone,
                        email: emergency1.email
                    },
                    {
                        emergency_name: emergency2.name,
                        phone_no: emergency2.phone,
                        email: emergency2.email
                    }
                ]
            };

            const response = await signupUser(payload);

            const { message, otp_token } = response.data;
            setMessage({ type: 'success', text: message });
            
            if (otp_token) {
                setOtpToken(otp_token);
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                    setView('signup_step4');
                }, 1500);
            } else {
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                    setFullName('');
                    setEmail('');
                    setPhone('');
                    setGender('');
                    setCollege('');
                    setEmergency1({ name: '', phone: '', email: '' });
                    setEmergency2({ name: '', phone: '', email: '' });
                    setPassword('');
                    setConfirmPassword('');
                    setView('login');
                }, 2000);
            }

        } catch (error) {
            console.error("Signup error:", error);

            let errorMessage = "Signup failed";

            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    // FastAPI validation errors come as array
                    errorMessage = error.response.data.detail[0].msg;
                } else {
                    errorMessage = error.response.data.detail;
                }
            }

            setMessage({
                type: "error",
                text: errorMessage
            });

        } finally {
            setLoading(false);
        }

    };



    const handleSignUpStep4 = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await verifySignupOtp(email, otp, otpToken);

            setMessage({ type: 'success', text: "Account created successfully! Please log in with your credentials." });

            setTimeout(() => {
                setPassword(''); // Clear password to require manual entry
                setConfirmPassword('');
                setOtp('');
                setLoading(false);
                setView('login');
            }, 2000);

        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Verification failed"
            });
            setLoading(false);
        }
    };

    // --- Forgot Password Handlers ---
    const handleSendOtp = async (e) => {
        e.preventDefault();
        console.log("Sending OTP to:", email);

        if (!validateEmail(email)) {
            setMessage({ type: 'error', text: "Please enter a valid email address" });
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPassword(email);
            setOtpToken(response.data.otp_token);
            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setLoading(false);
                setView('forgot_otp');
            }, 2000);
        } catch (error) {
            console.error("Forgot password request failed:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Request failed. Check your connection."
            });
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        console.log("Verifying Forgot OTP...");
        setLoading(true);
        try {
            await verifyForgotOtp(email, otp, otpToken);
            setMessage({ type: 'success', text: 'OTP Verified! Please set your new password.' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setLoading(false);
                setView('forgot_reset');
            }, 1000);
        } catch (error) {
            console.error("Forgot OTP verification failed:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Invalid OTP. Please check again."
            });
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        console.log("Reset password triggered");

        const isPassValid = validateField("password", password);
        const isConfirmValid = validateField("confirmPassword", confirmPassword);

        if (!isPassValid || !isConfirmValid) return;

        setLoading(true);
        try {
            await resetPassword({
            email,
            otp,
            otp_token: otpToken,
            new_password: password,
            confirm_password: confirmPassword
});
            setMessage({ type: 'success', text: "Password reset successfully! Redirecting to login..." });
            setTimeout(() => {
                setLoading(false);
                handleBackToLogin();
            }, 1500);
        } catch (error) {
            console.error("Reset password failed:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Reset failed. Please try again."
            });
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" aria-hidden="true" onClick={resetState}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-[48px] text-left overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative border border-white">
                    {/* Background Blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-40 -z-10"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-40 -z-10"></div>
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={resetState}>
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start justify-center">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                {message.text && (
                                    <div className={`mb-4 p-3 rounded text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {view === 'login' && (
                                    <Login
                                        email={email}
                                        setEmail={setEmail}
                                        password={password}
                                        setPassword={setPassword}
                                        handleLogin={handleLogin}
                                        setView={setView}
                                        setMessage={setMessage}
                                        loading={loading}
                                        fieldErrors={fieldErrors}
                                        validateField={validateField}
                                    />
                                )}

                                {view.startsWith('signup') && (
                                    <Signup
                                        view={view}
                                        setView={setView}
                                        fullName={fullName}
                                        setFullName={setFullName}
                                        college={college}
                                        setCollege={setCollege}
                                        email={email}
                                        setEmail={setEmail}
                                        phone={phone}
                                        setPhone={setPhone}
                                        gender={gender}
                                        setGender={setGender}
                                        emergency1={emergency1}
                                        setEmergency1={setEmergency1}
                                        emergency2={emergency2}
                                        setEmergency2={setEmergency2}
                                        password={password}
                                        setPassword={setPassword}
                                        confirmPassword={confirmPassword}
                                        setConfirmPassword={setConfirmPassword}
                                        otp={otp}
                                        setOtp={setOtp}
                                        handleSignUpStep1={handleSignUpStep1}
                                        handleSignUpStep2={handleSignUpStep2}
                                        handleSignUpStep3={handleSignUpStep3}
                                        handleSignUpStep4={handleSignUpStep4}
                                        handleBackToLogin={handleBackToLogin}
                                        fieldErrors={fieldErrors}
                                        validateField={validateField}
                                    />
                                )}

                                {view.startsWith('forgot') && (
                                    <ForgotPassword
                                        view={view}
                                        setView={setView}
                                        email={email}
                                        setEmail={setEmail}
                                        password={password}
                                        setPassword={setPassword}
                                        confirmPassword={confirmPassword}
                                        setConfirmPassword={setConfirmPassword}
                                        otp={otp}
                                        setOtp={setOtp}
                                        handleSendOtp={handleSendOtp}
                                        handleVerifyOtp={handleVerifyOtp}
                                        handleResetPassword={handleResetPassword}
                                        handleBackToLogin={handleBackToLogin}
                                        setMessage={setMessage}
                                        fieldErrors={fieldErrors}
                                        validateField={validateField}
                                        loading={loading}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
