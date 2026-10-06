import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types/auth.types";
import { normalizeRole } from "../types/auth.types";
import { logout as logoutHelper } from "../utils/cookies";
import { hasPermissionHelper } from "../constants/permissions";
import { setInMemoryToken } from "../api/tokenStorage";
import { silentRefresh } from "../api/endpoints/login.api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string, refreshToken?: string, rememberMe?: boolean) => void;
  logout: () => void;
  hasPermission: (featureCode: string) => boolean;
  updateUserFields: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) {
          setInMemoryToken(null);
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
        const refreshData = await silentRefresh(storedRefreshToken);
        if (refreshData.success && refreshData.data) {
          const { accessToken, username, email, role, userId, refreshToken: newRefreshToken } = refreshData.data as any;
          setInMemoryToken(accessToken);
          setToken(accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          setUser({
            id: userId,
            email,
            fullName: username,
            role: normalizeRole(role),
            status: "ACTIVE"
          });
        } else {
          setInMemoryToken(null);
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        // Failed to silent refresh, meaning cookie is missing or invalid. Logged out state.
        setInMemoryToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (
    userData: User,
    accessToken: string,
    _refreshToken?: string,
    _rememberMe = false
  ) => {
    setInMemoryToken(accessToken);
    setToken(accessToken);
    setUser(userData);
    if (_refreshToken) {
      localStorage.setItem("refreshToken", _refreshToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setInMemoryToken(null);
    logoutHelper();
  };

  const updateUserFields = (fields: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
  };

  const hasPermission = (featureCode: string): boolean => {
    if (!user || !user.role) return false;
    return hasPermissionHelper(user.role, featureCode);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        hasPermission,
        updateUserFields,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
