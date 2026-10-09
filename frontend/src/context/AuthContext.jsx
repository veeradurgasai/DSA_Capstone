import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persistent Login: restore user session from localStorage
    const storedUser = authService.getCurrentUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
      // Verify token in background
      authService.getMe()
        .then(profile => {
          const updated = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            accountStatus: profile.accountStatus
          };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        })
        .catch(() => {
          // Token expired or invalid
          authService.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginStudent = async (name, email, password) => {
    const data = await authService.loginStudent(name, email, password);
    const currentUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      accountStatus: data.accountStatus
    };
    setUser(currentUser);
    return currentUser;
  };

  const registerStudent = async (studentData) => {
    return authService.registerStudent(studentData);
  };

  const loginAdmin = async (name, email, adminCode) => {
    const data = await authService.loginAdmin(name, email, adminCode);
    const currentUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      accountStatus: data.accountStatus
    };
    setUser(currentUser);
    return currentUser;
  };

  const registerAdmin = async (adminData, email, adminCode, otp) => {
    const data = await authService.registerAdmin(adminData, email, adminCode, otp);
    const currentUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      accountStatus: data.accountStatus
    };
    setUser(currentUser);
    return currentUser;
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const currentUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      accountStatus: data.accountStatus
    };
    setUser(currentUser);
    return currentUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const deleteAccount = async (password, confirmation) => {
    const res = await authService.deleteAccount(password, confirmation);
    logout();
    return res;
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginStudent,
      registerStudent,
      loginAdmin,
      registerAdmin,
      logout,
      deleteAccount,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
