import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * UserStatsCard - Modern statistics card component
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {React.ReactNode} props.icon - Icon component
 * @param {number} props.change - Percentage change (optional)
 * @param {'success'|'warning'|'error'|'info'|'primary'} props.color - Theme color
 * @param {boolean} props.loading - Loading state
 * @param {string} props.subtitle - Optional subtitle text
 */
const UserStatsCard = ({
    title,
    value,
    icon,
    change,
    color = 'primary',
    loading = false,
    subtitle,
}) => {
    const theme = useTheme();
    const isPositiveChange = change > 0;
    const hasChange = change !== undefined && change !== null;
    const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

    if (loading) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="rounded" width={52} height={52} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="text" width="40%" height={36} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Icon Container */}
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(colorValue, 0.12),
                            color: colorValue,
                            flexShrink: 0,
                            '& svg': {
                                fontSize: 26,
                            },
                        }}
                    >
                        {icon}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 500,
                                fontSize: '0.8rem',
                                lineHeight: 1.2,
                                mb: 0.5,
                            }}
                        >
                            {title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                                    lineHeight: 1,
                                }}
                            >
                                {value}
                            </Typography>

                            {hasChange && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.25,
                                        px: 0.75,
                                        py: 0.25,
                                        borderRadius: 1,
                                        bgcolor: isPositiveChange
                                            ? alpha(theme.palette.success.main, 0.1)
                                            : alpha(theme.palette.error.main, 0.1),
                                    }}
                                >
                                    {isPositiveChange ? (
                                        <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                                    ) : (
                                        <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                                    )}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: isPositiveChange ? 'success.main' : 'error.main',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        {isPositiveChange ? '+' : ''}{change}%
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {subtitle && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    mt: 0.5,
                                    display: 'block',
                                    fontSize: '0.7rem',
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default UserStatsCard;
