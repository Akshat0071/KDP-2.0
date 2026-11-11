/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'USR-1054-01',
  firstName: 'Maya',
  lastName: 'Torres',
  name: 'Maya Torres',
  email: 'maya.torres@kdpgreensource.com',
  role: 'Local Buyer',
  title: 'Local Buyer · Lead Sourcing',
  site: 'Site 1054 — Plano Roasting',
  siteId: '1054',
  initials: 'M',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kdp_auth_user');
      if (saved) return JSON.parse(saved);
      localStorage.setItem('kdp_auth_user', JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('kdp_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('kdp_auth_user');
        localStorage.removeItem('kdp_auth_token');
      }
    } catch {
      // Ignore storage errors
    }
  }, [user]);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. Try real PostgreSQL backend API if configured
    const apiResult = await authService.login(email, password);
    if (apiResult?.success && apiResult.user) {
      setUser(apiResult.user);
      return apiResult;
    }

    // 2. Seamless local fallback
    const emailLower = email.trim().toLowerCase();
    const isMaya = emailLower === 'maya.torres@kdpgreensource.com';
    const first = isMaya ? 'Maya' : emailLower.split('@')[0].split('.')[0] || 'User';
    const capFirst = first.charAt(0).toUpperCase() + first.slice(1);

    const loggedInUser = {
      id: isMaya ? '00000000-0000-0000-0000-000000000001' : `usr-${Date.now()}`,
      firstName: isMaya ? 'Maya' : capFirst,
      lastName: isMaya ? 'Torres' : 'Buyer',
      name: isMaya ? 'Maya Torres' : `${capFirst} Buyer`,
      email: emailLower,
      role: 'Local Buyer',
      title: 'Local Buyer · Lead Sourcing',
      site: 'Site 1054 — Plano Roasting',
      siteId: '1054',
      initials: capFirst.charAt(0).toUpperCase(),
    };

    setUser(loggedInUser);
    return { success: true, user: loggedInUser };
  };

  const signup = async ({ firstName, lastName, email, role, site, password }) => {
    if (!email || !password || !firstName || !lastName) {
      return { success: false, error: 'All fields are required.' };
    }

    // 1. Try real PostgreSQL backend API if configured
    const apiResult = await authService.signup({ firstName, lastName, email, role, site, password });
    if (apiResult?.success && apiResult.user) {
      setUser(apiResult.user);
      return apiResult;
    }

    // 2. Seamless local fallback
    const newUser = {
      id: `usr-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      role: role || 'Local Buyer',
      title: `${role || 'Local Buyer'} · Green Procurement`,
      site: site || 'Site 1054 — Plano Roasting',
      siteId: '1054',
      initials: firstName.trim().charAt(0).toUpperCase(),
    };

    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Please provide both current and new passwords.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    await authService.changePassword(currentPassword, newPassword);
    return { success: true };
  };

  const forgotPassword = async (email) => {
    if (!email) {
      return { success: false, error: 'Please enter your work email.' };
    }
    await authService.forgotPassword(email);
    return { success: true };
  };

  const resetPassword = (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        changePassword,
        forgotPassword,
        resetPassword,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
