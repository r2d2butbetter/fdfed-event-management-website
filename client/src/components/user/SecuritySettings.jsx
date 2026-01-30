import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Snackbar,
    Divider,
    InputAdornment,
    IconButton,
    LinearProgress,
} from '@mui/material';
import {
    Lock,
    Email,
    Visibility,
    VisibilityOff,
    Key,
} from '@mui/icons-material';

// Password strength calculator
const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
};

const getStrengthLabel = (strength) => {
    if (strength < 30) return { label: 'Weak', color: 'error' };
    if (strength < 60) return { label: 'Fair', color: 'warning' };
    if (strength < 80) return { label: 'Good', color: 'info' };
    return { label: 'Strong', color: 'success' };
};

/**
 * SecuritySettings - Password and email change forms
 */
const SecuritySettings = ({
    onChangePassword,
    onChangeEmail,
}) => {
    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Email change state
    const [emailForm, setEmailForm] = useState({
        newEmail: '',
        password: '',
    });
    const [emailErrors, setEmailErrors] = useState({});
    const [emailLoading, setEmailLoading] = useState(false);
    const [showEmailPassword, setShowEmailPassword] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Password form handlers
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        }
        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (passwordForm.currentPassword === passwordForm.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm() || !onChangePassword) return;

        setPasswordLoading(true);
        try {
            await onChangePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSnackbar({
                open: true,
                message: 'Password changed successfully!',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to change password',
                severity: 'error',
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    // Email form handlers
    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        setEmailForm((prev) => ({ ...prev, [name]: value }));
        if (emailErrors[name]) {
            setEmailErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateEmailForm = () => {
        const errors = {};
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailForm.newEmail) {
            errors.newEmail = 'New email is required';
        } else if (!emailRegex.test(emailForm.newEmail)) {
            errors.newEmail = 'Please enter a valid email address';
        }
        if (!emailForm.password) {
            errors.password = 'Password is required to change email';
        }
        setEmailErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmailForm() || !onChangeEmail) return;

        setEmailLoading(true);
        try {
            await onChangeEmail({
                newEmail: emailForm.newEmail,
                password: emailForm.password,
            });
            setEmailForm({ newEmail: '', password: '' });
            setSnackbar({
                open: true,
                message: 'Email updated successfully!',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to update email',
                severity: 'error',
            });
        } finally {
            setEmailLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);
    const strengthInfo = getStrengthLabel(passwordStrength);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Change Password Card */}
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Lock sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Change Password</Typography>
                        </Box>

                        <form onSubmit={handlePasswordSubmit}>
                            <TextField
                                fullWidth
                                type={showPasswords.current ? 'text' : 'password'}
                                label="Current Password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                error={!!passwordErrors.currentPassword}
                                helperText={passwordErrors.currentPassword}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('current')}
                                                edge="end"
                                            >
                                                {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                type={showPasswords.new ? 'text' : 'password'}
                                label="New Password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                error={!!passwordErrors.newPassword}
                                helperText={passwordErrors.newPassword}
                                sx={{ mb: 1 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('new')}
                                                edge="end"
                                            >
                                                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password Strength Indicator */}
                            {passwordForm.newPassword && (
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Password Strength
                                        </Typography>
                                        <Typography variant="caption" color={`${strengthInfo.color}.main`}>
                                            {strengthInfo.label}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrength}
                                        color={strengthInfo.color}
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </Box>
                            )}

                            <TextField
                                fullWidth
                                type={showPasswords.confirm ? 'text' : 'password'}
                                label="Confirm New Password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                error={!!passwordErrors.confirmPassword}
                                helperText={passwordErrors.confirmPassword}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                edge="end"
                                            >
                                                {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Key />}
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Email Card */}
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Email sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">Change Email Address</Typography>
                        </Box>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            Changing your email will require you to verify your password for security purposes.
                        </Alert>

                        <form onSubmit={handleEmailSubmit}>
                            <TextField
                                fullWidth
                                type="email"
                                label="New Email Address"
                                name="newEmail"
                                value={emailForm.newEmail}
                                onChange={handleEmailChange}
                                error={!!emailErrors.newEmail}
                                helperText={emailErrors.newEmail}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                type={showEmailPassword ? 'text' : 'password'}
                                label="Current Password"
                                name="password"
                                value={emailForm.password}
                                onChange={handleEmailChange}
                                error={!!emailErrors.password}
                                helperText={emailErrors.password || 'Required to verify your identity'}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowEmailPassword(!showEmailPassword)}
                                                edge="end"
                                            >
                                                {showEmailPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Email />}
                                    disabled={emailLoading}
                                >
                                    {emailLoading ? 'Updating...' : 'Update Email'}
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>

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

export default SecuritySettings;
