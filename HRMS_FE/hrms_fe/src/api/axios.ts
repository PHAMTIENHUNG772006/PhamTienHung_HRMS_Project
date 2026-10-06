import axios from 'axios';
import { logout } from '../utils/cookies';
import { getInMemoryToken, setInMemoryToken } from './tokenStorage';

const baseURL = import.meta.env.VITE_API_URL || 'https://hrms-backend-hkr2.onrender.com/api/';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getInMemoryToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: handle 401 and silent refresh
axiosInstance.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    
    if (status === 401 && !originalRequest._retry) {
      // Avoid looping if the refresh request itself fails
      if (originalRequest.url?.includes('v1/auth/refresh-token')) {
        try {
          logout();
        } catch (e) {
          // ignore
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        const refreshResp = await axios.post(
          `${baseURL}v1/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );
        
        const newAccessToken = refreshResp.data?.data?.accessToken;
        const newRefreshToken = refreshResp.data?.data?.refreshToken;
        if (newAccessToken) {
          setInMemoryToken(newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          isRefreshing = false;
          return axiosInstance(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        try {
          logout();
        } catch (e) {
          // ignore
        }
        return Promise.reject(refreshErr);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
