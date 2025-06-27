import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    notifications: [],
    theme: 'light',
    sidebarOpen: false,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        initializeApp: (state) => {
            state.isLoading = false;
            // Initialize app settings from localStorage
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                state.theme = savedTheme;
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        addNotification: (state, action) => {
            const notification = {
                id: Date.now(),
                type: action.payload.type || 'info',
                title: action.payload.title || '',
                message: action.payload.message || '',
                timestamp: new Date().toISOString(),
                autoHide: action.payload.autoHide !== false,
            };
            state.notifications.push(notification);
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                notification => notification.id !== action.payload
            );
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
            // Dynamic DOM manipulation to apply theme
            document.documentElement.setAttribute('data-theme', action.payload);
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
    },
});

export const {
    initializeApp,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
} = appSlice.actions;

export default appSlice.reducer;
