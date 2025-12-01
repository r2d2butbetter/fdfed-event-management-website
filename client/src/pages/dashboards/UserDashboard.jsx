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
    CardActions,
    Chip,
    Stack
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    Event as EventIcon,
    LocationOn as LocationOnIcon,
    CalendarToday as CalendarIcon,
    Delete as DeleteIcon,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

function UserDashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [dashboardData, setDashboardData] = useState(null);
    const [savedEvents, setSavedEvents] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, eventId: null, eventTitle: '' });

    // Profile edit states
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [emailData, setEmailData] = useState({ newEmail: '', password: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showEmailPassword, setShowEmailPassword] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchDashboardData();
    }, [isAuthenticated, navigate]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/user/dashboard');
            if (response.success) {
                setDashboardData(response.data);
                setProfileData({
                    name: response.data.user.name,
                    email: response.data.user.email
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            showSnackbar('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedEvents = async () => {
        try {
            const response = await api.get('/user/saved-events');
            if (response.success) {
                setSavedEvents(response.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch saved events:', error);
            showSnackbar('Failed to load saved events', 'error');
        }
    };

    useEffect(() => {
        if (activeTab === 2) {
            fetchSavedEvents();
        }
    }, [activeTab]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
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
            } else {
                showSnackbar(response.message || 'Failed to unsave event', 'error');
            }
        } catch (error) {
            showSnackbar(error.message || 'Failed to unsave event', 'error');
        }
    };

    const openConfirmDialog = (eventId, eventTitle) => {
        setConfirmDialog({ open: true, eventId, eventTitle });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({ open: false, eventId: null, eventTitle: '' });
    };

    const confirmUnsaveEvent = () => {
        handleUnsaveEvent(confirmDialog.eventId);
        closeConfirmDialog();
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                My Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
                Welcome back, {dashboardData?.user?.name || 'User'}!
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <EventIcon sx={{ mr: 1, color: '#667eea' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Total Events
                                </Typography>
                            </Box>
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                                {dashboardData?.stats?.totalBookings || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <CalendarIcon sx={{ mr: 1, color: '#4caf50' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Upcoming
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 700 }}>
                                {dashboardData?.stats?.upcomingEvents || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <BookmarkIcon sx={{ mr: 1, color: '#ff9800' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Saved
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ color: '#ff9800', fontWeight: 700 }}>
                                {savedEvents?.length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6} sm={6} md={3}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <EventIcon sx={{ mr: 1, color: '#9e9e9e' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Completed
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ color: '#9e9e9e', fontWeight: 700 }}>
                                {dashboardData?.stats?.completedEvents || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs Section */}
            <Paper sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
                    <Tab label="Account Settings" icon={<LockIcon />} iconPosition="start" />
                    <Tab label="Saved Events" icon={<BookmarkIcon />} iconPosition="start" />
                </Tabs>

                {/* Profile Tab */}
                {activeTab === 0 && (
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Profile Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={profileData.name}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={profileData.email}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={dashboardData?.user?.username || ''}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Account Type"
                                    value="User"
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Account Settings Tab */}
                {activeTab === 1 && (
                    <Box sx={{ p: 4 }}>
                        {/* Change Email Section */}
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Change Email
                        </Typography>
                        <Box component="form" onSubmit={handleUpdateEmail} sx={{ mb: 4 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="New Email"
                                        type="email"
                                        value={emailData.newEmail}
                                        onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                                        InputProps={{
                                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Current Password"
                                        type={showEmailPassword ? 'text' : 'password'}
                                        value={emailData.password}
                                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                                        InputProps={{
                                            startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            endAdornment: (
                                                <IconButton
                                                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                                                    edge="end"
                                                >
                                                    {showEmailPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        Update Email
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Change Password Section */}
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Change Password
                        </Typography>
                        <Box component="form" onSubmit={handleChangePassword}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Current Password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        InputProps={{
                                            startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            endAdornment: (
                                                <IconButton
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    edge="end"
                                                >
                                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        InputProps={{
                                            startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            endAdornment: (
                                                <IconButton
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                >
                                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirm New Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        InputProps={{
                                            startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                            endAdornment: (
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2
                                        }}
                                    >
                                        Change Password
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                )}

                {/* Saved Events Tab */}
                {activeTab === 2 && (
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                            Saved Events
                        </Typography>
                        {savedEvents.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <BookmarkBorderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No saved events yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Start exploring events and save your favorites!
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/')}
                                    sx={{ mt: 3, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Browse Events
                                </Button>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {savedEvents.map((event) => (
                                    <Grid item xs={12} sm={6} md={4} key={event._id}>
                                        <Card sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                                            }
                                        }}>
                                            <CardMedia
                                                component="div"
                                                sx={{
                                                    height: 180,
                                                    backgroundColor: '#f5f5f5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <EventIcon sx={{ fontSize: 60, color: '#667eea' }} />
                                            </CardMedia>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                    {event.title}
                                                </Typography>
                                                <Stack spacing={1}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {formatDate(event.startDateTime)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {event.venue}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ mt: 1 }}>
                                                        <Chip
                                                            label={`₹${event.ticketPrice}`}
                                                            size="small"
                                                            color="primary"
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    onClick={() => navigate(`/events/${event._id}`)}
                                                    sx={{ textTransform: 'none', fontWeight: 600, mr: 1 }}
                                                >
                                                    View Details
                                                </Button>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openConfirmDialog(event._id, event.title)}
                                                    sx={{ ml: 'auto' }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Confirm Unsave Dialog */}
            <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
                <DialogTitle>Remove Saved Event?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove "{confirmDialog.eventTitle}" from your saved events?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialog} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmUnsaveEvent} color="error" variant="contained" sx={{ textTransform: 'none' }}>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default UserDashboard;
