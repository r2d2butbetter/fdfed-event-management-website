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

export const fetchRealRevenue = createAsyncThunk(
  'organizer/fetchRealRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/organizer/revenue');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMonthlyRevenue = createAsyncThunk(
  'organizer/fetchMonthlyRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/organizer/revenue/monthly');
      return response.data.data;
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
  realRevenue: {
    totalRevenue: 0,
    totalTicketsSold: 0,
  },
  monthlyRevenueData: [],
  upcomingEvents: [],
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  revenueLoading: false,
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
      })
      // Fetch Real Revenue
      .addCase(fetchRealRevenue.pending, (state) => {
        state.revenueLoading = true;
      })
      .addCase(fetchRealRevenue.fulfilled, (state, action) => {
        state.revenueLoading = false;
        state.realRevenue = action.payload;
      })
      .addCase(fetchRealRevenue.rejected, (state) => {
        state.revenueLoading = false;
      })
      // Fetch Monthly Revenue
      .addCase(fetchMonthlyRevenue.pending, (state) => {
        state.revenueLoading = true;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
        state.revenueLoading = false;
        state.monthlyRevenueData = action.payload;
      })
      .addCase(fetchMonthlyRevenue.rejected, (state) => {
        state.revenueLoading = false;
      });
  },
});

export const { clearUpdateStatus, clearError } = organizerSlice.actions;
export default organizerSlice.reducer;
