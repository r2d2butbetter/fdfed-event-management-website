import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Avatar,
    Alert,
    Snackbar,
    Skeleton,
    Divider,
} from '@mui/material';
import {
    Person,
    Email,
    CalendarMonth,
    Save,
} from '@mui/icons-material';

/**
 * ProfileForm - User profile editing form
 */
const ProfileForm = ({
    user,
    loading = false,
    onUpdate,
}) => {
    const [formData, setFormData] = useState({
        name: '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate() || !onUpdate) return;

        setSaving(true);
        try {
            await onUpdate(formData);
            setSnackbar({
                open: true,
                message: 'Profile updated successfully!',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to update profile',
                severity: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Skeleton variant="circular" width={80} height={80} sx={{ mr: 3 }} />
                        <Box>
                            <Skeleton variant="text" width={150} height={32} />
                            <Skeleton variant="text" width={200} height={24} />
                        </Box>
                    </Box>
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardContent sx={{ p: 3 }}>
                    {/* Profile Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                mr: 3,
                                bgcolor: 'primary.main',
                                fontSize: '2rem',
                                fontWeight: 600,
                            }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={600}>
                                {user?.name || 'User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email || 'email@example.com'}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Edit Profile
                        </Typography>

                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Email Address"
                            value={user?.email || ''}
                            disabled
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            helperText="To change your email, go to Security Settings"
                        />

                        <TextField
                            fullWidth
                            label="Member Since"
                            value={formatDate(user?.createdAt)}
                            disabled
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Save />}
                                disabled={saving || !formData.name.trim() || formData.name === user?.name}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProfileForm;
