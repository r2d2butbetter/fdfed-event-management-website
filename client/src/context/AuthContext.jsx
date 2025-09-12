// Authentication Context for managing user state
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, setAuthToken, getAuthToken } from '../utils/ajaxUtils';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(getAuthToken());
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
        try {
            if (token) {
                await authAPI.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            setAuthToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
        }
    }, [token]);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            const savedToken = getAuthToken();
            const savedUser = localStorage.getItem('user');

            if (savedToken && savedUser) {
                try {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Error parsing saved user data:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [logout]);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);

            if (response.success && response.data) {
                const responseData = response.data.data || response.data;
                const { user: userData, token: newToken, refreshToken } = responseData;

                setUser(userData);
                setToken(newToken);
                setAuthToken(newToken);

                localStorage.setItem('user', JSON.stringify(userData));
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }

                return { success: true, user: userData };
            } else {
                throw new Error(response.data?.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || error.error || 'Login failed');
        }
    };

    const register = async (userData) => {
        try {
            // Format data for backend API
            const registrationData = {
                name: userData.name,
                email: userData.email,
                password1: userData.password,
                password2: userData.confirmPassword || userData.password,
                role: userData.role || 'user'
            };

            const response = await authAPI.register(registrationData);

            if (response.success && response.data) {
                const responseData = response.data.data || response.data;
                const { user: newUser, token: newToken, refreshToken } = responseData;

                setUser(newUser);
                setToken(newToken);
                setAuthToken(newToken);

                localStorage.setItem('user', JSON.stringify(newUser));
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }

                return { success: true, user: newUser };
            } else {
                throw new Error(response.data?.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(error.message || error.error || 'Registration failed');
        }
    };

    const becomeOrganizer = async (organizerData) => {
        try {
            const response = await authAPI.registerOrganizer(organizerData);

            if (response.success) {
                // Update user role or organizer status
                const updatedUser = { ...user, isOrganizer: true, role: 'organizer' };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                return { success: true, organizer: response.data?.organizer };
            } else {
                throw new Error(response.data?.message || 'Organizer registration failed');
            }
        } catch (error) {
            console.error('Organizer registration error:', error);
            throw new Error(error.message || error.error || 'Organizer registration failed');
        }
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await authAPI.refreshToken(refreshToken);

            if (response.success && response.data) {
                const { token: newToken, user: userData } = response.data.data || response.data;

                setToken(newToken);
                setAuthToken(newToken);

                if (userData) {
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                return { success: true };
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, logout user
            await logout();
            throw error;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            // Update local user data immediately for better UX
            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Profile update error:', error);
            // Revert changes on error
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            throw new Error('Failed to update profile');
        }
    };

    const checkOrganizerStatus = async () => {
        try {
            const response = await authAPI.getOrganizerStatus();
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error checking organizer status:', error);
            return null;
        }
    };

    const isAuthenticated = () => Boolean(user && token);
    const isOrganizer = () => user?.isOrganizer || user?.role === 'organizer';
    const isAdmin = () => user?.role === 'admin';

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        becomeOrganizer,
        refreshAccessToken,
        updateProfile,
        checkOrganizerStatus,
        isAuthenticated,
        isOrganizer,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};