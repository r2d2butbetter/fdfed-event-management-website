import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookingService from '../../services/bookingService';

// Async thunks for bookings
export const createBooking = createAsyncThunk(
    'bookings/createBooking',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await bookingService.createBooking(bookingData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
        }
    }
);

export const fetchUserBookings = createAsyncThunk(
    'bookings/fetchUserBookings',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await bookingService.getUserBookings(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

export const fetchEventBookings = createAsyncThunk(
    'bookings/fetchEventBookings',
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await bookingService.getEventBookings(eventId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch event bookings');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'bookings/cancelBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await bookingService.cancelBooking(bookingId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
        }
    }
);

const initialState = {
    userBookings: [],
    eventBookings: [],
    isLoading: false,
    error: null,
    bookingStats: {
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        pendingBookings: 0,
    },
};

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearBookings: (state) => {
            state.userBookings = [];
            state.eventBookings = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Create booking
            .addCase(createBooking.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userBookings.push(action.payload);
                state.error = null;
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch user bookings
            .addCase(fetchUserBookings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userBookings = action.payload.bookings;
                state.bookingStats = action.payload.stats;
                state.error = null;
            })
            .addCase(fetchUserBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch event bookings
            .addCase(fetchEventBookings.fulfilled, (state, action) => {
                state.eventBookings = action.payload;
            })
            // Cancel booking
            .addCase(cancelBooking.fulfilled, (state, action) => {
                const index = state.userBookings.findIndex(booking => booking._id === action.payload._id);
                if (index !== -1) {
                    state.userBookings[index] = action.payload;
                }
            });
    },
});

export const { clearError, clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;
