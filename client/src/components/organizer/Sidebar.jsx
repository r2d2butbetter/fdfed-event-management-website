import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Divider } from '@mui/material';
import { Dashboard, Analytics, Settings, Logout, Email } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const menuItems = [
    { text: 'My Events', icon: <Dashboard />, path: '/organizer/dashboard' },
    { text: 'Analytics', icon: <Analytics />, path: '/organizer/analytics' },
    { text: 'Communications', icon: <Email />, path: '/organizer/communication' },
    { text: 'Settings', icon: <Settings />, path: '/organizer/settings' },
];

function Sidebar({ organizerName, organizationName }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const bgColor = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    const textColor = '#fff';
    const borderColor = 'rgba(147, 83, 211, 0.2)';

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    background: bgColor,
                    color: textColor,
                    borderRight: `1px solid ${borderColor}`,
                },
            }}
        >
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                        fontSize: '2rem',
                    }}
                >
                    {organizerName?.charAt(0) || 'O'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {organizerName || 'Organizer'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                    {organizationName || 'Organization'}
                </Typography>
            </Box>

            <Divider sx={{ borderColor }} />

            <List sx={{ px: 2, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #9353d3 0%, #643d88 100%)',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #a463e3 0%, #744d98 100%)',
                                    },
                                },
                                '&:hover': {
                                    background: 'rgba(147, 83, 211, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? '#fff' : textColor, minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}

                <ListItem disablePadding sx={{ mt: 2 }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            '&:hover': {
                                background: 'rgba(244, 63, 94, 0.1)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: '#f43f5e', minWidth: 40 }}>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary="Logout" sx={{ color: '#f43f5e' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
}

export default Sidebar;
