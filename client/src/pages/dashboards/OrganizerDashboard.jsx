import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Add as AddIcon } from '@mui/icons-material';

function OrganizerDashboard() {
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
                const response = await api.get('/organizer/dashboard');
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Organizer Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Welcome back, {user?.name || 'Organizer'}!
                    </Typography>
                </div>
                <Button variant="contained" startIcon={<AddIcon />}>
                    Create Event
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Events
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {dashboardData?.totalEvents || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Events Created
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Active Events
                            </Typography>
                            <Typography variant="h3" color="success.main">
                                {dashboardData?.activeEvents || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Currently Running
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Registrations
                            </Typography>
                            <Typography variant="h3" color="secondary">
                                {dashboardData?.totalRegistrations || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Across All Events
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Revenue
                            </Typography>
                            <Typography variant="h3" color="info.main">
                                ${dashboardData?.totalRevenue || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Earnings
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Your Events
                </Typography>
                <Typography color="text.secondary">
                    Manage your events, view registrations, and track performance here.
                </Typography>
            </Paper>
        </Container>
    );
}

export default OrganizerDashboard;
