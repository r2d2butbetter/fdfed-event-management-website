import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Skeleton,
    Divider,
} from '@mui/material';
import {
    Notifications,
    Email,
    Event,
    Campaign,
} from '@mui/icons-material';
import { debounce } from 'lodash';

/**
 * NotificationSettings - Toggle switches for notification preferences
 */
const NotificationSettings = ({
    preferences,
    loading = false,
    onUpdate,
}) => {
    const [localPreferences, setLocalPreferences] = useState({
        emailUpdates: true,
        eventReminders: true,
        promotionalEmails: false,
    });
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Initialize from props
    useEffect(() => {
        if (preferences) {
            setLocalPreferences(preferences);
        }
    }, [preferences]);

    // Debounced save function
    const debouncedSave = useMemo(
        () =>
            debounce(async (newPreferences) => {
                if (!onUpdate) return;

                setSaving(true);
                try {
                    await onUpdate(newPreferences);
                    setSnackbar({
                        open: true,
                        message: 'Preferences saved',
                        severity: 'success',
                    });
                } catch (error) {
                    setSnackbar({
                        open: true,
                        message: error.message || 'Failed to save preferences',
                        severity: 'error',
                    });
                    // Revert on error
                    if (preferences) {
                        setLocalPreferences(preferences);
                    }
                } finally {
                    setSaving(false);
                }
            }, 500),
        [onUpdate, preferences]
    );

    const handleToggle = (key) => (event) => {
        const newPreferences = {
            ...localPreferences,
            [key]: event.target.checked,
        };
        setLocalPreferences(newPreferences);
        debouncedSave(newPreferences);
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const notificationOptions = [
        {
            key: 'emailUpdates',
            icon: <Email />,
            title: 'Email Updates',
            description: 'Receive email notifications about your bookings and account activity',
        },
        {
            key: 'eventReminders',
            icon: <Event />,
            title: 'Event Reminders',
            description: 'Get reminded about upcoming events you\'ve registered for',
        },
        {
            key: 'promotionalEmails',
            icon: <Campaign />,
            title: 'Promotional Emails',
            description: 'Receive emails about special offers, new events, and recommendations',
        },
    ];

    if (loading) {
        return (
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                        <Skeleton variant="text" width={200} height={32} />
                    </Box>
                    {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <Box>
                                        <Skeleton variant="text" width={150} height={24} />
                                        <Skeleton variant="text" width={250} height={20} />
                                    </Box>
                                </Box>
                                <Skeleton variant="rectangular" width={50} height={30} sx={{ borderRadius: 8 }} />
                            </Box>
                            {i < 3 && <Divider sx={{ my: 2 }} />}
                        </Box>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Notification Preferences</Typography>
                        {saving && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                Saving...
                            </Typography>
                        )}
                    </Box>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        Manage how you want to receive notifications. Changes are saved automatically.
                    </Alert>

                    {notificationOptions.map((option, index) => (
                        <Box key={option.key}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'action.hover',
                                            color: 'primary.main',
                                        }}
                                    >
                                        {option.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={500}>
                                            {option.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {option.description}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch
                                    checked={localPreferences[option.key] || false}
                                    onChange={handleToggle(option.key)}
                                    color="primary"
                                    inputProps={{ 'aria-label': option.title }}
                                />
                            </Box>
                            {index < notificationOptions.length - 1 && <Divider sx={{ my: 2 }} />}
                        </Box>
                    ))}
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
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

export default NotificationSettings;
