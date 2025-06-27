import api from './api';

const eventService = {
    // Get all events with pagination and filters
    getEvents: async ({ page = 1, limit = 10, category = '', search = '', dateRange = null } = {}) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (category) params.append('category', category);
        if (search) params.append('search', search);
        if (dateRange) {
            params.append('startDate', dateRange.start);
            params.append('endDate', dateRange.end);
        }

        return api.get(`/events?${params.toString()}`);
    },

    // Get event by ID
    getEventById: async (eventId) => {
        return api.get(`/events/${eventId}`);
    },

    // Create new event (organizer/admin only)
    createEvent: async (eventData) => {
        // Handle file upload for event image
        const formData = new FormData();

        Object.keys(eventData).forEach(key => {
            if (key === 'image' && eventData[key] instanceof File) {
                formData.append('image', eventData[key]);
            } else {
                formData.append(key, eventData[key]);
            }
        });

        return api.post('/events', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Update event (organizer/admin only)
    updateEvent: async (eventId, eventData) => {
        const formData = new FormData();

        Object.keys(eventData).forEach(key => {
            if (key === 'image' && eventData[key] instanceof File) {
                formData.append('image', eventData[key]);
            } else {
                formData.append(key, eventData[key]);
            }
        });

        return api.put(`/events/${eventId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Delete event (organizer/admin only)
    deleteEvent: async (eventId) => {
        return api.delete(`/events/${eventId}`);
    },

    // Get events by organizer
    getEventsByOrganizer: async (organizerId) => {
        return api.get(`/events/organizer/${organizerId}`);
    },

    // Get event categories
    getCategories: async () => {
        return api.get('/events/categories');
    },

    // Get popular events
    getPopularEvents: async () => {
        return api.get('/events/popular');
    },

    // Get upcoming events
    getUpcomingEvents: async () => {
        return api.get('/events/upcoming');
    },

    // Search events
    searchEvents: async (query) => {
        return api.get(`/events/search?q=${encodeURIComponent(query)}`);
    },

    // Get event statistics (admin/organizer)
    getEventStats: async (eventId) => {
        return api.get(`/events/${eventId}/stats`);
    },
};

export default eventService;
