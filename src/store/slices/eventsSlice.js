import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventService from '../../services/eventService';

// Async thunks for events
export const fetchEvents = createAsyncThunk(
    'events/fetchEvents',
    async ({ page = 1, limit = 10, category = '', search = '' } = {}, { rejectWithValue }) => {
        try {
            const response = await eventService.getEvents({ page, limit, category, search });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
        }
    }
);

export const fetchEventById = createAsyncThunk(
    'events/fetchEventById',
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await eventService.getEventById(eventId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch event');
        }
    }
);

export const createEvent = createAsyncThunk(
    'events/createEvent',
    async (eventData, { rejectWithValue }) => {
        try {
            const response = await eventService.createEvent(eventData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create event');
        }
    }
);

export const updateEvent = createAsyncThunk(
    'events/updateEvent',
    async ({ eventId, eventData }, { rejectWithValue }) => {
        try {
            const response = await eventService.updateEvent(eventId, eventData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update event');
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            await eventService.deleteEvent(eventId);
            return eventId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
        }
    }
);

const initialState = {
    events: [],
    currentEvent: null,
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalEvents: 0,
        hasNext: false,
        hasPrev: false,
    },
    filters: {
        category: '',
        search: '',
        dateRange: null,
    },
};

const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentEvent: (state, action) => {
            state.currentEvent = action.payload;
        },
        clearCurrentEvent: (state) => {
            state.currentEvent = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                category: '',
                search: '',
                dateRange: null,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch events
            .addCase(fetchEvents.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.events = action.payload.events;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch event by ID
            .addCase(fetchEventById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentEvent = action.payload;
                state.error = null;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create event
            .addCase(createEvent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.events.unshift(action.payload);
                state.error = null;
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update event
            .addCase(updateEvent.fulfilled, (state, action) => {
                const index = state.events.findIndex(event => event._id === action.payload._id);
                if (index !== -1) {
                    state.events[index] = action.payload;
                }
                if (state.currentEvent?._id === action.payload._id) {
                    state.currentEvent = action.payload;
                }
            })
            // Delete event
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.events = state.events.filter(event => event._id !== action.payload);
                if (state.currentEvent?._id === action.payload) {
                    state.currentEvent = null;
                }
            });
    },
});

export const {
    clearError,
    setCurrentEvent,
    clearCurrentEvent,
    setFilters,
    clearFilters
} = eventsSlice.actions;

export default eventsSlice.reducer;
