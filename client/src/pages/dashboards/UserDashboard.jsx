import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

function UserDashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/user/dashboard');
                setDashboardData(response);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthenticated, navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                User Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Welcome back, {user?.name || 'User'}!
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                My Events
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {dashboardData?.eventCount || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Registered Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Saved Events
                            </Typography>
                            <Typography variant="h3" color="secondary">
                                {dashboardData?.savedCount || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Events in Wishlist
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Upcoming
                            </Typography>
                            <Typography variant="h3" color="success.main">
                                {dashboardData?.upcomingCount || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Upcoming Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Recent Activity
                </Typography>
                <Typography color="text.secondary">
                    Your recent event registrations and activities will appear here.
                </Typography>
            </Paper>
        </Container>
    );
}

export default UserDashboard;
