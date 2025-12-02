import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, API_BASE_URL } from '../../api/client';

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/organizer/events');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/organizer/events`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/organizer/events/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update event');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await api.delete(`/organizer/events/${eventId}`);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  events: [],
  filteredEvents: [],
  currentFilter: 'all', // all, upcoming, ongoing, completed, drafts
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  deleteLoading: false,
  deleteError: null,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.currentFilter = action.payload;
      state.filteredEvents = filterEvents(state.events, action.payload);
    },
    clearCreateStatus: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },
    clearUpdateStatus: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events || [];
        state.filteredEvents = filterEvents(state.events, state.currentFilter);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.events.unshift(action.payload.event);
        state.filteredEvents = filterEvents(state.events, state.currentFilter);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        const index = state.events.findIndex(e => e._id === action.payload.event._id);
        if (index !== -1) {
          state.events[index] = action.payload.event;
        }
        state.filteredEvents = filterEvents(state.events, state.currentFilter);
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.events = state.events.filter(e => e._id !== action.payload);
        state.filteredEvents = filterEvents(state.events, state.currentFilter);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

// Helper function to filter events
function filterEvents(events, filter) {
  const now = new Date();
  
  switch (filter) {
    case 'upcoming':
      return events.filter(e => new Date(e.startDateTime) > now && e.status === 'start_selling');
    case 'ongoing':
      return events.filter(e => 
        new Date(e.startDateTime) <= now && 
        new Date(e.endDateTime) >= now &&
        e.status === 'start_selling'
      );
    case 'completed':
      return events.filter(e => new Date(e.endDateTime) < now);
    case 'drafts':
      return events.filter(e => e.status === 'draft');
    case 'all':
    default:
      return events;
  }
}

export const { setFilter, clearCreateStatus, clearUpdateStatus, clearError } = eventSlice.actions;
export default eventSlice.reducer;
