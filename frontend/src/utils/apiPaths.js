const API_PATHS = {

  AUTH: {
    REGISTER: "/api/auth/register",
    VERIFY_OTP: "/api/auth/verify",
    RESEND_OTP: "/api/auth/resend-otp",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    FORGOT_PASSWORD: "/api/auth/forgot-pass",
    RESET_PASSWORD: "/api/auth/reset-pass",
    

    GET_PROFILE: "/api/auth/getProfile",
    UPDATE_PROFILE: "/api/auth/update-prof",
    VERIFY_EMAIL_CHANGE: "/api/auth/verify-email-change",
    

    REGISTER_LISTENER: "/api/auth/register-listener",
  },


  ADMIN: {
    GET_REQUESTS: "/api/admin/requests", 
    FIND_LISTENERS: (sessionId) => `/api/admin/find-listeners/${sessionId}`, 
    ASSIGN_SESSION: (sessionId) => `/api/admin/sessions/${sessionId}/assign`,
  },

  LISTENER: {
    APPLY: "/api/listener/apply", 
    DASHBOARD: "/api/listener/dashboard",
    TOGGLE_AVAILABILITY: "/api/listener/availability", 
    SESSION: "/api/listener/sessions",
    UPDATE_PROFILE: "/api/listener/update-profile",
    UPLOAD_URL: "/api/listener/presigned-url"
  },

  
  MANAGER: {
    GET_PENDING_APPS: "/api/applications/pending",
    REVIEW_APP: (appId) => `/api/applications/application/${appId}/review`, // Approve/Reject
  },


  SESSION: {
    APPLY: "/api/session/apply", 
    CAN_JOIN: (sessionId) => `/api/session/canJoin/${sessionId}`, // Lobby check
    HISTORY: "/api/session/history", // Past sessions
    GET_MESSAGES: (sessionId) => `/api/session/${sessionId}/messages`,
    COMPLETE : "/api/session/complete"
  },

  
  USER: {
    DASHBOARD: "/api/user/dashboard",
    SUBMIT_FEEDBACK: (sessionId) => `/api/user/${sessionId}/review`
  },

  
  WALLET: {
    CREDIT: "/api/wallet/credit",
    HISTORY: "/api/wallet/history",
    // BALANCE: "/api/wallet/balance",
    CREATE_ORDER: "/api/wallet/create-order",
    VERIFY: "/api/wallet/verify-payment"
  },
};

export default API_PATHS;