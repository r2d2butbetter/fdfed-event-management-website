import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ConfirmationNumber, AttachMoney } from '@mui/icons-material';
import { fetchDashboardData } from '../../redux/slices/organizerSlice';
import { fetchEvents } from '../../redux/slices/eventSlice';
import Sidebar from '../../components/organizer/Sidebar';
import StatsCard from '../../components/organizer/StatsCard';

const drawerWidth = 260;

function Analytics() {
    const dispatch = useDispatch();
    const { organizer, user, stats } = useSelector((state) => state.organizer);
    const { events } = useSelector((state) => state.events);

    useEffect(() => {
        dispatch(fetchDashboardData());
        dispatch(fetchEvents());
    }, [dispatch]);



    // Generate attendees data
    const attendeesData = [
        { name: 'Jan', attendees: 45 },
        { name: 'Feb', attendees: 52 },
        { name: 'Mar', attendees: 61 },
        { name: 'Apr', attendees: 58 },
        { name: 'May', attendees: 70 },
        { name: 'Jun', attendees: 65 },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0f0f1e' }}>
            <Sidebar organizerName={user?.name} organizationName={organizer?.organizationName} />

            <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, p: 4 }}>
                <Container maxWidth="xl">
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 4 }}>
                        Analytics
                    </Typography>

                    {/* Key Metrics */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <StatsCard
                                title="Top Selling Event"
                                value={stats.topSellingEvent?.title || 'N/A'}
                                icon={<TrendingUp />}
                                color="primary"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatsCard
                                title="Total Tickets Sold"
                                value={stats.totalTicketsSold}
                                icon={<ConfirmationNumber />}
                                change={stats.ticketsSoldChange}
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatsCard
                                title="Avg Ticket Price"
                                value={`₹${stats.avgTicketPrice}`}
                                icon={<AttachMoney />}
                                color="secondary"
                            />
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Ticket Sales Chart */}
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(147, 83, 211, 0.2)',
                                    borderRadius: 3,
                                    width: '100%',
                                    overflow: 'hidden'
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                    Ticket Sales
                                </Typography>
                                <Box sx={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.weeklySalesData || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={true} horizontal={true} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(255,255,255,0.5)"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                stroke="rgba(255,255,255,0.5)"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                label={{ value: 'Tickets Sold', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', style: { textAnchor: 'middle' } }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="rgba(255,255,255,0.5)"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                label={{ value: 'Revenue (₹)', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.5)', style: { textAnchor: 'middle' } }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#1a1a2e',
                                                    border: '1px solid rgba(147, 83, 211, 0.3)',
                                                    borderRadius: 8,
                                                    color: '#fff',
                                                }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="tickets"
                                                stroke="#2dd4bf"
                                                strokeWidth={3}
                                                dot={{ fill: '#2dd4bf', r: 6, strokeWidth: 0 }}
                                                activeDot={{ r: 8 }}
                                                name="Tickets Sold"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#a855f7"
                                                strokeWidth={3}
                                                dot={{ fill: '#a855f7', r: 6, strokeWidth: 0 }}
                                                activeDot={{ r: 8 }}
                                                name="Revenue (₹)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>


                    </Grid>

                    {/* Top Events */}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(147, 83, 211, 0.2)',
                                    borderRadius: 3,
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                                    Top Performing Events
                                </Typography>
                                <Grid container spacing={2}>
                                    {events.slice(0, 4).map((event, index) => (
                                        <Grid item xs={12} sm={6} md={3} key={event._id}>
                                            <Card
                                                sx={{
                                                    background: 'rgba(147, 83, 211, 0.1)',
                                                    border: '1px solid rgba(147, 83, 211, 0.3)',
                                                    borderRadius: 2,
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                <CardContent sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h4" sx={{ color: '#9353d3', fontWeight: 700, mb: 1 }}>
                                                        #{index + 1}
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: '#fff',
                                                            mb: 1,
                                                            fontWeight: 600,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}
                                                    >
                                                        {event.title}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                                                        Capacity: {event.capacity}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                                                        ₹{event.ticketPrice} per ticket
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default Analytics;
