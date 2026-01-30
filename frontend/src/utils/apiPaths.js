const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    VERIFY_OTP: "/api/auth/verify",
    RESEND_OTP: "/api/auth/resend-otp",

    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",

    GET_PROFILE: "/api/auth/getProfile",
    UPDATE_PROFILE: "/api/auth/update-prof",

    FORGOT_PASSWORD: "/api/auth/forgot-pass",
    RESET_PASSWORD: "/api/auth/reset-pass",

    VERIFY_EMAIL_CHANGE: "/api/auth/verify-email-change",
  },
};

export default API_PATHS;
