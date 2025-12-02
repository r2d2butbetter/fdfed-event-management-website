import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { api } from '../api/client';

const organizerSchema = Yup.object().shape({
    mobile: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number'),
    description: Yup.string()
        .required('Description is required')
        .min(20, 'Description must be at least 20 characters'),
    orgName: Yup.string()
        .required('Organization name is required')
        .min(3, 'Organization name must be at least 3 characters'),
});

function BecomeOrganizer() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (user?.role === 'organizer') {
            // If user is already an organizer, redirect to dashboard
            navigate('/organizer/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/host_with_us', {
                orgName: values.orgName,
                description: values.description,
                mobile: values.mobile,
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/organizer/dashboard');
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Failed to register as organizer');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    sx={{
                        p: 5,
                        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(147, 83, 211, 0.3)',
                        borderRadius: 4,
                        // boxShadow: '0 8px 32px rgba(147, 83, 211, 0.2)',
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#fff',
                            fontWeight: 700,
                            mb: 1,
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #9353d3 0%, #9353d3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Apply to be a Creator
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255,255,255,0.7)',
                            mb: 4,
                            textAlign: 'center',
                        }}
                    >
                        Join our platform and start hosting amazing events!
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Successfully registered! Redirecting to dashboard...
                        </Alert>
                    )}

                    <Formik
                        initialValues={{
                            mobile: '',
                            description: '',
                            orgName: '',
                        }}
                        validationSchema={organizerSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, values, handleChange, handleBlur }) => (
                            <Form>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <TextField
                                        fullWidth
                                        name="mobile"
                                        label="Mobile Number"
                                        placeholder="Enter mobile number"
                                        value={values.mobile}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.mobile && Boolean(errors.mobile)}
                                        helperText={touched.mobile && errors.mobile}
                                        disabled={loading || success}
                                        sx={{
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255,255,255,0.7)',
                                                fontSize: '0.875rem',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: '#fff',
                                                fontSize: '0.95rem',
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: 'rgba(255,255,255,0.4)',
                                                opacity: 1,
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(147, 83, 211, 0.3)',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9353d3',
                                            },
                                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9353d3',
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={5}
                                        name="description"
                                        label="Description"
                                        placeholder="Tell us about yourself and your events"
                                        value={values.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.description && Boolean(errors.description)}
                                        helperText={touched.description && errors.description}
                                        disabled={loading || success}
                                        sx={{
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255,255,255,0.7)',
                                                fontSize: '0.875rem',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: '#fff',
                                                fontSize: '0.95rem',
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: 'rgba(255,255,255,0.4)',
                                                opacity: 1,
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(147, 83, 211, 0.3)',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9353d3',
                                            },
                                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9353d3',
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        name="orgName"
                                        label="Organization Name"
                                        placeholder="Enter your organization name"
                                        value={values.orgName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.orgName && Boolean(errors.orgName)}
                                        helperText={touched.orgName && errors.orgName}
                                        disabled={loading || success}
                                        sx={{
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255,255,255,0.7)',
                                                fontSize: '0.875rem',
                                            },
                                            '& .MuiInputBase-input': {
                                                color: '#fff',
                                                fontSize: '0.95rem',
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: 'rgba(255,255,255,0.4)',
                                                opacity: 1,
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(147, 83, 211, 0.3)',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9353d3',
                                            },
                                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9353d3',
                                            },
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={loading || success}
                                        sx={{
                                            background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                            py: 1.8,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            mt: 2,
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)',
                                            },
                                            '&:disabled': {
                                                background: 'rgba(147, 83, 211, 0.3)',
                                                color: 'rgba(255,255,255,0.5)',
                                            },
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Submit'}
                                    </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Container>
        </Box>
    );
}

export default BecomeOrganizer;
