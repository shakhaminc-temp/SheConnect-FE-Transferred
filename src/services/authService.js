import api from "../api/axios";
import {
  mockLoginResponse,
  mockUser,
  mockColleges,
} from "../data/mockData";

// ─────────────────────────────────────────────────────────
//  Toggle this flag to switch between mock and real backend
// ─────────────────────────────────────────────────────────
const USE_MOCK = false;

// Helper: simulate network delay so it feels realistic
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────
//  LOGIN  (POST /auth/login)
// ─────────────────────────────────────────────────────────
export const loginUser = async (email_id, password) => {
  if (USE_MOCK) {
    await delay();

    // Check if there's a registered user in localStorage
    const savedUser = localStorage.getItem('mock_registered_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.email_id === email_id && parsedUser.password === password) {
        return {
          data: {
            ...mockLoginResponse,
            user: { ...mockLoginResponse.user, ...parsedUser },
          },
        };
      } else {
        throw { response: { data: { detail: "Invalid email or password" } } };
      }
    }

    // Default mock login
    return {
      data: {
        ...mockLoginResponse,
        user: { ...mockLoginResponse.user, email_id },
      },
    };
  }
  return api.post("/auth/login", { email_id, password });
};

// ─────────────────────────────────────────────────────────
//  SIGNUP  (POST /auth/signup)
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
//  SIGNUP  (POST /auth/signup)
// ─────────────────────────────────────────────────────────
export const signupUser = async (formData) => {
  if (USE_MOCK) {
    await delay();
    return {
      data: {
        message: "Mock signup success",
        otp_token: "mock-token",
      },
    };
  }

  // ✅ Send full payload exactly as backend expects
  return api.post("/auth/signup", {
    name: formData.name,
    email_id: formData.email_id,
    phone_no: formData.phone_no,
    password: formData.password,
    confirm_password: formData.confirm_password,
    college_id: formData.college_id,
    emergency_contacts: formData.emergency_contacts,
  });
};

// ─────────────────────────────────────────────────────────
//  VERIFY SIGNUP OTP  (POST /auth/verify-otp)
// ─────────────────────────────────────────────────────────
export const verifySignupOtp = async (email, otp, otpToken) => {
  return api.post('/auth/verify-otp', {
    email,
    otp,
    otp_token: otpToken,
  });
};
// ─────────────────────────────────────────────────────────
//  FORGOT PASSWORD  (POST /auth/forgot-password)
// ─────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  if (USE_MOCK) {
    await delay();
    return {
      data: {
        message: `Password reset OTP sent to ${email}`,
        otp_token: "mock-forgot-otp-token-xyz789",
      },
    };
  }
   return api.post(`/auth/forgot-password`, { email });
};

// ─────────────────────────────────────────────────────────
//  VERIFY FORGOT-PASSWORD OTP  (POST /auth/verify-forgot-otp)
// ─────────────────────────────────────────────────────────
export const verifyForgotOtp = async (email, otp, otpToken) => {
  return api.post('/auth/verify-forgot-otp', {
    email,
    otp,
    otp_token: otpToken,
  });
};

// ─────────────────────────────────────────────────────────
//  RESET PASSWORD  (POST /auth/reset-password)
// ─────────────────────────────────────────────────────────
export const resetPassword = async (formData) => {
  return api.post('/auth/reset-password', {
    email: formData.email,
    otp: formData.otp,
    otp_token: formData.otp_token,
    new_password: formData.new_password,
    confirm_password: formData.confirm_password,
  });
};

// ─────────────────────────────────────────────────────────
//  RESEND OTP  (POST /auth/resend-otp)
// ─────────────────────────────────────────────────────────
export const resendOtp = async (email, purpose) => {
  if (USE_MOCK) {
    await delay();
    return { data: { message: `OTP resent to ${email}`, success: true } };
  }

  return api.post('/auth/resend-otp', {
    email,
    purpose,
  });
};
// ─────────────────────────────────────────────────────────
//  GET PROFILE  (GET /auth/me)
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
//  GET PROFILE  (GET /auth/home)
// ─────────────────────────────────────────────────────────
export const getProfile = async () => {
  if (USE_MOCK) {
    await delay(400);

    const savedUser = localStorage.getItem('mock_registered_user');

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      return { data: { ...mockUser, ...parsedUser } };
    }

    return { data: mockUser };
  }

  return api.get("/auth/me");
};

// ─────────────────────────────────────────────────────────
//  GET COLLEGES  (GET /auth/colleges)
// ─────────────────────────────────────────────────────────
export const getColleges = async () => {
  if (USE_MOCK) {
    await delay(300);
    return { data: mockColleges };
  }
  return api.get("/auth/colleges");
};
