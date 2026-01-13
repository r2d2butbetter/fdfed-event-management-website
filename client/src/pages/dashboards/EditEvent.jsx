import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/organizer/Sidebar';
import { useSelector } from 'react-redux';
import { api, API_BASE_URL } from '../../api/client';

const drawerWidth = 260;

const CATEGORY_OPTIONS = [
    'TEDx',
    'Health Camp',
    'Concerts',
    'Exhibitions',
];

const STATUS_OPTIONS = [
    'start_selling',
    'upcoming',
    'over',
];

function EditEvent() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { organizer, user } = useSelector((state) => state.organizer);

    const [form, setForm] = useState({
        title: '',
        description: '',
        venue: '',
        category: '',
        status: 'start_selling',
        price: '',
        capacity: '',
        startDateTime: '',
        endDateTime: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        async function loadEvent() {
            try {
                setLoading(true);
                const resp = await api.get(`/events/${eventId}`);
                if (resp?.data?.event) {
                    const e = resp.data.event;
                    setForm({
                        title: e.title || '',
                        description: e.description || '',
                        venue: e.venue || '',
                        category: e.category || '',
                        status: e.status || 'start_selling',
                        price: e.ticketPrice ?? '',
                        capacity: e.capacity ?? '',
                        startDateTime: e.startDateTime ? new Date(e.startDateTime).toISOString().slice(0, 16) : '',
                        endDateTime: e.endDateTime ? new Date(e.endDateTime).toISOString().slice(0, 16) : '',
                    });
                    setImagePreview(e.image ? (e.image.startsWith('http') ? e.image : `${API_BASE_URL}${e.image}`) : '');
                }
            } catch (err) {
                setError(err.message || 'Failed to load event');
            } finally {
                setLoading(false);
            }
        }
        loadEvent();
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImageFile(null);
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const errors = {};
        if (!form.title.trim()) errors.title = 'Title is required';
        if (!form.startDateTime) errors.startDateTime = 'Start date/time is required';
        if (!form.endDateTime) errors.endDateTime = 'End date/time is required';
        if (form.startDateTime && form.endDateTime) {
            const s = new Date(form.startDateTime);
            const e = new Date(form.endDateTime);
            if (s > e) {
                errors.startDateTime = 'Start must be before end';
                errors.endDateTime = 'End must be after start';
            }
        }
        if (form.capacity && Number(form.capacity) < 0) errors.capacity = 'Capacity cannot be negative';
        if (form.price && Number(form.price) < 0) errors.price = 'Price cannot be negative';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setError('Please fix the highlighted fields');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('venue', form.venue);
            formData.append('category', form.category);
            formData.append('status', form.status);
            formData.append('capacity', String(form.capacity));
            formData.append('price', String(form.price));
            formData.append('startDateTime', form.startDateTime);
            formData.append('endDateTime', form.endDateTime);
            if (imageFile) formData.append('image', imageFile);

            const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to update event');
            }

            setSnackbar({ open: true, message: 'Event updated successfully', severity: 'success' });
            setTimeout(() => navigate('/organizer/dashboard'), 800);
        } catch (err) {
            setSnackbar({ open: true, message: err.message || 'Update failed', severity: 'error' });
        } finally {
            setSaving(false);
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
                <Container maxWidth="md">
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
                        Edit Event
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Paper
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                            border: '1px solid rgba(147, 83, 211, 0.2)',
                            borderRadius: 3,
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiSvgIcon-root': { color: '#fff' },
                                    }}
                                >
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiSvgIcon-root': { color: '#fff' },
                                    }}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Venue"
                                    name="venue"
                                    value={form.venue}
                                    onChange={handleChange}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Ticket Price"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Capacity"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Start Date & Time"
                                    name="startDateTime"
                                    value={form.startDateTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="End Date & Time"
                                    name="endDateTime"
                                    value={form.endDateTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.7)' } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: '#9353d3' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                                >
                                    Upload Image
                                    <input type="file" hidden accept="image/*" onChange={handleFile} />
                                </Button>
                                {imagePreview && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                            Preview
                                        </Typography>
                                        <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
                                    </Box>
                                )}
                            </Grid>
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={saving}
                                    sx={{
                                        background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                        '&:hover': { background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)' },
                                        '&:disabled': { background: 'rgba(147, 83, 211, 0.4)' },
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default EditEvent;

