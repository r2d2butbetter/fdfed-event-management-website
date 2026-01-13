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
    Chip
} from '@mui/material';
import {
    Search,
    Download,
    ArrowBack,
    Email
} from '@mui/icons-material';
import { api } from '../../api/client';
import Sidebar from '../../components/organizer/Sidebar';
import { useSelector } from 'react-redux';

const drawerWidth = 260;

function EventAttendees() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { organizer, user } = useSelector((state) => state.organizer);

    const [loading, setLoading] = useState(true);
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchAttendees();
    }, [eventId]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAttendees(attendees);
        } else {
            const filtered = attendees.filter(attendee =>
                attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAttendees(filtered);
        }
    }, [searchTerm, attendees]);

    const fetchAttendees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/organizer/events/${eventId}/attendees`);
            if (response.success) {
                setEvent(response.data.event);
                setAttendees(response.data.attendees);
                setFilteredAttendees(response.data.attendees);
            }
        } catch (error) {
            console.error('Failed to fetch attendees:', error);
            setError(error.message || 'Failed to load attendees');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiBaseUrl}/organizer/events/${eventId}/attendees/export?format=csv`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendees-${event?.title || 'event'}-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('Failed to export:', error);
            alert('Failed to export attendees list');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0f0f1e' }}>
                <Sidebar organizerName={user?.name} organizationName={organizer?.organizationName} />
                <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress sx={{ color: '#9353d3' }} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0f0f1e' }}>
            <Sidebar organizerName={user?.name} organizationName={organizer?.organizationName} />

            <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, p: 4 }}>
                <Container maxWidth="xl">
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <IconButton
                                onClick={() => navigate('/organizer/dashboard')}
                                sx={{ color: '#fff', mb: 1 }}
                            >
                                <ArrowBack />
                            </IconButton>
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                Event Attendees
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {event?.title || 'Loading...'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Email />}
                                onClick={() => navigate(`/organizer/communication?eventId=${eventId}`)}
                                sx={{
                                    color: '#9353d3',
                                    borderColor: '#9353d3',
                                    '&:hover': {
                                        borderColor: '#a463e3',
                                        background: 'rgba(147, 83, 211, 0.1)'
                                    }
                                }}
                            >
                                Send Email
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={handleExportCSV}
                                disabled={exporting || attendees.length === 0}
                                sx={{
                                    background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)',
                                    },
                                }}
                            >
                                {exporting ? 'Exporting...' : 'Export CSV'}
                            </Button>
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                        <Paper
                            sx={{
                                p: 2,
                                flex: 1,
                                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                border: '1px solid rgba(147, 83, 211, 0.2)',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                Total Attendees
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                                {attendees.length}
                            </Typography>
                        </Paper>
                        <Paper
                            sx={{
                                p: 2,
                                flex: 1,
                                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                border: '1px solid rgba(147, 83, 211, 0.2)',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                Total Tickets
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                                {attendees.reduce((sum, a) => sum + a.ticketCount, 0)}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Search */}
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                            border: '1px solid rgba(147, 83, 211, 0.2)',
                            borderRadius: 3
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    '& fieldset': {
                                        borderColor: 'rgba(255,255,255,0.2)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#9353d3',
                                    },
                                },
                            }}
                        />
                    </Paper>

                    {/* Attendees Table */}
                    <Paper
                        sx={{
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                            border: '1px solid rgba(147, 83, 211, 0.2)',
                            borderRadius: 3
                        }}
                    >
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Name</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Email</TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">
                                            Tickets
                                        </TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Registration Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAttendees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 4 }}>
                                                {searchTerm ? 'No attendees found matching your search.' : 'No attendees registered yet.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAttendees.map((attendee, index) => (
                                            <TableRow
                                                key={attendee.userId}
                                                sx={{
                                                    '&:hover': {
                                                        background: 'rgba(147, 83, 211, 0.05)',
                                                    },
                                                }}
                                            >
                                                <TableCell sx={{ color: '#fff' }}>{attendee.name}</TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>{attendee.email}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={attendee.ticketCount}
                                                        size="small"
                                                        sx={{
                                                            background: 'rgba(147, 83, 211, 0.2)',
                                                            color: '#9353d3',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                    {new Date(attendee.firstRegistrationDate).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default EventAttendees;

