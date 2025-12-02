import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

function StatsCard({ title, value, icon, change, color = 'primary' }) {
    const isPositive = change >= 0;

    const colorMap = {
        primary: '#9353d3',
        success: '#10b981',
        secondary: '#f43f5e',
        info: '#3b82f6',
    };

    return (
        <Card
            sx={{
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(147, 83, 211, 0.2)',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px rgba(147, 83, 211, 0.3)`,
                },
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${colorMap[color]}40 0%, ${colorMap[color]}20 100%)`,
                            color: colorMap[color],
                        }}
                    >
                        {icon}
                    </Box>
                </Box>

                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                    {value}
                </Typography>

                {change !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isPositive ? (
                            <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
                        ) : (
                            <TrendingDown sx={{ fontSize: 16, color: '#f43f5e' }} />
                        )}
                        <Typography
                            variant="body2"
                            sx={{
                                color: isPositive ? '#10b981' : '#f43f5e',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                            }}
                        >
                            {Math.abs(change)}% from last month
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default StatsCard;
