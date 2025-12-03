import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Snackbar,
    Card,
    CardContent,
} from '@mui/material';
import { Add, Event as EventIcon, People, AttachMoney, TrendingUp } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { fetchDashboardData, fetchRealRevenue } from '../../redux/slices/organizerSlice';
import { fetchEvents, deleteEvent, setFilter } from '../../redux/slices/eventSlice';
import Sidebar from '../../components/organizer/Sidebar';
import StatsCard from '../../components/organizer/StatsCard';
import EventTable from '../../components/organizer/EventTable';

const drawerWidth = 260;

function OrganizerDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [currentTab, setCurrentTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const { organizer, stats, upcomingEvents, loading, error, realRevenue } = useSelector((state) => state.organizer);
    const { filteredEvents, currentFilter, deleteLoading } = useSelector((state) => state.events);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchDashboardData());
        dispatch(fetchEvents());
        dispatch(fetchRealRevenue());
    }, [isAuthenticated, navigate, dispatch]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        const filters = ['all', 'upcoming', 'ongoing', 'completed', 'drafts'];
        dispatch(setFilter(filters[newValue]));
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await dispatch(deleteEvent(eventId)).unwrap();
                setSnackbar({ open: true, message: 'Event deleted successfully', severity: 'success' });
                dispatch(fetchDashboardData()); // Refresh stats
            } catch (error) {
                setSnackbar({ open: true, message: error || 'Failed to delete event', severity: 'error' });
            }
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading && !organizer) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f0f1e' }}>
                <CircularProgress sx={{ color: '#9353d3' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0f0f1e' }}>
            <Sidebar
                organizerName={user?.name}
                organizationName={organizer?.organizationName}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: `${drawerWidth}px`,
                    p: 4,
                }}
            >
                <Container maxWidth="xl">
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <div>
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                My Events Dashboard
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Welcome back, {user?.name || 'Organizer'}!
                            </Typography>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => navigate('/organizer/create-event')}
                            sx={{
                                background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)',
                                },
                            }}
                        >
                            Create Event
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Total Events"
                                value={stats.totalEvents}
                                icon={<EventIcon />}
                                color="primary"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Total Attendees"
                                value={stats.totalAttendees}
                                icon={<People />}
                                change={stats.attendeeChange}
                                color="success"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Active Events"
                                value={stats.totalActiveEvents}
                                icon={<TrendingUp />}
                                color="info"
                            />
                        </Grid>
                    </Grid>

                    {/* Ticket Sales Chart */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(147, 83, 211, 0.2)',
                                    borderRadius: 3,
                                    width: '100%',
                                    overflow: 'hidden'
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                    Ticket Sales Trend
                                </Typography>
                                <div style={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.weeklySalesData || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={true} horizontal={true} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(255,255,255,0.5)"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="rgba(255,255,255,0.5)"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                label={{ value: 'Tickets Sold', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', style: { textAnchor: 'middle' } }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#1a1a2e',
                                                    border: '1px solid rgba(147, 83, 211, 0.3)',
                                                    borderRadius: 8,
                                                    color: '#fff',
                                                }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Line
                                                type="monotone"
                                                dataKey="tickets"
                                                stroke="#2dd4bf"
                                                strokeWidth={3}
                                                dot={{ fill: '#2dd4bf', r: 6, strokeWidth: 0 }}
                                                activeDot={{ r: 8 }}
                                                name="Tickets Sold"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Upcoming Events */}
                    {upcomingEvents && upcomingEvents.length > 0 && (
                        <Paper
                            sx={{
                                p: 3,
                                mb: 4,
                                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(147, 83, 211, 0.2)',
                                borderRadius: 3,
                            }}
                        >
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                                Upcoming Events
                            </Typography>
                            <Grid container spacing={2}>
                                {upcomingEvents.slice(0, 3).map((event) => (
                                    <Grid item xs={12} md={4} key={event._id}>
                                        <Card
                                            sx={{
                                                background: 'rgba(147, 83, 211, 0.1)',
                                                border: '1px solid rgba(147, 83, 211, 0.3)',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <CardContent>
                                                <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                                                    {event.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                                    📅 {new Date(event.startDateTime).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                                    📍 {event.venue}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                                                    {event.registrationCount || 0} registered / {event.capacity} capacity
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                                                    {event.ticketsLeft || event.capacity} tickets remaining
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    )}

                    {/* Event Management */}
                    <Paper
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(147, 83, 211, 0.2)',
                            borderRadius: 3,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                            Event Management
                        </Typography>

                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            sx={{
                                mb: 3,
                                '& .MuiTab-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    '&.Mui-selected': {
                                        color: '#9353d3',
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#9353d3',
                                },
                            }}
                        >
                            <Tab label="All Events" />
                            <Tab label="Upcoming" />
                            <Tab label="Ongoing" />
                            <Tab label="Completed" />
                            <Tab label="Drafts" />
                        </Tabs>

                        <EventTable events={filteredEvents} onDelete={handleDeleteEvent} />
                    </Paper>
                </Container>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default OrganizerDashboard;
