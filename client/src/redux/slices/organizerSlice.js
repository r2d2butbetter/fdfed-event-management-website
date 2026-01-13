import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'organizer/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/organizer/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrganizerProfile = createAsyncThunk(
  'organizer/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/organizer/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'organizer/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put('/organizer/change-password', passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  organizer: null,
  user: null,
  stats: {
    totalEvents: 0,
    totalActiveEvents: 0,
    totalRevenue: 0,
    revenueChange: 0,
    totalAttendees: 0,
    attendeeChange: 0,
    avgRating: 0,
    ratingChange: 0,
    topSellingEvent: null,
    totalTicketsSold: 0,
    ticketsSoldChange: 0,
    avgTicketPrice: 0,
    weeklySalesData: [],
    monthlyRevenueData: [],
    quarterlyRevenueData: [],
    yearlyRevenueData: [],
    peakHoursData: [],
    peakDaysData: [],
    revenuePerEvent: [],
  },
  upcomingEvents: [],
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

const organizerSlice = createSlice({
  name: 'organizer',
  initialState,
  reducers: {
    clearUpdateStatus: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.organizer = action.payload.organizer;
        state.user = action.payload.user;
        state.stats = action.payload.stats;
        state.upcomingEvents = action.payload.upcomingEvents;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateOrganizerProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateOrganizerProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        if (action.payload.organizer) {
          state.organizer = action.payload.organizer;
        }
      })
      .addCase(updateOrganizerProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.updateLoading = false;
        state.updateSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearUpdateStatus, clearError } = organizerSlice.actions;
export default organizerSlice.reducer;
