import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Tabs,
    Tab,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
    useMediaQuery,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    ConfirmationNumber as TicketIcon,
    Bookmark as BookmarkIcon,
    Receipt as ReceiptIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Logout as LogoutIcon,
    Event as EventIcon,
    EventAvailable as EventAvailableIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import { ThemeContextProvider, useThemeMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

// Import user dashboard components
import {
    UserStatsCard,
    BookingTable,
    SavedEventCard,
    SavedEventCardSkeleton,
    PaymentHistoryTable,
    ActivityChart,
    ProfileForm,
    SecuritySettings,
    NotificationSettings,
    ThemeToggle,
} from '../../components/user';

// Tab Panel component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

// Main Dashboard Content Component
function DashboardContent() {
    const theme = useTheme();
    useThemeMode(); // Hook for theme context
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [settingsSubTab, setSettingsSubTab] = useState(0);
    const [dashboardData, setDashboardData] = useState(null);
    const [savedEvents, setSavedEvents] = useState([]);
    const [savedEventsLoading, setSavedEventsLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsPagination, setPaymentsPagination] = useState(null);
    const [activityStats, setActivityStats] = useState(null);
    const [activityLoading, setActivityLoading] = useState(false);
    const [notificationPrefs, setNotificationPrefs] = useState(null);
    const [notificationPrefsLoading, setNotificationPrefsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [anchorEl, setAnchorEl] = useState(null);

    // Auth check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await api.get('/user/dashboard');
            if (response.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            showSnackbar('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch saved events
    const fetchSavedEvents = useCallback(async () => {
        setSavedEventsLoading(true);
        try {
            const response = await api.get('/user/saved-events');
            if (response.success) {
                setSavedEvents(response.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch saved events:', error);
        } finally {
            setSavedEventsLoading(false);
        }
    }, []);

    // Fetch payment history
    const fetchPaymentHistory = useCallback(async (page = 1) => {
        setPaymentsLoading(true);
        try {
            const response = await api.get(`/user/payment-history?page=${page}&limit=10`);
            if (response.success) {
                setPayments(response.data.payments || []);
                setPaymentsPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
        } finally {
            setPaymentsLoading(false);
        }
    }, []);

    // Fetch activity stats
    const fetchActivityStats = useCallback(async () => {
        setActivityLoading(true);
        try {
            const response = await api.get('/user/activity-stats');
            if (response.success) {
                setActivityStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch activity stats:', error);
        } finally {
            setActivityLoading(false);
        }
    }, []);

    // Fetch notification preferences
    const fetchNotificationPrefs = useCallback(async () => {
        setNotificationPrefsLoading(true);
        try {
            const response = await api.get('/user/notification-preferences');
            if (response.success) {
                setNotificationPrefs(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch notification preferences:', error);
        } finally {
            setNotificationPrefsLoading(false);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData();
            fetchSavedEvents();
        }
    }, [isAuthenticated, fetchDashboardData, fetchSavedEvents]);

    // Fetch data based on active tab
    useEffect(() => {
        if (activeTab === 0) {
            fetchActivityStats();
        } else if (activeTab === 3) {
            fetchPaymentHistory();
        } else if (activeTab === 4 && settingsSubTab === 2) {
            fetchNotificationPrefs();
        }
    }, [activeTab, settingsSubTab, fetchActivityStats, fetchPaymentHistory, fetchNotificationPrefs]);

    // Snackbar helper
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Event handlers
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSettingsSubTabChange = (event, newValue) => {
        setSettingsSubTab(newValue);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await logout();
        navigate('/login');
    };

    // API handlers
    const handleCancelBooking = async (booking, ticketCount) => {
        try {
            const response = await api.post('/user/cancel-booking', {
                registrationIds: booking.activeRegistrationIds,
                ticketCount,
            });
            if (response.success) {
                showSnackbar(
                    `${response.data.cancelledCount} ticket(s) cancelled. ${response.data.totalRefundAmount > 0
                        ? `Refund: $${response.data.totalRefundAmount.toFixed(2)}`
                        : 'No refund applicable.'
                    }`,
                    'success'
                );
                fetchDashboardData();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to cancel booking', 'error');
            throw error;
        }
    };

    const handleUnsaveEvent = async (eventId) => {
        try {
            const response = await api.post('/user/unsave-event', { eventId });
            if (response.success) {
                showSnackbar('Event removed from saved list', 'success');
                fetchSavedEvents();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to unsave event', 'error');
            throw error;
        }
    };

    const handleUpdateProfile = async (data) => {
        try {
            const response = await api.put('/user/profile', data);
            if (response.success) {
                fetchDashboardData();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            throw new Error(error.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (data) => {
        try {
            const response = await api.post('/user/change-password', data);
            if (!response.success) {
                throw new Error(response.message);
            }
        } catch (error) {
            throw new Error(error.message || 'Failed to change password');
        }
    };

    const handleChangeEmail = async (data) => {
        try {
            const response = await api.post('/user/update-email', data);
            if (response.success) {
                fetchDashboardData();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            throw new Error(error.message || 'Failed to update email');
        }
    };

    const handleUpdateNotificationPrefs = async (data) => {
        try {
            const response = await api.put('/user/notification-preferences', data);
            if (response.success) {
                setNotificationPrefs(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            throw new Error(error.message || 'Failed to update preferences');
        }
    };

    // Tab configuration
    const tabs = [
        { label: 'Overview', icon: <DashboardIcon /> },
        { label: 'My Bookings', icon: <TicketIcon /> },
        { label: 'Saved Events', icon: <BookmarkIcon /> },
        { label: 'Payments', icon: <ReceiptIcon /> },
        { label: 'Settings', icon: <SettingsIcon /> },
    ];

    // Loading state
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* App Bar */}
            <AppBar position="sticky" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        My Dashboard
                    </Typography>

                    <ThemeToggle />

                    <IconButton
                        onClick={handleMenuOpen}
                        sx={{ ml: 1 }}
                        aria-label="account menu"
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: 'primary.main',
                                fontSize: '1rem',
                            }}
                        >
                            {dashboardData?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {dashboardData?.user?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {dashboardData?.user?.email}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => { handleMenuClose(); setActiveTab(4); setSettingsSubTab(0); }}>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); setActiveTab(4); setSettingsSubTab(1); }}>
                            <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
                            Security
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Welcome Message */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Welcome back, {dashboardData?.user?.name?.split(' ')[0] || 'User'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here's what's happening with your events.
                    </Typography>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant={isMobile ? 'scrollable' : 'standard'}
                        scrollButtons={isMobile ? 'auto' : false}
                        aria-label="dashboard tabs"
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                label={isSmall ? '' : tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                                aria-label={tab.label}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Overview Tab */}
                <TabPanel value={activeTab} index={0}>
                    {/* Stats Cards */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(4, 1fr)'
                            },
                            gap: { xs: 2, md: 3 },
                            mb: 4,
                        }}
                    >
                        <UserStatsCard
                            title="Total Bookings"
                            value={dashboardData?.stats?.totalBookings || 0}
                            icon={<TicketIcon />}
                            color="primary"
                            loading={loading}
                            subtitle="All time events"
                        />
                        <UserStatsCard
                            title="Upcoming Events"
                            value={dashboardData?.stats?.upcomingEvents || 0}
                            icon={<EventAvailableIcon />}
                            color="info"
                            loading={loading}
                            subtitle="Scheduled ahead"
                        />
                        <UserStatsCard
                            title="Saved Events"
                            value={savedEvents?.length || 0}
                            icon={<BookmarkIcon />}
                            color="warning"
                            loading={savedEventsLoading}
                            subtitle="In your wishlist"
                        />
                        <UserStatsCard
                            title="Completed"
                            value={dashboardData?.stats?.completedEvents || 0}
                            icon={<CheckCircleIcon />}
                            color="success"
                            loading={loading}
                            subtitle="Events attended"
                        />
                    </Box>

                    {/* Activity Charts */}
                    <ActivityChart
                        monthlyAttendance={activityStats?.monthlyAttendance || []}
                        monthlySpending={activityStats?.monthlySpending || []}
                        spendingByCategory={activityStats?.spendingByCategory || []}
                        summary={activityStats?.summary || {}}
                        loading={activityLoading}
                    />
                </TabPanel>

                {/* My Bookings Tab */}
                <TabPanel value={activeTab} index={1}>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                        My Bookings
                    </Typography>
                    <BookingTable
                        bookings={dashboardData?.bookings || []}
                        loading={loading}
                        onCancelBooking={handleCancelBooking}
                    />
                </TabPanel>

                {/* Saved Events Tab */}
                <TabPanel value={activeTab} index={2}>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                        Saved Events ({savedEvents?.length || 0})
                    </Typography>

                    {savedEventsLoading ? (
                        <Grid container spacing={3}>
                            {[1, 2, 3].map((i) => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <SavedEventCardSkeleton />
                                </Grid>
                            ))}
                        </Grid>
                    ) : savedEvents.length > 0 ? (
                        <Grid container spacing={3}>
                            {savedEvents.map((event) => (
                                <Grid item xs={12} sm={6} md={4} key={event._id}>
                                    <SavedEventCard
                                        event={event}
                                        onUnsave={handleUnsaveEvent}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert
                            severity="info"
                            sx={{ borderRadius: 2 }}
                            action={
                                <IconButton
                                    color="inherit"
                                    size="small"
                                    onClick={() => navigate('/events')}
                                >
                                    <EventIcon />
                                </IconButton>
                            }
                        >
                            No saved events yet. Browse events to save ones you're interested in!
                        </Alert>
                    )}
                </TabPanel>

                {/* Payments Tab */}
                <TabPanel value={activeTab} index={3}>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                        Payment History
                    </Typography>
                    <PaymentHistoryTable
                        payments={payments}
                        loading={paymentsLoading}
                        pagination={paymentsPagination}
                        onPageChange={fetchPaymentHistory}
                    />
                </TabPanel>

                {/* Settings Tab */}
                <TabPanel value={activeTab} index={4}>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                        Settings
                    </Typography>

                    {/* Settings Sub-tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={settingsSubTab}
                            onChange={handleSettingsSubTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
                            <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
                            <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
                        </Tabs>
                    </Box>

                    {/* Profile Settings */}
                    {settingsSubTab === 0 && (
                        <ProfileForm
                            user={dashboardData?.user}
                            loading={loading}
                            onUpdate={handleUpdateProfile}
                        />
                    )}

                    {/* Security Settings */}
                    {settingsSubTab === 1 && (
                        <SecuritySettings
                            onChangePassword={handleChangePassword}
                            onChangeEmail={handleChangeEmail}
                        />
                    )}

                    {/* Notification Settings */}
                    {settingsSubTab === 2 && (
                        <NotificationSettings
                            preferences={notificationPrefs}
                            loading={notificationPrefsLoading}
                            onUpdate={handleUpdateNotificationPrefs}
                        />
                    )}
                </TabPanel>
            </Container>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

// Main UserDashboard component with ThemeProvider
function UserDashboard() {
    return (
        <ThemeContextProvider defaultMode="light">
            <DashboardContent />
        </ThemeContextProvider>
    );
}

export default UserDashboard;
