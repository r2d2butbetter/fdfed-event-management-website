import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    CircularProgress,
    Alert,
    Chip,
    Grid
} from '@mui/material';
import {
    Search,
    ArrowBack,
    People,
    ConfirmationNumber,
    Event as EventIcon,
    AttachMoney,
    LocalOffer,
    Stadium
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import muiAdminTheme from '../styles/muiAdminTheme';

function AdminEventAttendees() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [event, setEvent] = useState(null);
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [error, setError] = useState(null);

    const API = "http://localhost:3000/admin";

    useEffect(() => {
        fetchAttendees();
    }, [eventId]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAttendees(attendees);
        } else {
            const filtered = attendees.filter(attendee =>
                attendee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attendee.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAttendees(filtered);
        }
    }, [searchTerm, attendees]);

    const fetchAttendees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API}/events/${eventId}/attendees`, {
                credentials: 'include'
            });
            const result = await response.json();
            
            console.log('Attendees API response:', result);
            
            if (result.success) {
                setEvent(result.data.event || null);
                setAttendees(result.data.attendees || []);
                setFilteredAttendees(result.data.attendees || []);
                setTotalTickets(result.data.totalTickets || 0);
                setTotalRevenue(result.data.totalRevenue || 0);
            } else {
                setError(result.message || 'Failed to load attendees');
            }
        } catch (error) {
            console.error('Failed to fetch attendees:', error);
            setError(error.message || 'Failed to load attendees');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                            onClick={() => navigate('/admin/dashboard?section=events')}
                            sx={{ mb: 2 }}
                        >
                            Back to Events
                        </Button>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Event Attendees
                        </Typography>
                        {event && (
                            <Typography variant="h6" color="text.secondary">
                                {event.title}
                            </Typography>
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
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(147, 83, 211, 0.1) 0%, rgba(147, 83, 211, 0.05) 100%)', border: '1px solid rgba(147, 83, 211, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <People sx={{ fontSize: 40, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Registrations</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{attendees?.length || 0}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <ConfirmationNumber sx={{ fontSize: 40, color: '#10b981' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Tickets</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalTickets || 0}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EventIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Start Date</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {event?.startDateTime ? formatDate(event.startDateTime) : 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EventIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">End Date</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {event?.endDateTime ? formatDate(event.endDateTime) : 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AttachMoney sx={{ fontSize: 40, color: '#22c55e' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{totalRevenue.toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <LocalOffer sx={{ fontSize: 40, color: '#a855f7' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Ticket Price</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{event?.ticketPrice?.toLocaleString() || 0}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Stadium sx={{ fontSize: 40, color: '#ec4899' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Total Capacity</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{event?.capacity?.toLocaleString() || 0}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Search */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="Search attendees by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ maxWidth: 400 }}
                        />
                    </Paper>

                    {/* Attendees Table */}
                    <Paper sx={{ overflow: 'hidden' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(147, 83, 211, 0.1)' }}>
                                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Tickets</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Registration Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAttendees && filteredAttendees.length > 0 ? (
                                        filteredAttendees.map((attendee, index) => (
                                            <TableRow key={attendee.odUserId || attendee.email || index} hover>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{attendee.name || 'N/A'}</TableCell>
                                                <TableCell>{attendee.email || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={attendee.ticketCount || 1} 
                                                        size="small" 
                                                        color="primary"
                                                        variant="filled"
                                                    />
                                                </TableCell>
                                                <TableCell>{attendee.registrationDate ? formatDate(attendee.registrationDate) : 'N/A'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    {searchTerm ? 'No attendees found matching your search' : 'No attendees have registered for this event yet'}
                                                </Typography>
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

export default AdminEventAttendees;