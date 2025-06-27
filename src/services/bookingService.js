import api from './api';

const bookingService = {
    // Create a new booking
    createBooking: async (bookingData) => {
        return api.post('/bookings', bookingData);
    },

    // Get user's bookings
    getUserBookings: async (userId) => {
        return api.get(`/bookings/user/${userId}`);
    },

    // Get bookings for an event (organizer/admin only)
    getEventBookings: async (eventId) => {
        return api.get(`/bookings/event/${eventId}`);
    },

    // Get booking by ID
    getBookingById: async (bookingId) => {
        return api.get(`/bookings/${bookingId}`);
    },

    // Cancel booking
    cancelBooking: async (bookingId) => {
        return api.put(`/bookings/${bookingId}/cancel`);
    },

    // Update booking status (admin/organizer only)
    updateBookingStatus: async (bookingId, status) => {
        return api.put(`/bookings/${bookingId}/status`, { status });
    },

    // Get booking statistics
    getBookingStats: async (eventId = null) => {
        const url = eventId ? `/bookings/stats?eventId=${eventId}` : '/bookings/stats';
        return api.get(url);
    },

    // Process payment for booking
    processPayment: async (bookingId, paymentData) => {
        return api.post(`/bookings/${bookingId}/payment`, paymentData);
    },

    // Get booking receipt
    getReceipt: async (bookingId) => {
        return api.get(`/bookings/${bookingId}/receipt`, {
            responseType: 'blob',
        });
    },

    // Check ticket availability
    checkAvailability: async (eventId, ticketType, quantity) => {
        return api.get(`/bookings/availability`, {
            params: { eventId, ticketType, quantity },
        });
    },

    // Apply discount code
    applyDiscount: async (eventId, discountCode) => {
        return api.post('/bookings/discount', { eventId, discountCode });
    },

    // Send booking confirmation email
    sendConfirmation: async (bookingId) => {
        return api.post(`/bookings/${bookingId}/send-confirmation`);
    },
};

export default bookingService;
