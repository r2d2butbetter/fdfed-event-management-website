import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Grid,
    Pagination,
    CircularProgress,
    Alert,
    Chip,
    Button,
    Breadcrumbs,
    Link,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    EventAvailable as EventIcon,
    Home as HomeIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';

const categoryConfig = {
    tedx: {
        title: 'TEDx Events',
        color: '#EB0028',
        gradient: 'linear-gradient(135deg, #EB0028 0%, #FF4C4C 100%)',
        description: 'Ideas worth spreading. Experience inspiring talks from innovative thinkers.',
    },
    exhibitions: {
        title: 'Exhibitions',
        color: '#2E7D32',
        gradient: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        description: 'Explore curated collections and artistic displays from around the world.',
    },
    'health-camps': {
        title: 'Health Camps',
        color: '#1976D2',
        gradient: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
        description: 'Free health checkups and medical awareness programs for the community.',
    },
    concerts: {
        title: 'Concerts',
        color: '#7B1FA2',
        gradient: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
        description: 'Live music performances featuring top artists and emerging talents.',
    },
};

function CategoryPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);
    const eventsRef = useRef(null);

    const config = categoryConfig[category] || {
        title: category?.charAt(0).toUpperCase() + category?.slice(1),
        color: '#667eea',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        description: 'Discover amazing events in this category.',
    };

    useEffect(() => {
        fetchEvents(page);
    }, [category, page]);

    useEffect(() => {
        if (!loading && events.length > 0 && page > 1 && eventsRef.current) {
            const yOffset = -100;
            const y = eventsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [loading, events, page]);

    const fetchEvents = async (pageNum) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: pageNum,
                limit: 15,
            });

            // Convert URL category format (health-camps) to match database format (health camps/Health Camps)
            const categorySearch = category.replace(/-/g, ' ');

            const response = await fetch(
                `http://localhost:3000/events/category/${encodeURIComponent(categorySearch)}?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();

            if (data.success) {
                console.log('Events data sample:', data.data.events[0]);
                console.log('Image fields:', data.data.events.map(e => ({ id: e._id, image: e.image, imageUrl: e.imageUrl })));
                setEvents(data.data.events);
                setTotalPages(data.data.pagination.totalPages);
                setTotalEvents(data.data.pagination.totalEvents);
            } else {
                throw new Error(data.message || 'Failed to fetch events');
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: config.gradient,
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="xl" sx={{ maxWidth: '1400px !important' }}>
                    <Breadcrumbs
                        aria-label="breadcrumb"
                        sx={{
                            mb: 3,
                            '& .MuiBreadcrumbs-separator': { color: 'white' },
                        }}
                    >
                        <Link
                            underline="hover"
                            sx={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                            Home
                        </Link>
                        <Typography
                            sx={{ display: 'flex', alignItems: 'center', color: 'white' }}
                        >
                            <CategoryIcon sx={{ mr: 0.5 }} fontSize="small" />
                            {config.title}
                        </Typography>
                    </Breadcrumbs>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                fontWeight: 800,
                                mb: 2,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                            }}
                        >
                            {config.title}
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontSize: { xs: '1rem', md: '1.25rem' },
                                mb: 3,
                                opacity: 0.95,
                                maxWidth: '800px',
                                mx: 'auto',
                            }}
                        >
                            {config.description}
                        </Typography>
                        <Chip
                            label={`${totalEvents} Event${totalEvents !== 1 ? 's' : ''} Available`}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.25)',
                                color: 'white',
                                fontSize: '1rem',
                                py: 2.5,
                                px: 1,
                                fontWeight: 600,
                                backdropFilter: 'blur(10px)',
                            }}
                        />
                    </Box>
                </Container>

                {/* Decorative elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        filter: 'blur(60px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -150,
                        left: -150,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        filter: 'blur(80px)',
                    }}
                />
            </Box>

            {/* Events Section */}
            <Container
                ref={eventsRef}
                maxWidth="xl"
                sx={{ maxWidth: '1400px !important', py: { xs: 6, md: 8 } }}
            >
                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                        <CircularProgress
                            size={60}
                            sx={{ color: config.color }}
                        />
                    </Box>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            fontSize: '1rem',
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Events Grid */}
                {!loading && !error && events.length > 0 && (
                    <>
                        <Grid
                            container
                            spacing={3}
                            sx={{ alignItems: 'stretch', justifyContent: 'center' }}
                        >
                            {events.map((event) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={2.4}
                                    key={event._id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Card
                                        sx={{
                                            width: '280px',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            border: '1px solid #e8e8e8',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: `0 12px 24px ${config.color}25`,
                                                borderColor: config.color,
                                            },
                                        }}
                                    >
                                        <CardMedia
                                            sx={{
                                                height: 200,
                                                backgroundImage: (event.imageUrl || event.image)
                                                    ? `url(http://localhost:3000/${event.imageUrl || event.image})`
                                                    : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                bgcolor: '#f5f5f5',
                                            }}
                                        >
                                            {!(event.imageUrl || event.image) && (
                                                <EventIcon
                                                    sx={{ fontSize: 64, color: '#ddd' }}
                                                />
                                            )}
                                            <Chip
                                                label={event.category}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    bgcolor: config.color,
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    backdropFilter: 'blur(10px)',
                                                }}
                                            />
                                        </CardMedia>
                                        <CardContent
                                            sx={{
                                                flexGrow: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                p: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 1,
                                                    color: '#1a1a1a',
                                                    fontSize: '1.1rem',
                                                    lineHeight: 1.3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {event.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#666',
                                                    mb: 1.5,
                                                    flexGrow: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {event.description?.substring(0, 80)}
                                                {event.description?.length > 80 ? '...' : ''}
                                            </Typography>
                                            <Box sx={{ mt: 'auto' }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <CalendarIcon
                                                        sx={{ fontSize: 16, color: config.color, mr: 0.5 }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                        {formatDate(event.startDateTime)}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 1,
                                                    }}
                                                >
                                                    <LocationIcon
                                                        sx={{ fontSize: 16, color: config.color, mr: 0.5 }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        {event.venue}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: config.color,
                                                        fontWeight: 700,
                                                        fontSize: '1.3rem',
                                                    }}
                                                >
                                                    ₹{event.price || event.ticketPrice || 0}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{
                                                    bgcolor: config.color,
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    py: 1.2,
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontSize: '0.9rem',
                                                    '&:hover': {
                                                        bgcolor: config.color,
                                                        filter: 'brightness(0.9)',
                                                        transform: 'scale(1.02)',
                                                    },
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onClick={() => navigate(`/events/${event._id}`)}
                                            >
                                                View Details
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 6,
                                    mb: 2,
                                }}
                            >
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            color: config.color,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                        },
                                        '& .Mui-selected': {
                                            bgcolor: `${config.color} !important`,
                                            color: 'white',
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </>
                )}

                {/* No Events State */}
                {!loading && !error && events.length === 0 && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 12,
                            px: 3,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                color: '#1a1a1a',
                            }}
                        >
                            No Events Found
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                mb: 4,
                                fontSize: '1.1rem',
                            }}
                        >
                            There are currently no events in the {config.title.toLowerCase()}{' '}
                            category.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: config.color,
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: config.color,
                                    filter: 'brightness(0.9)',
                                },
                            }}
                            onClick={() => navigate('/')}
                        >
                            Browse All Events
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default CategoryPage;
