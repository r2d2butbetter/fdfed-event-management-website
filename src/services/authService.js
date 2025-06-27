import api from './api';

const authService = {
    // Login user
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });

        // Store token in localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        return response;
    },

    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);

        // Store token in localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        return response;
    },

    // Logout user
    logout: async () => {
        localStorage.removeItem('token');
        return api.post('/auth/logout');
    },

    // Get current user
    getCurrentUser: async () => {
        return api.get('/auth/me');
    },

    // Refresh token
    refreshToken: async () => {
        return api.post('/auth/refresh');
    },

    // Update user profile
    updateProfile: async (profileData) => {
        return api.put('/auth/profile', profileData);
    },

    // Change password
    changePassword: async (passwordData) => {
        return api.put('/auth/change-password', passwordData);
    },

    // Request password reset
    requestPasswordReset: async (email) => {
        return api.post('/auth/forgot-password', { email });
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        return api.post('/auth/reset-password', { token, newPassword });
    },

    // Verify email
    verifyEmail: async (token) => {
        return api.post('/auth/verify-email', { token });
    },
};

export default authService;
