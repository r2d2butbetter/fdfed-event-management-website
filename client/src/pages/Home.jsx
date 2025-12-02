import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Grid,
    Pagination,
    CircularProgress,
    Alert,
    Chip,
    TextField,
    MenuItem,
    Paper,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    Groups as GroupsIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Support as SupportIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    EventAvailable as EventIcon,
} from '@mui/icons-material';
import HeroSection from '../components/HeroSection';
import './Home.css';

function Home() {
    const [sellingEvents, setSellingEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sellingPage, setSellingPage] = useState(1);
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [sellingTotalPages, setSellingTotalPages] = useState(1);
    const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
    const sellingEventsRef = useRef(null);
    const upcomingEventsRef = useRef(null);
    const prevSellingPageRef = useRef(1);
    const prevUpcomingPageRef = useRef(1);

    // Filter states
    const [titleFilter, setTitleFilter] = useState('');
    const [venueFilter, setVenueFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const categories = [
        'All Categories',
        'TEDx',
        'Health Camp',
        'Concerts',
        'Exhibitions',
    ];

    useEffect(() => {
        fetchEvents(sellingPage, upcomingPage);
    }, [sellingPage, upcomingPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setSellingPage(1);
        setUpcomingPage(1);
        fetchEvents(1, 1);
    }, [titleFilter, venueFilter, categoryFilter]);

    useEffect(() => {
        // Only scroll if user actually changed the selling page (not initial load or filter change)
        const pageChanged = sellingPage !== prevSellingPageRef.current;
        if (!loading && sellingEvents.length > 0 && pageChanged && sellingEventsRef.current) {
            const yOffset = -100;
            const y = sellingEventsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        prevSellingPageRef.current = sellingPage;
    }, [loading, sellingEvents, sellingPage]);

    useEffect(() => {
        // Only scroll if user actually changed the upcoming page (not initial load or filter change)
        const pageChanged = upcomingPage !== prevUpcomingPageRef.current;
        if (!loading && upcomingEvents.length > 0 && pageChanged && upcomingEventsRef.current) {
            const yOffset = -100;
            const y = upcomingEventsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        prevUpcomingPageRef.current = upcomingPage;
    }, [loading, upcomingEvents, upcomingPage]);

    // Listen for search events from HeroSection
    useEffect(() => {
        const handleSearchEvent = (event) => {
            const searchQuery = event.detail.query;
            if (searchQuery) {
                setTitleFilter(searchQuery);
            }
        };

        window.addEventListener('searchEvents', handleSearchEvent);

        // Also check session storage on mount
        const storedQuery = sessionStorage.getItem('eventSearchQuery');
        if (storedQuery) {
            setTitleFilter(storedQuery);
            sessionStorage.removeItem('eventSearchQuery');
        }

        return () => {
            window.removeEventListener('searchEvents', handleSearchEvent);
        };
    }, []);

    const fetchEvents = async (sellingPageNum, upcomingPageNum) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                sellingPage: sellingPageNum,
                upcomingPage: upcomingPageNum,
                limit: 3,
            });

            if (titleFilter) params.append('title', titleFilter);
            if (venueFilter) params.append('venue', venueFilter);
            if (categoryFilter && categoryFilter !== 'All Categories') {
                params.append('category', categoryFilter);
            }

            const response = await fetch(
                `http://localhost:3000/events?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();

            if (data.success) {
                setSellingEvents(data.data.selling.events);
                setSellingTotalPages(data.data.selling.pagination.totalPages);
                setUpcomingEvents(data.data.upcoming.events);
                setUpcomingTotalPages(data.data.upcoming.pagination.totalPages);
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

    const handleSellingPageChange = (event, value) => {
        setSellingPage(value);
    };

    const handleUpcomingPageChange = (event, value) => {
        setUpcomingPage(value);
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
    const whyChooseData = [
        {
            id: 1,
            title: 'Easy Event Discovery',
            icon: <SearchIcon />,
            content: 'Browse through thousands of events with our intuitive search and filtering system. Find exactly what you\'re looking for in seconds.',
        },
        {
            id: 2,
            title: 'Secure Registration',
            icon: <SecurityIcon />,
            content: 'Your data is protected with industry-standard encryption. We prioritize your privacy and security in every transaction.',
        },
        {
            id: 3,
            title: 'Fast & Reliable',
            icon: <SpeedIcon />,
            content: 'Experience lightning-fast performance with our optimized platform. Register for events quickly without any hassle.',
        },
        {
            id: 4,
            title: 'Community Driven',
            icon: <GroupsIcon />,
            content: 'Join a vibrant community of event enthusiasts. Connect with like-minded people and discover new experiences together.',
        },
        {
            id: 5,
            title: '24/7 Support',
            icon: <SupportIcon />,
            content: 'Our dedicated support team is always here to help. Get assistance whenever you need it through multiple channels.',
        },
    ];
    return (
        <div>

            {/* New Hero Section */}
            <HeroSection />

            {/* Events Section */}
            {/* Events Section */}
            <Box id="events-section" className="events-section" sx={{ py: { xs: 8, md: 12 } }}>
                <Container maxWidth="xl" sx={{ maxWidth: '1400px !important' }}>
                    <Box sx={{ textAlign: 'center', mb: 7, position: 'relative' }}>
                        <Typography variant="h3" className="section-title" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                            Discover Events
                        </Typography>
                        <Typography variant="body1" className="section-subtitle" sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                            Browse events available now and coming soon
                        </Typography>
                    </Box>

                    {/* Search and Filter Section */}
                    <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e8e8e8', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Search by Title"
                                    variant="outlined"
                                    value={titleFilter}
                                    onChange={(e) => setTitleFilter(e.target.value)}
                                    placeholder="e.g., Tech Conference"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Search by Venue"
                                    variant="outlined"
                                    value={venueFilter}
                                    onChange={(e) => setVenueFilter(e.target.value)}
                                    placeholder="e.g., Mumbai"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Category"
                                    variant="outlined"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    size="small"
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                        {(titleFilter || venueFilter || (categoryFilter && categoryFilter !== 'All Categories')) && (
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setTitleFilter('');
                                        setVenueFilter('');
                                        setCategoryFilter('');
                                    }}
                                    sx={{ borderColor: '#667eea', color: '#667eea' }}
                                >
                                    Clear Filters
                                </Button>
                            </Box>
                        )}
                    </Paper>

                    {/* Loading State */}
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Selling Now Events Section */}
                    <Box sx={{ position: 'relative', minHeight: loading ? '400px' : 'auto' }}>
                        {!error && (
                            <>
                                <Box ref={sellingEventsRef} sx={{ mb: 8, opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                                            Selling Now
                                        </Typography>
                                        <Chip
                                            label={`${sellingEvents.length} events`}
                                            size="small"
                                            sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 600 }}
                                        />
                                    </Box>

                                    {sellingEvents.length > 0 ? (
                                        <>
                                            <Grid container spacing={4} sx={{ alignItems: 'stretch', justifyContent: 'center' }}>
                                                {sellingEvents.map((event) => (
                                                    <Grid item xs={12} sm={10} md={4} lg={4} key={event._id} sx={{ display: 'flex', maxWidth: { xs: '100%', md: '420px' }, minWidth: { md: '420px' } }}>
                                                        <Card className="event-card" sx={{ width: '100%', maxWidth: '100%', position: 'relative' }}>
                                                            <Box sx={{ position: 'relative' }}>
                                                                {event.image ? (
                                                                    <CardMedia
                                                                        component="img"
                                                                        className="event-card-media"
                                                                        image={`http://localhost:3000/${event.image}`}
                                                                        alt={event.title}
                                                                        sx={{
                                                                            height: 200,
                                                                            objectFit: 'cover',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <CardMedia
                                                                        className="event-card-media"
                                                                        sx={{
                                                                            height: 200,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            bgcolor: '#f5f5f5',
                                                                        }}
                                                                    >
                                                                        <EventIcon sx={{ fontSize: 48, color: '#ddd' }} />
                                                                    </CardMedia>
                                                                )}
                                                                <Chip
                                                                    label="Selling Now"
                                                                    size="small"
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: 12,
                                                                        left: 12,
                                                                        bgcolor: '#4CAF50',
                                                                        color: 'white',
                                                                        fontWeight: 600,
                                                                    }}
                                                                />
                                                            </Box>
                                                            <CardContent className="event-card-content">
                                                                <Chip
                                                                    label={event.category}
                                                                    size="small"
                                                                    sx={{
                                                                        mb: 1.5,
                                                                        bgcolor: '#667eea',
                                                                        color: 'white',
                                                                        fontWeight: 500,
                                                                    }}
                                                                />
                                                                <Typography className="event-card-title" variant="h6">
                                                                    {event.title}
                                                                </Typography>
                                                                <Typography className="event-card-description" variant="body2">
                                                                    {event.description?.substring(0, 100)}
                                                                    {event.description?.length > 100 ? '...' : ''}
                                                                </Typography>
                                                                <Box sx={{ mt: 'auto', pt: 2 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                        <CalendarIcon sx={{ fontSize: 18, color: '#666', mr: 1 }} />
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {formatDate(event.startDateTime)} • {formatTime(event.startDateTime)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                        <LocationIcon sx={{ fontSize: 18, color: '#666', mr: 1 }} />
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {event.venue}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            color: '#667eea',
                                                                            fontWeight: 600,
                                                                            mt: 1.5,
                                                                        }}
                                                                    >
                                                                        ₹{event.ticketPrice}
                                                                    </Typography>
                                                                </Box>
                                                            </CardContent>
                                                            <CardActions className="event-card-actions">
                                                                <Button
                                                                    fullWidth
                                                                    variant="contained"
                                                                    className="event-card-button"
                                                                    sx={{
                                                                        bgcolor: '#667eea',
                                                                        '&:hover': { bgcolor: '#5568d3' },
                                                                    }}
                                                                    onClick={() => window.location.href = `/events/${event._id}`}
                                                                >
                                                                    Book Now
                                                                </Button>
                                                            </CardActions>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            {/* Selling Events Pagination */}
                                            {sellingTotalPages > 1 && (
                                                <Box className="pagination-container">
                                                    <Pagination
                                                        count={sellingTotalPages}
                                                        page={sellingPage}
                                                        onChange={handleSellingPageChange}
                                                        color="primary"
                                                        size="large"
                                                        sx={{
                                                            '& .MuiPaginationItem-root': {
                                                                color: '#667eea',
                                                            },
                                                            '& .Mui-selected': {
                                                                bgcolor: '#667eea !important',
                                                                color: 'white',
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No events selling tickets at the moment
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Coming Soon Events Section */}
                                <Box ref={upcomingEventsRef} sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                                            Coming Soon
                                        </Typography>
                                        <Chip
                                            label={`${upcomingEvents.length} events`}
                                            size="small"
                                            sx={{ bgcolor: '#FF9800', color: 'white', fontWeight: 600 }}
                                        />
                                    </Box>

                                    {upcomingEvents.length > 0 ? (
                                        <>
                                            <Grid container spacing={4} sx={{ alignItems: 'stretch', justifyContent: 'center' }}>
                                                {upcomingEvents.map((event) => (
                                                    <Grid item xs={12} sm={10} md={4} lg={4} key={event._id} sx={{ display: 'flex', maxWidth: { xs: '100%', md: '420px' }, minWidth: { md: '420px' } }}>
                                                        <Card className="event-card" sx={{ width: '100%', maxWidth: '100%', position: 'relative' }}>
                                                            <Box sx={{ position: 'relative' }}>
                                                                {event.image ? (
                                                                    <CardMedia
                                                                        component="img"
                                                                        className="event-card-media"
                                                                        image={`http://localhost:3000/${event.image}`}
                                                                        alt={event.title}
                                                                        sx={{
                                                                            height: 200,
                                                                            objectFit: 'cover',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <CardMedia
                                                                        className="event-card-media"
                                                                        sx={{
                                                                            height: 200,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            bgcolor: '#f5f5f5',
                                                                        }}
                                                                    >
                                                                        <EventIcon sx={{ fontSize: 48, color: '#ddd' }} />
                                                                    </CardMedia>
                                                                )}
                                                                <Chip
                                                                    label="Coming Soon"
                                                                    size="small"
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: 12,
                                                                        left: 12,
                                                                        bgcolor: '#FF9800',
                                                                        color: 'white',
                                                                        fontWeight: 600,
                                                                    }}
                                                                />
                                                            </Box>
                                                            <CardContent className="event-card-content">
                                                                <Chip
                                                                    label={event.category}
                                                                    size="small"
                                                                    sx={{
                                                                        mb: 1.5,
                                                                        bgcolor: '#667eea',
                                                                        color: 'white',
                                                                        fontWeight: 500,
                                                                    }}
                                                                />
                                                                <Typography className="event-card-title" variant="h6">
                                                                    {event.title}
                                                                </Typography>
                                                                <Typography className="event-card-description" variant="body2">
                                                                    {event.description?.substring(0, 100)}
                                                                    {event.description?.length > 100 ? '...' : ''}
                                                                </Typography>
                                                                <Box sx={{ mt: 'auto', pt: 2 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                        <CalendarIcon sx={{ fontSize: 18, color: '#666', mr: 1 }} />
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {formatDate(event.startDateTime)} • {formatTime(event.startDateTime)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                        <LocationIcon sx={{ fontSize: 18, color: '#666', mr: 1 }} />
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {event.venue}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            color: '#667eea',
                                                                            fontWeight: 600,
                                                                            mt: 1.5,
                                                                        }}
                                                                    >
                                                                        ₹{event.ticketPrice}
                                                                    </Typography>
                                                                </Box>
                                                            </CardContent>
                                                            <CardActions className="event-card-actions">
                                                                <Button
                                                                    fullWidth
                                                                    variant="contained"
                                                                    className="event-card-button"
                                                                    sx={{
                                                                        bgcolor: '#667eea',
                                                                        '&:hover': { bgcolor: '#5568d3' },
                                                                    }}
                                                                    onClick={() => window.location.href = `/events/${event._id}`}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </CardActions>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            {/* Upcoming Events Pagination */}
                                            {upcomingTotalPages > 1 && (
                                                <Box className="pagination-container">
                                                    <Pagination
                                                        count={upcomingTotalPages}
                                                        page={upcomingPage}
                                                        onChange={handleUpcomingPageChange}
                                                        color="primary"
                                                        size="large"
                                                        sx={{
                                                            '& .MuiPaginationItem-root': {
                                                                color: '#667eea',
                                                            },
                                                            '& .Mui-selected': {
                                                                bgcolor: '#667eea !important',
                                                                color: 'white',
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No upcoming events at the moment
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Why Choose Us Section */}
            <Box className="why-choose-section" sx={{ py: { xs: 8, md: 12 } }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 7, position: 'relative' }}>
                        <Typography variant="h3" className="section-title" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                            Why Choose Our Platform?
                        </Typography>
                        <Typography variant="body1" className="section-subtitle" sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                            Discover what makes us the best choice for event management
                        </Typography>
                    </Box>

                    <Box>
                        {whyChooseData.map((item) => (
                            <Accordion key={item.id} className="accordion-item">
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    className="accordion-summary"
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box className="accordion-icon">{item.icon}</Box>
                                        <Typography className="accordion-title">{item.title}</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails className="accordion-details">
                                    <Typography>{item.content}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </Container>
            </Box>
        </div>
    );
}

export default Home;