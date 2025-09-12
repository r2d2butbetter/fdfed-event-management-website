import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    Person,
    Lock
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            const dashboardPath = getDashboardPath(user.role);
            navigate(dashboardPath);
        }
    }, [user, navigate]);

    const getDashboardPath = (role) => {
        switch (role) {
            case 'admin':
                return '/admin/dashboard';
            case 'organizer':
                return '/organizer/dashboard';
            default:
                return '/user/dashboard';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear general error
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const result = await login({
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                const dashboardPath = getDashboardPath(result.user.role);
                navigate(dashboardPath);
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                py: 4,
                background: 'linear-gradient(135deg, rgba(100, 108, 255, 0.05) 0%, rgba(97, 218, 251, 0.05) 100%)',
                borderRadius: 3,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    width: '100%',
                    maxWidth: 450,
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(135deg, #646cff 0%, #61dafb 100%)',
                    }
                }}
            >
                <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #646cff 0%, #61dafb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            boxShadow: '0 8px 32px rgba(100, 108, 255, 0.3)',
                        }}
                    >
                        <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #646cff 0%, #61dafb 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontSize: '1.1rem', lineHeight: 1.5 }}
                    >
                        Sign in to your account to continue your journey
                    </Typography>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                                fontSize: '0.95rem',
                            }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative', zIndex: 1 }}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        required
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.08)',
                                },
                                '&.Mui-focused': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        required
                        sx={{
                            mb: 4,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.08)',
                                },
                                '&.Mui-focused': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': {
                                                color: 'primary.main',
                                            }
                                        }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                            mb: 3,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #646cff 0%, #61dafb 100%)',
                            boxShadow: '0 8px 32px rgba(100, 108, 255, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #535bf2 0%, #4ac8e8 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 40px rgba(100, 108, 255, 0.4)',
                            },
                            '&:disabled': {
                                background: 'rgba(100, 108, 255, 0.3)',
                            }
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </Box>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                        OR
                    </Typography>
                </Divider>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        style={{
                            color: '#646cff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            transition: 'color 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#535bf2'}
                        onMouseLeave={(e) => e.target.style.color = '#646cff'}
                    >
                        Sign up here
                    </Link>
                </Typography>

                <Typography variant="caption" color="text.secondary">
                    Forgot your password?{' '}
                    <Link
                        to="/forgot-password"
                        style={{
                            color: '#61dafb',
                            textDecoration: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Reset it here
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}

export default Login;