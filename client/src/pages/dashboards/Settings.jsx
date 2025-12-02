import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Divider,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import { Save, Lock } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { updateOrganizerProfile, changePassword, clearUpdateStatus } from '../../redux/slices/organizerSlice';
import Sidebar from '../../components/organizer/Sidebar';

const drawerWidth = 260;

const profileSchema = Yup.object().shape({
    organizationName: Yup.string().required('Organization name is required').min(3, 'Must be at least 3 characters'),
    description: Yup.string(),
    contactNo: Yup.string().required('Contact number is required').matches(/^[0-9]{10}$/, 'Must be a valid 10-digit number'),
});

const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

function Settings() {
    const dispatch = useDispatch();
    const { organizer, user, updateLoading, updateError, updateSuccess } = useSelector((state) => state.organizer);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleProfileSubmit = async (values) => {
        try {
            await dispatch(updateOrganizerProfile(values)).unwrap();
            setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
            setTimeout(() => dispatch(clearUpdateStatus()), 3000);
        } catch (error) {
            setSnackbar({ open: true, message: error || 'Failed to update profile', severity: 'error' });
        }
    };

    const handlePasswordSubmit = async (values, { resetForm }) => {
        try {
            await dispatch(
                changePassword({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                })
            ).unwrap();
            setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
            resetForm();
            setTimeout(() => dispatch(clearUpdateStatus()), 3000);
        } catch (error) {
            setSnackbar({ open: true, message: error || 'Failed to change password', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0f0f1e' }}>
            <Sidebar organizerName={user?.name} organizationName={organizer?.organizationName} />

            <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, p: 4 }}>
                <Container maxWidth="md">
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 4 }}>
                        Settings
                    </Typography>

                    {/* Profile Settings */}
                    <Paper
                        sx={{
                            p: 4,
                            mb: 4,
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(147, 83, 211, 0.2)',
                            borderRadius: 3,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                            Organization Profile
                        </Typography>

                        <Formik
                            initialValues={{
                                organizationName: organizer?.organizationName || '',
                                description: organizer?.description || '',
                                contactNo: organizer?.contactNo || '',
                            }}
                            validationSchema={profileSchema}
                            onSubmit={handleProfileSubmit}
                            enableReinitialize
                        >
                            {({ errors, touched, values, handleChange, handleBlur }) => (
                                <Form>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                name="organizationName"
                                                label="Organization Name"
                                                value={values.organizationName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.organizationName && Boolean(errors.organizationName)}
                                                helperText={touched.organizationName && errors.organizationName}
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                                    '& .MuiInputBase-input': { color: '#fff' },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147, 83, 211, 0.3)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                name="description"
                                                label="Description"
                                                value={values.description}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.description && Boolean(errors.description)}
                                                helperText={touched.description && errors.description}
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                                    '& .MuiInputBase-input': { color: '#fff' },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147, 83, 211, 0.3)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                name="contactNo"
                                                label="Contact Number"
                                                value={values.contactNo}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.contactNo && Boolean(errors.contactNo)}
                                                helperText={touched.contactNo && errors.contactNo}
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                                    '& .MuiInputBase-input': { color: '#fff' },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147, 83, 211, 0.3)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={updateLoading ? <CircularProgress size={20} /> : <Save />}
                                                disabled={updateLoading}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)',
                                                    },
                                                }}
                                            >
                                                Save Changes
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </Paper>

                    {/* Password Settings */}
                    <Paper
                        sx={{
                            p: 4,
                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(147, 83, 211, 0.2)',
                            borderRadius: 3,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                            Change Password
                        </Typography>

                        <Formik
                            initialValues={{
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                            }}
                            validationSchema={passwordSchema}
                            onSubmit={handlePasswordSubmit}
                        >
                            {({ errors, touched, values, handleChange, handleBlur }) => (
                                <Form>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                name="currentPassword"
                                                label="Current Password"
                                                value={values.currentPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.currentPassword && Boolean(errors.currentPassword)}
                                                helperText={touched.currentPassword && errors.currentPassword}
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                                    '& .MuiInputBase-input': { color: '#fff' },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147, 83, 211, 0.3)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                name="newPassword"
                                                label="New Password"
                                                value={values.newPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.newPassword && Boolean(errors.newPassword)}
                                                helperText={touched.newPassword && errors.newPassword}
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                                    '& .MuiInputBase-input': { color: '#fff' },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147, 83, 211, 0.3)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                type="password"
                                                name="confirmPassword"
                                                label="Confirm New Password"
                                                value={values.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                                helperText={touched.confirmPassword && errors.confirmPassword}
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                                                    '& .MuiInputBase-input': { color: '#fff' },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(147, 83, 211, 0.3)' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9353d3' },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={updateLoading ? <CircularProgress size={20} /> : <Lock />}
                                                disabled={updateLoading}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)',
                                                    },
                                                }}
                                            >
                                                Change Password
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </Paper>
                </Container>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Settings;
