import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Skeleton,
    useMediaQuery,
    Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
} from 'recharts';

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
};

/**
 * ActivityChart - Charts component showing user activity statistics
 */
const ActivityChart = ({
    monthlyAttendance = [],
    monthlySpending = [],
    spendingByCategory = [],
    summary = {},
    loading = false,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';

    // Chart colors based on theme
    const chartColors = {
        primary: isDark ? '#3b82f6' : '#2563eb',
        secondary: isDark ? '#0ea5e9' : '#0284c7',
        grid: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        text: isDark ? '#94a3b8' : '#64748b',
        tooltip: {
            bg: isDark ? '#1e293b' : '#ffffff',
            border: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.15)',
        },
    };

    // Custom tooltip style
    const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
        if (active && payload && payload.length) {
            return (
                <Paper
                    elevation={3}
                    sx={{
                        bgcolor: chartColors.tooltip.bg,
                        border: `1px solid ${chartColors.tooltip.border}`,
                        borderRadius: 1,
                        p: 1.5,
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: entry.color, fontWeight: 600 }}
                        >
                            {prefix}{typeof entry.value === 'number' ? entry.value.toFixed(entry.value % 1 === 0 ? 0 : 2) : entry.value}{suffix}
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="rectangular" sx={{ flex: '1 1 200px', height: 100, borderRadius: 2 }} />
                    ))}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
                    <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
                </Box>
            </Box>
        );
    }

    // Prepare data with formatted months
    const attendanceData = monthlyAttendance.map((item) => ({
        ...item,
        label: formatMonth(item.month),
    }));

    const spendingData = monthlySpending.map((item) => ({
        ...item,
        label: formatMonth(item.month),
    }));

    // Combine attendance and spending data for combined chart
    const combinedData = attendanceData.map((item, index) => ({
        ...item,
        spending: spendingData[index]?.amount || 0,
    }));

    const chartHeight = isMobile ? 280 : 320;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Summary Stats Row */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(4, 1fr)'
                    },
                    gap: 2,
                    mb: 4,
                }}
            >
                {[
                    { label: 'Total Spent', value: `$${summary.totalSpent?.toFixed(0) || 0}`, color: 'primary.main' },
                    { label: 'Events Attended', value: summary.totalEvents || 0, color: 'secondary.main' },
                    { label: 'Avg. per Event', value: `$${summary.avgSpentPerEvent?.toFixed(0) || 0}`, color: 'info.main' },
                    { label: 'Categories', value: summary.categoriesExplored || 0, color: 'success.main' },
                ].map((stat, index) => (
                    <Card key={index} sx={{ textAlign: 'center' }}>
                        <CardContent sx={{ py: 2.5, px: 2 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: stat.color,
                                    fontWeight: 700,
                                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                                }}
                            >
                                {stat.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {stat.label}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Main Charts Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        lg: 'repeat(2, 1fr)'
                    },
                    gap: 3,
                }}
            >
                {/* Events Attendance Area Chart */}
                <Card>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Events Attended (Last 12 Months)
                        </Typography>
                        <Box sx={{ width: '100%', height: chartHeight }}>
                            <ResponsiveContainer>
                                <AreaChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: chartColors.text, fontSize: 12 }}
                                        axisLine={{ stroke: chartColors.grid }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: chartColors.text, fontSize: 12 }}
                                        axisLine={{ stroke: chartColors.grid }}
                                        allowDecimals={false}
                                        tickLine={false}
                                        width={35}
                                    />
                                    <Tooltip content={<CustomTooltip suffix=" events" />} />
                                    <Area
                                        type="monotone"
                                        dataKey="events"
                                        stroke={chartColors.primary}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorEvents)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>

                {/* Monthly Spending Bar Chart */}
                <Card>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Monthly Spending (Last 12 Months)
                        </Typography>
                        <Box sx={{ width: '100%', height: chartHeight }}>
                            <ResponsiveContainer>
                                <BarChart data={spendingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={chartColors.secondary} stopOpacity={1} />
                                            <stop offset="100%" stopColor={chartColors.secondary} stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: chartColors.text, fontSize: 12 }}
                                        axisLine={{ stroke: chartColors.grid }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: chartColors.text, fontSize: 12 }}
                                        axisLine={{ stroke: chartColors.grid }}
                                        tickFormatter={(value) => `$${value}`}
                                        tickLine={false}
                                        width={50}
                                    />
                                    <Tooltip content={<CustomTooltip prefix="$" />} />
                                    <Bar
                                        dataKey="amount"
                                        fill="url(#colorSpending)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>

                {/* Spending by Category Pie Chart */}
                {spendingByCategory.length > 0 && (
                    <Card>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Spending by Category
                            </Typography>
                            <Box sx={{ width: '100%', height: chartHeight }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={spendingByCategory}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={isMobile ? 40 : 60}
                                            outerRadius={isMobile ? 80 : 100}
                                            paddingAngle={2}
                                            label={({ category, percent }) =>
                                                isTablet ? `${(percent * 100).toFixed(0)}%` : `${category}`
                                            }
                                            labelLine={{ stroke: chartColors.text, strokeWidth: 1 }}
                                        >
                                            {spendingByCategory.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                                            contentStyle={{
                                                backgroundColor: chartColors.tooltip.bg,
                                                border: `1px solid ${chartColors.tooltip.border}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span style={{ color: chartColors.text }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Events by Category Horizontal Bar */}
                {spendingByCategory.length > 0 && (
                    <Card>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Events by Category
                            </Typography>
                            <Box sx={{ width: '100%', height: chartHeight }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        data={spendingByCategory}
                                        layout="vertical"
                                        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tick={{ fill: chartColors.text, fontSize: 12 }}
                                            axisLine={{ stroke: chartColors.grid }}
                                            allowDecimals={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="category"
                                            tick={{ fill: chartColors.text, fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={85}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value} events`, 'Count']}
                                            contentStyle={{
                                                backgroundColor: chartColors.tooltip.bg,
                                                border: `1px solid ${chartColors.tooltip.border}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[0, 6, 6, 0]}
                                            barSize={24}
                                        >
                                            {spendingByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default ActivityChart;
