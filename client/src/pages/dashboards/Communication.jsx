import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Autocomplete
} from '@mui/material';
import { Send, ArrowBack, Email } from '@mui/icons-material';
import { api } from '../../api/client';
import Sidebar from '../../components/organizer/Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvents } from '../../redux/slices/eventSlice';

const drawerWidth = 260;

function Communication() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const eventIdParam = searchParams.get('eventId');
    const dispatch = useDispatch();
    const { organizer, user } = useSelector((state) => state.organizer);
    const { events } = useSelector((state) => state.events);

    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(eventIdParam || '');
    const [attendees, setAttendees] = useState([]);
    const [selectedAttendees, setSelectedAttendees] = useState([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchEvents());
        if (eventIdParam) {
            setSelectedEventId(eventIdParam);
            fetchAttendees(eventIdParam);
        }
    }, [dispatch, eventIdParam]);

    const fetchAttendees = async (eventId) => {
        if (!eventId) return;
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/organizer/events/${eventId}/attendees`);
            if (response.success) {
                setAttendees(response.data.attendees);
                // Auto-select all attendees
                setSelectedAttendees(response.data.attendees);
            }
        } catch (error) {
            console.error('Failed to fetch attendees:', error);
            setError('Failed to load attendees for this event');
        } finally {
            setLoading(false);
        }
    };

    const handleEventChange = (event) => {
        const newEventId = event.target.value;
        setSelectedEventId(newEventId);
        setSelectedAttendees([]);
        setSubject('');
        setMessage('');
        if (newEventId) {
            fetchAttendees(newEventId);
        } else {
            setAttendees([]);
        }
    };

    const handleSendEmail = async () => {
        if (!selectedEventId) {
            setError('Please select an event');
            return;
        }
        if (!subject.trim()) {
            setError('Please enter a subject');
            return;
        }
        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }
        if (selectedAttendees.length === 0) {
            setError('Please select at least one recipient');
            return;
        }

        try {
            setSending(true);
            setError(null);
            setSuccess(false);

            const recipientEmails = selectedAttendees.map(a => a.email);
            const response = await api.post(`/organizer/events/${selectedEventId}/send-email`, {
                subject: subject.trim(),
                message: message.trim(),
                recipientEmails
            });

            if (response.success) {
                setSuccess(true);
                setSubject('');
                setMessage('');
                setTimeout(() => {
                    setSuccess(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            setError(error.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const selectedEvent = events.find(e => e._id === selectedEventId);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0f0f1e' }}>
            <Sidebar organizerName={user?.name} organizationName={organizer?.organizationName} />

            <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, p: 4 }}>
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/organizer/dashboard')}
                                sx={{ color: '#fff', mb: 1 }}
                            >
                                Back
                            </Button>
                            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                Send Email to Attendees
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Communicate with your event attendees
                            </Typography>
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
                            Email sent successfully!
                        </Alert>
                    )}

                    {/* Event Selection */}
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                            border: '1px solid rgba(147, 83, 211, 0.2)',
                            borderRadius: 3
                        }}
                    >
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Event</InputLabel>
                            <Select
                                value={selectedEventId}
                                onChange={handleEventChange}
                                label="Select Event"
                                sx={{
                                    color: '#fff',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.2)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.3)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#9353d3',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: 'rgba(255,255,255,0.7)',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {events.map((event) => (
                                    <MenuItem key={event._id} value={event._id}>
                                        {event.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={24} sx={{ color: '#9353d3' }} />
                            </Box>
                        )}

                        {selectedEventId && !loading && attendees.length > 0 && (
                            <Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                                    Select Recipients ({attendees.length} total attendees)
                                </Typography>
                                <Autocomplete
                                    multiple
                                    value={selectedAttendees}
                                    onChange={(event, newValue) => {
                                        setSelectedAttendees(newValue);
                                    }}
                                    options={attendees}
                                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={option.userId}
                                                label={`${option.name} (${option.email})`}
                                                sx={{
                                                    background: 'rgba(147, 83, 211, 0.2)',
                                                    color: '#9353d3',
                                                }}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select attendees..."
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
                                    )}
                                    sx={{
                                        '& .MuiAutocomplete-tag': {
                                            background: 'rgba(147, 83, 211, 0.2)',
                                        },
                                    }}
                                />
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedAttendees(attendees)}
                                        sx={{ color: '#9353d3' }}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedAttendees([])}
                                        sx={{ color: '#9353d3' }}
                                    >
                                        Clear All
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Paper>

                    {/* Email Form */}
                    {selectedEventId && (
                        <Paper
                            sx={{
                                p: 3,
                                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                border: '1px solid rgba(147, 83, 211, 0.2)',
                                borderRadius: 3
                            }}
                        >
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                                Compose Email
                            </Typography>

                            <TextField
                                fullWidth
                                label="Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject..."
                                sx={{ mb: 3 }}
                                InputLabelProps={{
                                    sx: { color: 'rgba(255,255,255,0.7)' }
                                }}
                                sx={{
                                    mb: 3,
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
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255,255,255,0.7)',
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Your message to attendees..."
                                multiline
                                rows={10}
                                InputLabelProps={{
                                    sx: { color: 'rgba(255,255,255,0.7)' }
                                }}
                                sx={{
                                    mb: 3,
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
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255,255,255,0.7)',
                                    },
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setSubject('');
                                        setMessage('');
                                    }}
                                    sx={{
                                        color: '#fff',
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        '&:hover': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                        }
                                    }}
                                >
                                    Clear
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Send />}
                                    onClick={handleSendEmail}
                                    disabled={sending || !subject.trim() || !message.trim() || selectedAttendees.length === 0}
                                    sx={{
                                        background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(147, 83, 211, 0.3)',
                                        }
                                    }}
                                >
                                    {sending ? 'Sending...' : `Send to ${selectedAttendees.length} ${selectedAttendees.length === 1 ? 'Recipient' : 'Recipients'}`}
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {!selectedEventId && (
                        <Paper
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                border: '1px solid rgba(147, 83, 211, 0.2)',
                                borderRadius: 3
                            }}
                        >
                            <Email sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Please select an event to send emails to attendees
                            </Typography>
                        </Paper>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

export default Communication;

