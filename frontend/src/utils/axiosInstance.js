import axios from "axios";
import API_PATHS from "./apiPaths";
import { ENV } from "./env.js";

const axiosInstance = axios.create({
  baseURL: ENV.BACKEND_URL,
  withCredentials: true, //for cookies
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    
    // 🟢 Ignore public auth routes so they show their actual backend error messages
    if (
      originalRequest.url.includes("/login") || 
      originalRequest.url.includes("/forgot-password") ||
      originalRequest.url.includes("/register") 
    ) {
       return Promise.reject(error);
    }
    
    if (originalRequest.url.includes(API_PATHS.AUTH.REFRESH)) {
       return Promise.reject(error);  //if the refresh endpt itself fails ie token has expired ; login again
    }
    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post(API_PATHS.AUTH.REFRESH);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


