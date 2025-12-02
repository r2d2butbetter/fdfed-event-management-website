import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Person, AdminPanelSettings, Business } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import './Login.css';
import { useAuth } from '../context/AuthContext';

// Validation Schema
const loginSchema = Yup.object().shape({
    role: Yup.string()
        .oneOf(['user', 'organizer', 'admin'], 'Please select a valid role')
        .required('Please select a role'),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required')
});

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (values, { setSubmitting }) => {
        console.log(' Login form submitted with:', { email: values.email, role: values.role });
        setErrorMessage('');
        try {
            console.log(' Calling login function...');
            const result = await login({
                email: values.email,
                password: values.password,
                role: values.role
            });

            console.log(' Login result:', result);

            if (result.success) {
                console.log('Login successful, navigating to dashboard...');
                switch (values.role) {
                    case 'user':
                        console.log('Navigating to /user/dashboard');
                        navigate('/user/dashboard');
                        break;
                    case 'organizer':
                        console.log('Navigating to /organizer/dashboard');
                        navigate('/organizer/dashboard');
                        break;
                    case 'admin':
                        console.log('Navigating to /admin/dashboard');
                        navigate('/admin/dashboard');
                        break;
                    default:
                        console.log('Navigating to /');
                        navigate('/');
                }
            } else {
                console.log('Login failed:', result.message);
                setErrorMessage(result.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.log('Login error caught:', error);
            setErrorMessage('An error occurred during login. Please try again.');
            console.error('Login error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box className="login-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', py: 4, bgcolor: '#f5f5f5' }}>
            <Paper elevation={1} className="login-paper" sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 600, mb: 1 }}>
                    Login
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
                    Please select your role and enter your credentials
                </Typography>

                {errorMessage && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="error.dark">
                            {errorMessage}
                        </Typography>
                    </Box>
                )}

                <Formik
                    initialValues={{
                        role: 'user',
                        email: '',
                        password: ''
                    }}
                    validationSchema={loginSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                        <Form>
                            {/* Role Selection */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>
                                    Login as:
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    Admins can access all roles Organizers can access Organizer and User
                                </Typography>
                                <ToggleButtonGroup
                                    value={values.role}
                                    exclusive
                                    onChange={(event, newRole) => {
                                        if (newRole !== null) {
                                            setFieldValue('role', newRole);
                                        }
                                    }}
                                    aria-label="user role"
                                    fullWidth
                                    className="role-toggle-group"
                                >
                                    <ToggleButton value="user" aria-label="user" className="role-toggle-btn">
                                        <Person sx={{ mr: 1 }} />
                                        User
                                    </ToggleButton>
                                    <ToggleButton value="organizer" aria-label="organizer" className="role-toggle-btn">
                                        <Business sx={{ mr: 1 }} />
                                        Organizer
                                    </ToggleButton>
                                    <ToggleButton value="admin" aria-label="admin" className="role-toggle-btn">
                                        <AdminPanelSettings sx={{ mr: 1 }} />
                                        Admin
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                {touched.role && errors.role && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                                        {errors.role}
                                    </Typography>
                                )}
                            </Box>

                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                variant="outlined"
                                sx={{ mb: 2.5 }}
                                placeholder="Enter your email"
                            />

                            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }} error={touched.password && Boolean(errors.password)}>
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <OutlinedInput
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                    placeholder="Enter your password (min 8 characters)"
                                />
                                {touched.password && errors.password && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                        {errors.password}
                                    </Typography>
                                )}
                            </FormControl>


                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={isSubmitting}
                                sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
                            >
                                Login as {values.role.charAt(0).toUpperCase() + values.role.slice(1)}
                            </Button>
                        </Form>
                    )}
                </Formik>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <Button size="small" sx={{ textTransform: 'none' }}>
                                Sign Up
                            </Button>
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default Login;