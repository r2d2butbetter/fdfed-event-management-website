import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Skeleton,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    BookmarkRemove,
    Event,
    LocationOn,
    AttachMoney,
    OpenInNew,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getEventStatus = (startDateTime, status) => {
    if (status === 'cancelled') return { label: 'Cancelled', color: 'error' };
    const eventDate = new Date(startDateTime);
    const now = new Date();
    if (eventDate < now) return { label: 'Past', color: 'default' };
    return { label: 'Upcoming', color: 'success' };
};

/**
 * SavedEventCard - Card component for saved events with unsave functionality
 */
const SavedEventCard = ({
    event,
    onUnsave,
    loading = false,
}) => {
    const navigate = useNavigate();
    const [unsaveDialogOpen, setUnsaveDialogOpen] = useState(false);
    const [unsaveLoading, setUnsaveLoading] = useState(false);

    const handleUnsave = async () => {
        if (!onUnsave) return;

        setUnsaveLoading(true);
        try {
            await onUnsave(event._id);
            setUnsaveDialogOpen(false);
        } catch (error) {
            console.error('Error unsaving event:', error);
        } finally {
            setUnsaveLoading(false);
        }
    };

    const handleViewEvent = () => {
        navigate(`/events/${event._id}`);
    };

    if (loading) {
        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={180} />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" height={28} width="80%" />
                    <Skeleton variant="text" height={20} width="60%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={20} width="70%" />
                    <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
                <CardActions>
                    <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
                </CardActions>
            </Card>
        );
    }

    const status = getEventStatus(event.startDateTime, event.status);
    const imageUrl = event.image
        ? `http://localhost:3000/${event.image}`
        : '/placeholder-event.jpg';

    return (
        <>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                {/* Unsave button overlay */}
                <Tooltip title="Remove from saved">
                    <IconButton
                        size="small"
                        onClick={() => setUnsaveDialogOpen(true)}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': {
                                bgcolor: 'error.main',
                                color: 'white',
                            },
                        }}
                    >
                        <BookmarkRemove fontSize="small" />
                    </IconButton>
                </Tooltip>

                <CardMedia
                    component="img"
                    height="180"
                    image={imageUrl}
                    alt={event.title}
                    sx={{
                        objectFit: 'cover',
                    }}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x180?text=Event';
                    }}
                />

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                                fontWeight: 600,
                                fontSize: '1rem',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                flex: 1,
                                mr: 1,
                            }}
                        >
                            {event.title}
                        </Typography>
                        <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            sx={{ flexShrink: 0 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Event sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(event.startDateTime)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {event.venue}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {event.ticketPrice > 0 ? `$${event.ticketPrice.toFixed(2)}` : 'Free'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Button
                        size="small"
                        variant="contained"
                        endIcon={<OpenInNew />}
                        onClick={handleViewEvent}
                        fullWidth
                    >
                        View Event
                    </Button>
                </CardActions>
            </Card>

            {/* Unsave Confirmation Dialog */}
            <Dialog open={unsaveDialogOpen} onClose={() => setUnsaveDialogOpen(false)}>
                <DialogTitle>Remove from Saved Events?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove <strong>{event.title}</strong> from your saved events?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUnsaveDialogOpen(false)} disabled={unsaveLoading}>
                        Keep Saved
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleUnsave}
                        disabled={unsaveLoading}
                    >
                        {unsaveLoading ? 'Removing...' : 'Remove'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

/**
 * SavedEventCardSkeleton - Loading skeleton for saved event card
 */
export const SavedEventCardSkeleton = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={180} />
        <CardContent sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" height={28} width="80%" />
            <Skeleton variant="text" height={20} width="60%" sx={{ mt: 1 }} />
            <Skeleton variant="text" height={20} width="70%" />
            <Skeleton variant="text" height={20} width="40%" />
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 1 }} />
        </CardActions>
    </Card>
);

export default SavedEventCard;
