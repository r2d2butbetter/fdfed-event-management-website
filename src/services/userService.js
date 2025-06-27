import api from './api';

const userService = {
    // Get all users (admin only)
    getUsers: async ({ page = 1, limit = 10, role = '', search = '' } = {}) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (role) params.append('role', role);
        if (search) params.append('search', search);

        return api.get(`/users?${params.toString()}`);
    },

    // Get user by ID
    getUserById: async (userId) => {
        return api.get(`/users/${userId}`);
    },

    // Update user role (admin only)
    updateUserRole: async (userId, role) => {
        return api.put(`/users/${userId}/role`, { role });
    },

    // Delete user (admin only)
    deleteUser: async (userId) => {
        return api.delete(`/users/${userId}`);
    },

    // Update user profile
    updateProfile: async (userId, profileData) => {
        return api.put(`/users/${userId}/profile`, profileData);
    },

    // Upload profile picture
    uploadProfilePicture: async (userId, imageFile) => {
        const formData = new FormData();
        formData.append('profilePicture', imageFile);

        return api.post(`/users/${userId}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Get user statistics (admin only)
    getUserStats: async () => {
        return api.get('/users/stats');
    },

    // Block/unblock user (admin only)
    toggleUserStatus: async (userId, isBlocked) => {
        return api.put(`/users/${userId}/status`, { isBlocked });
    },

    // Get user activity log (admin only)
    getUserActivity: async (userId) => {
        return api.get(`/users/${userId}/activity`);
    },

    // Send notification to user
    sendNotification: async (userId, notification) => {
        return api.post(`/users/${userId}/notification`, notification);
    },

    // Get user preferences
    getUserPreferences: async (userId) => {
        return api.get(`/users/${userId}/preferences`);
    },

    // Update user preferences
    updateUserPreferences: async (userId, preferences) => {
        return api.put(`/users/${userId}/preferences`, preferences);
    },
};

export default userService;
