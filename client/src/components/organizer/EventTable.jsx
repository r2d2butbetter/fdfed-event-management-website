import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Typography,
    Box,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function EventTable({ events, onDelete }) {
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status) {
            case 'start_selling':
                return 'success';
            case 'draft':
                return 'default';
            case 'completed':
                return 'error';
            default:
                return 'primary';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'start_selling':
                return 'Active';
            case 'draft':
                return 'Draft';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString()}`;
    };

    if (events.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    No events found
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            sx={{
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(147, 83, 211, 0.2)',
                borderRadius: 3,
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Title</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Venue</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Capacity</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Price</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {events.map((event) => (
                        <TableRow
                            key={event._id}
                            sx={{
                                '&:hover': {
                                    background: 'rgba(147, 83, 211, 0.05)',
                                },
                            }}
                        >
                            <TableCell sx={{ color: '#fff' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {event.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {event.category}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {formatDate(event.startDateTime)}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {event.venue}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {event.capacity}
                            </TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {formatCurrency(event.ticketPrice)}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={getStatusLabel(event.status)}
                                    color={getStatusColor(event.status)}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => navigate(`/events/${event._id}`)}
                                        sx={{ color: '#3b82f6' }}
                                    >
                                        <Visibility fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => navigate(`/organizer/edit-event/${event._id}`)}
                                        sx={{ color: '#10b981' }}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(event._id)}
                                        sx={{ color: '#f43f5e' }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default EventTable;
