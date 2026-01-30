import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Tabs,
    Tab,
    TextField,
    Button,
    Divider,
    IconButton,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CardMedia,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    FormHelperText
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Bookmark as BookmarkIcon,
    Event as EventIcon,
    LocationOn as LocationOnIcon,
    CalendarToday as CalendarIcon,
    Visibility,
    VisibilityOff,
    ConfirmationNumber as TicketIcon,
    EventAvailable as EventAvailableIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Info as InfoIcon,
    MoneyOff as RefundIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

function UserDashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [savedEventsLoading, setSavedEventsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [dashboardData, setDashboardData] = useState(null);
    const [savedEvents, setSavedEvents] = useState([]);
    const [bookedEvents, setBookedEvents] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, eventId: null, eventTitle: '', action: '' });
    const [cancelDialog, setCancelDialog] = useState({
        open: false,
        booking: null,
        loading: false,
        cancelCount: 1
    });

    // Profile edit states
    const [profileData, setProfileData] = useState({ name: '', email: '', username: '' });
    const [emailData, setEmailData] = useState({ newEmail: '', password: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false, emailPassword: false });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchDashboardData();
        fetchSavedEvents(); // Load saved events count for stats
    }, [isAuthenticated, navigate]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/user/dashboard');
            if (response.success) {
                setDashboardData(response.data);
                setProfileData({
                    name: response.data.user.name,
                    email: response.data.user.email,
                    username: response.data.user.username || ''
                });
                // Set booked events from dashboard response
                setBookedEvents(response.data.bookings || []);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            showSnackbar('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedEvents = async () => {
        setSavedEventsLoading(true);
        try {
            const response = await api.get('/user/saved-events');
            if (response.success) {
                setSavedEvents(response.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch saved events:', error);
            showSnackbar('Failed to load saved events', 'error');
        } finally {
            setSavedEventsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 3) {
            fetchSavedEvents();
        }
    }, [activeTab]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();

        if (!emailData.newEmail || !emailData.password) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await api.post('/user/update-email', emailData);
            if (response.success) {
                showSnackbar('Email updated successfully!', 'success');
                setEmailData({ newEmail: '', password: '' });
                fetchDashboardData();
            } else {
                showSnackbar(response.message || 'Failed to update email', 'error');
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to update email', 'error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showSnackbar('New passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showSnackbar('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            const response = await api.post('/user/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (response.success) {
                showSnackbar('Password changed successfully!', 'success');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showSnackbar(response.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to change password', 'error');
        }
    };

    const handleUnsaveEvent = async (eventId) => {
        try {
            const response = await api.post('/user/unsave-event', { eventId });
            if (response.success) {
                showSnackbar('Event removed from saved list', 'success');
                fetchSavedEvents();
                fetchDashboardData(); // Refresh stats
            } else {
                showSnackbar(response.message || 'Failed to unsave event', 'error');
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to unsave event', 'error');
        }
    };

    // Aliases for form handlers to match form onSubmit calls
    const handlePasswordChange = handleChangePassword;
    const handleEmailChange = handleUpdateEmail;

    const confirmUnsaveEvent = async () => {
        if (confirmDialog.eventId) {
            await handleUnsaveEvent(confirmDialog.eventId);
        }
        closeConfirmDialog();
    };

    const openConfirmDialog = (eventId, eventTitle) => {
        setConfirmDialog({ open: true, eventId, eventTitle, action: 'unsave' });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({ open: false, eventId: null, eventTitle: '', action: '' });
    };

    const openCancelDialog = (booking) => {
        setCancelDialog({ open: true, booking, loading: false, cancelCount: 1 });
    };

    const closeCancelDialog = () => {
        setCancelDialog({ open: false, booking: null, loading: false, cancelCount: 1 });
    };

    const handleCancelCountChange = (newCount) => {
        const maxCount = cancelDialog.booking?.activeTicketCount || 1;
        const count = Math.max(1, Math.min(newCount, maxCount));
        setCancelDialog(prev => ({ ...prev, cancelCount: count }));
    };

    const handleCancelBooking = async () => {
        if (!cancelDialog.booking) return;

        setCancelDialog(prev => ({ ...prev, loading: true }));
        try {
            const response = await api.post('/user/cancel-booking', {
                registrationIds: cancelDialog.booking.activeRegistrationIds,
                ticketCount: cancelDialog.cancelCount
            });

            if (response.success) {
                showSnackbar(
                    `${response.data.cancelledCount} ticket(s) cancelled successfully! ${response.data.totalRefundAmount > 0
                        ? `Refund of ₹${response.data.totalRefundAmount} will be processed.`
                        : 'No refund applicable.'}`,
                    'success'
                );
                fetchDashboardData(); // Refresh the bookings list
            } else {
                showSnackbar(response.message || 'Failed to cancel booking', 'error');
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to cancel booking', 'error');
        } finally {
            closeCancelDialog();
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming':
                return 'primary';
            case 'completed':
                return 'default';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'upcoming':
                return EventAvailableIcon;
            case 'completed':
                return CheckCircleIcon;
            case 'cancelled':
                return CancelIcon;
            default:
                return InfoIcon;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    My Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Welcome back, {dashboardData?.user?.name || 'User'}!
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Card sx={{
                    flex: '1 1 calc(25% - 18px)',
                    minWidth: '200px',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: '#667eea',
                    color: 'white'
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <TicketIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {dashboardData?.stats?.totalBookings || 0}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                            Total Bookings
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{
                    flex: '1 1 calc(25% - 18px)',
                    minWidth: '200px',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: '#f5576c',
                    color: 'white'
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <EventAvailableIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {dashboardData?.stats?.upcomingEvents || 0}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                            Upcoming Events
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{
                    flex: '1 1 calc(25% - 18px)',
                    minWidth: '200px',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: '#00bcd4',
                    color: 'white'
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <BookmarkIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {savedEvents?.length || 0}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                            Saved Events
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{
                    flex: '1 1 calc(25% - 18px)',
                    minWidth: '200px',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    background: '#4caf50',
                    color: 'white'
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {dashboardData?.stats?.completedEvents || 0}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                            Completed
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Tabs Section */}
            <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            minHeight: 64
                        }
                    }}
                >
                    <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
                    <Tab label="My Events" icon={<TicketIcon />} iconPosition="start" />
                    <Tab label="Account Settings" icon={<LockIcon />} iconPosition="start" />
                    <Tab label="Saved Events" icon={<BookmarkIcon />} iconPosition="start" />
                </Tabs>

                {/* Profile Tab */}
                {activeTab === 0 && (
                    <Box sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{ borderRadius: 2, textAlign: 'center', p: 3 }}>
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            mx: 'auto',
                                            mb: 2,
                                            bgcolor: '#667eea',
                                            fontSize: '3rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {dashboardData?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                        {dashboardData?.user?.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {dashboardData?.user?.email}
                                    </Typography>
                                    <Chip
                                        label={dashboardData?.user?.isOrganizer ? 'Organizer' : 'Attendee'}
                                        color="primary"
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Card sx={{ borderRadius: 2, p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                        Profile Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Full Name"
                                                value={dashboardData?.user?.name || ''}
                                                InputProps={{ readOnly: true }}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                value={dashboardData?.user?.email || ''}
                                                InputProps={{ readOnly: true }}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Phone Number"
                                                value={dashboardData?.user?.phonenumber || 'Not provided'}
                                                InputProps={{ readOnly: true }}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Account Type"
                                                value={dashboardData?.user?.isOrganizer ? 'Organizer' : 'Attendee'}
                                                InputProps={{ readOnly: true }}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Member Since"
                                                value={dashboardData?.user?.created_at ? formatDate(dashboardData.user.created_at) : 'N/A'}
                                                InputProps={{ readOnly: true }}
                                                variant="outlined"
                                            />
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* My Events Tab */}
                {activeTab === 1 && (
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                My Booked Events
                            </Typography>
                            <Chip
                                label={`${bookedEvents?.length || 0} Events`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>

                        {bookedEvents && bookedEvents.length > 0 ? (
                            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Venue</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align="center">Tickets</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align="right">Total Price</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bookedEvents.map((booking, index) => {
                                            const StatusIcon = getStatusIcon(booking.status);
                                            const totalPrice = (booking.price || 0) * (booking.ticketCount || 1);
                                            return (
                                                <TableRow key={`${booking.eventId}-${booking.registrationStatus}-${index}`} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar
                                                                sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#667eea' }}
                                                                variant="rounded"
                                                            >
                                                                <EventIcon />
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                    {booking.title || 'Event'}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {booking.ticketType || 'Standard'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDate(booking.startDateTime)}
                                                        </Typography>
                                                        {booking.endDateTime && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                to {formatDate(booking.endDateTime)}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {booking.venue || 'TBA'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={`${booking.ticketCount || 1} ${(booking.ticketCount || 1) === 1 ? 'Ticket' : 'Tickets'}`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            ₹{totalPrice}
                                                        </Typography>
                                                        {booking.status === 'cancelled' && booking.totalRefundedAmount > 0 && (
                                                            <Typography variant="caption" color="success.main">
                                                                Refunded: ₹{booking.totalRefundedAmount}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            icon={<StatusIcon fontSize="small" />}
                                                            label={booking.status || 'upcoming'}
                                                            color={getStatusColor(booking.status || 'upcoming')}
                                                            size="small"
                                                            sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => navigate(`/events/${booking.eventId}`)}
                                                                startIcon={<InfoIcon />}
                                                            >
                                                                Details
                                                            </Button>
                                                            {booking.canCancel && (
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    onClick={() => openCancelDialog(booking)}
                                                                    startIcon={<CancelIcon />}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
                                <TicketIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No booked events yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Explore events and book tickets to see them here
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/events')}
                                    startIcon={<EventIcon />}
                                >
                                    Browse Events
                                </Button>
                            </Paper>
                        )}
                    </Box>
                )}

                {/* Account Settings Tab */}
                {activeTab === 2 && (
                    <Box sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            {/* Change Password */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ borderRadius: 2, p: 3, height: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                        Change Password
                                    </Typography>
                                    <Box component="form" onSubmit={handlePasswordChange}>
                                        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                            <InputLabel>Current Password</InputLabel>
                                            <OutlinedInput
                                                type={showPassword.current ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                            edge="end"
                                                        >
                                                            {showPassword.current ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label="Current Password"
                                                required
                                            />
                                        </FormControl>

                                        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                            <InputLabel>New Password</InputLabel>
                                            <OutlinedInput
                                                type={showPassword.new ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                            edge="end"
                                                        >
                                                            {showPassword.new ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label="New Password"
                                                required
                                            />
                                            <FormHelperText>
                                                Password must be at least 6 characters
                                            </FormHelperText>
                                        </FormControl>

                                        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                                            <InputLabel>Confirm New Password</InputLabel>
                                            <OutlinedInput
                                                type={showPassword.confirm ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                            edge="end"
                                                        >
                                                            {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label="Confirm New Password"
                                                required
                                            />
                                        </FormControl>

                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            startIcon={<LockIcon />}
                                        >
                                            Update Password
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>

                            {/* Change Email */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ borderRadius: 2, p: 3, height: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                        Change Email Address
                                    </Typography>
                                    <Box component="form" onSubmit={handleEmailChange}>
                                        <Alert severity="info" sx={{ mb: 3 }}>
                                            Current email: <strong>{dashboardData?.user?.email}</strong>
                                        </Alert>

                                        <TextField
                                            fullWidth
                                            label="New Email Address"
                                            type="email"
                                            value={emailData.newEmail}
                                            onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                                            sx={{ mb: 2 }}
                                            required
                                        />

                                        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                                            <InputLabel>Confirm Password</InputLabel>
                                            <OutlinedInput
                                                type={showPassword.emailPassword ? 'text' : 'password'}
                                                value={emailData.password}
                                                onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword({ ...showPassword, emailPassword: !showPassword.emailPassword })}
                                                            edge="end"
                                                        >
                                                            {showPassword.emailPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label="Confirm Password"
                                                required
                                            />
                                            <FormHelperText>
                                                Enter your current password to confirm email change
                                            </FormHelperText>
                                        </FormControl>

                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            startIcon={<EmailIcon />}
                                        >
                                            Update Email
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Saved Events Tab */}
                {activeTab === 3 && (
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Your Saved Events
                            </Typography>
                            <Chip
                                label={`${savedEvents?.length || 0} Events`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>

                        {savedEventsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                                <CircularProgress size={60} />
                            </Box>
                        ) : savedEvents && savedEvents.length > 0 ? (
                            <Grid container spacing={3}>
                                {savedEvents.map((event) => (
                                    <Grid item xs={12} sm={6} md={4} key={event._id}>
                                        <Card sx={{
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={event.image ? `http://localhost:3000/${event.image}` : 'https://via.placeholder.com/400x180?text=Event+Image'}
                                                alt={event.name || event.title || 'Event'}
                                                sx={{ objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x180?text=Event+Image';
                                                }}
                                            />
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                                    {event.name || event.title || 'Event Name'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                                                    <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="body2">
                                                        {formatDate(event.date || event.startDateTime)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                                                    <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                                                    <Typography variant="body2">
                                                        {event.venue || 'Venue TBA'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                                        {event.price || event.ticketPrice ? `₹${event.price || event.ticketPrice}` : 'Price TBA'}
                                                    </Typography>
                                                    <Chip label={event.category || 'General'} size="small" color="primary" variant="outlined" />
                                                </Box>
                                            </CardContent>
                                            <Divider />
                                            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    onClick={() => navigate(`/events/${event._id}`)}
                                                    startIcon={<InfoIcon />}
                                                >
                                                    Details
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleUnsaveEvent(event._id)}
                                                    startIcon={<BookmarkIcon />}
                                                >
                                                    Unsave
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
                                <BookmarkIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No saved events yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Save events you're interested in to access them quickly later
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/events')}
                                    startIcon={<EventIcon />}
                                >
                                    Browse Events
                                </Button>
                            </Paper>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Action
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove "{confirmDialog.eventTitle}" from your saved events?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={closeConfirmDialog}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmUnsaveEvent}
                        variant="contained"
                        color="error"
                        autoFocus
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cancel Booking Dialog */}
            <Dialog
                open={cancelDialog.open}
                onClose={closeCancelDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RefundIcon color="error" />
                    Cancel Booking
                </DialogTitle>
                <DialogContent>
                    {cancelDialog.booking && (
                        <Box>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                You are about to cancel ticket(s) for this event. This action cannot be undone.
                            </Alert>

                            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {cancelDialog.booking.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                    {formatDate(cancelDialog.booking.startDateTime)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                    {cancelDialog.booking.venue}
                                </Typography>
                            </Paper>

                            <Divider sx={{ my: 2 }} />

                            {/* Ticket Quantity Selector */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                How many tickets do you want to cancel?
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleCancelCountChange(cancelDialog.cancelCount - 1)}
                                    disabled={cancelDialog.cancelCount <= 1}
                                >
                                    -
                                </Button>
                                <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                                    {cancelDialog.cancelCount}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleCancelCountChange(cancelDialog.cancelCount + 1)}
                                    disabled={cancelDialog.cancelCount >= (cancelDialog.booking.activeTicketCount || 1)}
                                >
                                    +
                                </Button>
                                <Typography variant="body2" color="text.secondary">
                                    of {cancelDialog.booking.activeTicketCount || 1} ticket(s)
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Refund Details
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Ticket Price (each):</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{cancelDialog.booking.price}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Tickets to Cancel:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{cancelDialog.cancelCount}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Refund Percentage:</Typography>
                                <Chip
                                    label={`${cancelDialog.booking.refundPercentage}%`}
                                    size="small"
                                    color={cancelDialog.booking.refundPercentage === 100 ? 'success' : cancelDialog.booking.refundPercentage === 50 ? 'warning' : 'error'}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 1, borderTop: '1px solid #eee' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Refund Amount:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    ₹{(cancelDialog.booking.refundAmountPerTicket || 0) * cancelDialog.cancelCount}
                                </Typography>
                            </Box>

                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="caption">
                                    <strong>Refund Policy:</strong><br />
                                    • More than 7 days before event: 100% refund<br />
                                    • 3-7 days before event: 50% refund<br />
                                    • Less than 3 days before event: No refund
                                </Typography>
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={closeCancelDialog}
                        variant="outlined"
                        disabled={cancelDialog.loading}
                    >
                        Keep Booking
                    </Button>
                    <Button
                        onClick={handleCancelBooking}
                        variant="contained"
                        color="error"
                        disabled={cancelDialog.loading}
                        startIcon={cancelDialog.loading ? <CircularProgress size={16} /> : <CancelIcon />}
                    >
                        {cancelDialog.loading ? 'Cancelling...' : `Cancel ${cancelDialog.cancelCount} Ticket(s)`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default UserDashboard;
