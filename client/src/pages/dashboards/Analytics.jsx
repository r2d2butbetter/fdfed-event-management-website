import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ConfirmationNumber, AttachMoney, Timeline } from '@mui/icons-material';
import { fetchDashboardData } from '../../redux/slices/organizerSlice';
import { fetchEvents } from '../../redux/slices/eventSlice';
import Sidebar from '../../components/organizer/Sidebar';
import StatsCard from '../../components/organizer/StatsCard';

const drawerWidth = 260;

function Analytics() {
    const dispatch = useDispatch();
    const { organizer, user, stats } = useSelector((state) => state.organizer);
    const { events } = useSelector((state) => state.events);
    const [revenueTab, setRevenueTab] = useState(0);

    useEffect(() => {
        dispatch(fetchDashboardData());
        dispatch(fetchEvents());
    }, [dispatch]);



    const handleRevenueTabChange = (event, newValue) => {
        setRevenueTab(newValue);
    };

    const getRevenueData = () => {
        switch (revenueTab) {
            case 0:
                return stats.weeklySalesData || [];
            case 1:
                return stats.monthlyRevenueData || [];
            case 2:
                return stats.quarterlyRevenueData || [];
            case 3:
                return stats.yearlyRevenueData || [];
            default:
                return stats.weeklySalesData || [];
        }
    };

    const getRevenueLabel = () => {
        switch (revenueTab) {
            case 0:
                return 'Weekly Revenue Trends';
            case 1:
                return 'Monthly Revenue Trends';
            case 2:
                return 'Quarterly Revenue Trends';
            case 3:
                return 'Yearly Revenue Trends';
            default:
                return 'Revenue Trends';
        }
    };

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
                        {/* Revenue Trends Chart */}
                        <Grid item xs={12} lg={8}>
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                        {getRevenueLabel()}
                                    </Typography>
                                    <Tabs
                                        value={revenueTab}
                                        onChange={handleRevenueTabChange}
                                        sx={{
                                            '& .MuiTab-root': {
                                                color: 'rgba(255,255,255,0.7)',
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                minWidth: 'auto',
                                                px: 1.5,
                                                '&.Mui-selected': {
                                                    color: '#9353d3',
                                                },
                                            },
                                            '& .MuiTabs-indicator': {
                                                backgroundColor: '#9353d3',
                                            },
                                        }}
                                    >
                                        <Tab label="Weekly" />
                                        <Tab label="Monthly" />
                                        <Tab label="Quarterly" />
                                        <Tab label="Yearly" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getRevenueData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
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
                                                label={{ value: 'Tickets', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="rgba(255,255,255,0.5)"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                label={{ value: 'Revenue (₹)', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.5)' }}
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
                                                dot={{ fill: '#2dd4bf', r: 6 }}
                                                name="Tickets Sold"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#a855f7"
                                                strokeWidth={3}
                                                dot={{ fill: '#a855f7', r: 6 }}
                                                name="Revenue (₹)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Peak Registration Times */}
                        <Grid item xs={12} lg={4}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                            border: '1px solid rgba(147, 83, 211, 0.2)',
                                            borderRadius: 3,
                                            height: '100%'
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                            Peak Registration Hours
                                        </Typography>
                                        <Box sx={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.peakHoursData || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                                    <XAxis
                                                        dataKey="hour"
                                                        stroke="rgba(255,255,255,0.5)"
                                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis
                                                        stroke="rgba(255,255,255,0.5)"
                                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: '#1a1a2e',
                                                            border: '1px solid rgba(147, 83, 211, 0.3)',
                                                            borderRadius: 8,
                                                            color: '#fff',
                                                        }}
                                                    />
                                                    <Bar dataKey="count" fill="#9353d3" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                            border: '1px solid rgba(147, 83, 211, 0.2)',
                                            borderRadius: 3,
                                            height: '100%'
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                            Peak Registration Days
                                        </Typography>
                                        <Box sx={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.peakDaysData || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                                    <XAxis
                                                        dataKey="day"
                                                        stroke="rgba(255,255,255,0.5)"
                                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis
                                                        stroke="rgba(255,255,255,0.5)"
                                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: '#1a1a2e',
                                                            border: '1px solid rgba(147, 83, 211, 0.3)',
                                                            borderRadius: 8,
                                                            color: '#fff',
                                                        }}
                                                    />
                                                    <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Revenue Per Event */}
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                    border: '1px solid rgba(147, 83, 211, 0.2)',
                                    borderRadius: 3,
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                                    Revenue Per Event
                                </Typography>
                                <Box sx={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={(stats.revenuePerEvent || []).slice(0, 10)}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                                            layout="vertical"
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                            <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                                            <YAxis
                                                type="category"
                                                dataKey="title"
                                                stroke="rgba(255,255,255,0.5)"
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                                                width={200}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#1a1a2e',
                                                    border: '1px solid rgba(147, 83, 211, 0.3)',
                                                    borderRadius: 8,
                                                    color: '#fff',
                                                }}
                                                formatter={(value, name) => {
                                                    if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                                                    return [value, name];
                                                }}
                                            />
                                            <Bar dataKey="revenue" fill="#9353d3" radius={[0, 8, 8, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Revenue Per Event Table */}
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                                    border: '1px solid rgba(147, 83, 211, 0.2)',
                                    borderRadius: 3,
                                }}
                            >
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
                                    Event Performance Details
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Event Title</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">Revenue</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">Tickets Sold</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">Ticket Price</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">Capacity</TableCell>
                                                <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">Fill Rate</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(stats.revenuePerEvent || []).map((event) => (
                                                <TableRow key={event.eventId} sx={{ '&:hover': { background: 'rgba(147, 83, 211, 0.05)' } }}>
                                                    <TableCell sx={{ color: '#fff' }}>{event.title}</TableCell>
                                                    <TableCell sx={{ color: '#10b981', fontWeight: 600 }} align="right">
                                                        ₹{event.revenue.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }} align="right">
                                                        {event.ticketsSold}
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }} align="right">
                                                        ₹{event.ticketPrice}
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }} align="right">
                                                        {event.capacity}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={`${event.fillRate}%`}
                                                            size="small"
                                                            sx={{
                                                                background: event.fillRate >= 80 ? 'rgba(16, 185, 129, 0.2)' : event.fillRate >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                                                color: event.fillRate >= 80 ? '#10b981' : event.fillRate >= 50 ? '#f59e0b' : '#f43f5e',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
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
