import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/images/hero_img2.png';

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        // Scroll to events section on the same page
        const eventsSection = document.getElementById('events-section');
        if (eventsSection) {
            eventsSection.scrollIntoView({ behavior: 'smooth' });
        }
        // You can also use the searchQuery to filter events if needed
    };
    return (
        <Box sx={{ bgcolor: '#fafafa', minHeight: { lg: '100vh' }, display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative', py: { xs: 6, sm: 8, lg: 0 } }}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 }, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center">
                    <Grid item xs={12} lg={6}>
                        <Box sx={{ textAlign: { xs: 'center', lg: 'left' }, maxWidth: { lg: '90%' } }}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.25rem', sm: '3rem', lg: '3.75rem' },
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    color: '#1a1a1a',
                                    mb: 2
                                }}
                            >
                                Discover Amazing Events Near You
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: { xs: '1rem', sm: '1.125rem' },
                                    color: '#666',
                                    mt: { xs: 1, sm: 2 },
                                    mb: { xs: 4, sm: 4 }
                                }}
                            >
                                Join thousands of exciting events happening around you. From concerts to conferences, workshops to festivals - find your next unforgettable experience.
                            </Typography>

                            <Box
                                component="form"
                                onSubmit={handleSearch}
                                sx={{
                                    mt: { xs: 4, sm: 5 },
                                    mb: { xs: 5, sm: 6 }
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        maxWidth: { xs: '100%', sm: '500px' },
                                        mx: { xs: 'auto', lg: 0 }
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        placeholder="Search for events..."
                                        variant="outlined"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'white',
                                                borderRadius: 1,
                                                '& fieldset': {
                                                    borderColor: '#e8e8e8'
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#1a1a1a'
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#1a1a1a'
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#1a1a1a',
                                            color: 'white',
                                            px: 3,
                                            py: 1,
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: 1,
                                            whiteSpace: 'nowrap',
                                            '&:hover': {
                                                bgcolor: '#333'
                                            }
                                        }}
                                    >
                                        Search
                                    </Button>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: { xs: 'center', lg: 'flex-start' },
                                    gap: { xs: 3, sm: 4 },
                                    mt: { xs: 5, sm: 6 }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontSize: { xs: '2rem', sm: '2.5rem' },
                                            fontWeight: 500,
                                            color: '#1a1a1a'
                                        }}
                                    >
                                        5000+
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            ml: 1.5,
                                            fontSize: '0.875rem',
                                            color: '#1a1a1a',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        Events<br />Hosted
                                    </Typography>
                                </Box>

                                <Divider
                                    orientation="vertical"
                                    flexItem
                                    sx={{
                                        display: { xs: 'none', sm: 'block' },
                                        borderColor: '#ccc',
                                        height: 40,
                                        alignSelf: 'center'
                                    }}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontSize: { xs: '2rem', sm: '2.5rem' },
                                            fontWeight: 500,
                                            color: '#1a1a1a'
                                        }}
                                    >
                                        100K+
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            ml: 1.5,
                                            fontSize: '0.875rem',
                                            color: '#1a1a1a',
                                            lineHeight: 1.4
                                        }}
                                    >
                                        Happy<br />Attendees
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} lg={6} sx={{ display: { xs: 'flex', lg: 'block' }, justifyContent: 'center' }}>
                        <Box
                            component="img"
                            src={heroImage}
                            alt="Event Management Illustration"
                            sx={{
                                display: { xs: 'block', lg: 'none' },
                                width: '100%',
                                maxWidth: '500px',
                                height: 'auto',
                                borderRadius: 3
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>

            {/* Desktop Image - Bleeds out on right */}
            <Box
                component="img"
                src={heroImage}
                alt="Event Management Illustration"
                sx={{
                    display: { xs: 'none', lg: 'block' },
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '90vh',
                    width: 'auto',
                    maxWidth: '55%',
                    objectFit: 'cover',
                    borderTopLeftRadius: 32,
                    borderBottomLeftRadius: 32,
                    zIndex: 0
                }}
            />
        </Box>
    );
};

export default HeroSection;
