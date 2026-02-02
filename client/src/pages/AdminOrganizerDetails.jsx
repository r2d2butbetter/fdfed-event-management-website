import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    ArrowBack,
    Business,
    Email,
    Phone,
    Person,
    AttachMoney,
    Event as EventIcon,
    VerifiedUser,
    Cancel
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import muiAdminTheme from '../styles/muiAdminTheme';

function AdminOrganizerDetails() {
    const { organizerId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [organizer, setOrganizer] = useState(null);
    const [events, setEvents] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [error, setError] = useState(null);

    const API = "http://localhost:3000/admin";

    useEffect(() => {
        fetchOrganizerDetails();
    }, [organizerId]);

    const fetchOrganizerDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API}/organizers/${organizerId}/details`, {
                credentials: 'include'
            });
            const result = await response.json();
            
            console.log('Organizer details response:', result);
            
            if (result.success) {
                setOrganizer(result.data.organizer);
                setEvents(result.data.events || []);
                setTotalRevenue(result.data.totalRevenue || 0);
            } else {
                setError(result.message || 'Failed to load organizer details');
            }
        } catch (error) {
            console.error('Failed to fetch organizer details:', error);
            setError(error.message || 'Failed to load organizer details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <ThemeProvider theme={muiAdminTheme}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress color="primary" />
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={muiAdminTheme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/admin/dashboard?section=organizers')}
                            sx={{ mb: 2 }}
                        >
                            Back to Organizers
                        </Button>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Organizer Details
                        </Typography>
                        {organizer && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    {organizer.organizationName}
                                </Typography>
                                <Chip
                                    icon={organizer.verified ? <VerifiedUser /> : <Cancel />}
                                    label={organizer.verified ? 'Verified' : 'Pending'}
                                    color={organizer.verified ? 'success' : 'warning'}
                                    size="small"
                                />
                            </Box>
                        )}
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AttachMoney sx={{ fontSize: 40, color: '#22c55e' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>₹{totalRevenue.toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(147, 83, 211, 0.1) 0%, rgba(147, 83, 211, 0.05) 100%)', border: '1px solid rgba(147, 83, 211, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Events</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{events.length}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EventIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Active Events</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{events.filter(e => e.status === 'start_selling').length}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EventIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Completed Events</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{events.filter(e => e.status === 'over').length}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Organizer Info */}
                    <Paper sx={{ p: 4, mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Organization Information</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Business sx={{ color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Organization Name</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{organizer?.organizationName || 'N/A'}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Person sx={{ color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Owner Name</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{organizer?.userId?.name || 'N/A'}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Email sx={{ color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Email</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{organizer?.userId?.email || 'N/A'}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Phone sx={{ color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{organizer?.contactNo || 'N/A'}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
                                    <Typography variant="body1">{organizer?.description || 'No description provided'}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Events Table */}
                    <Paper sx={{ overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Events by this Organizer</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Event Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Venue</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Ticket Price</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Registrations</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Revenue</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.length > 0 ? events.map((event) => (
                                        <TableRow key={event._id} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{event.title}</TableCell>
                                            <TableCell>{formatDate(event.startDateTime)}</TableCell>
                                            <TableCell>{event.venue}</TableCell>
                                            <TableCell>₹{event.ticketPrice?.toLocaleString() || 0}</TableCell>
                                            <TableCell>{event.registrationCount || 0}</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#22c55e' }}>
                                                ₹{((event.registrationCount || 0) * (event.ticketPrice || 0)).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={event.status === 'start_selling' ? 'Active' : event.status === 'over' ? 'Completed' : event.status}
                                                    color={event.status === 'start_selling' ? 'info' : event.status === 'over' ? 'default' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                No events found for this organizer
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default AdminOrganizerDetails;
