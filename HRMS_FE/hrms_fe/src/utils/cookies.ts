import axios from 'axios';
import { setInMemoryToken } from '../api/tokenStorage';

const baseURL = import.meta.env.VITE_API_URL || '/api/';

export const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return '';
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const logout = () => {
  try {
    // Clear in-memory RAM token
    setInMemoryToken(null);
    
    // Clear storages
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    
    // Clear cookies
    deleteCookie('token');
    deleteCookie('refreshToken');
    deleteCookie('user');
  } catch (e) {
    // ignore
  }

  // Call backend logout to clear HttpOnly refresh cookie, then redirect
  axios.post(`${baseURL}v1/auth/logout`, {}, { withCredentials: true })
    .finally(() => {
      try {
        window.location.href = '/login';
      } catch (e) {
        // ignore
      }
    });
};
