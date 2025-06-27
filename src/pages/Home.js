import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchEvents } from '../store/slices/eventsSlice';

const Home = () => {
    const dispatch = useDispatch();
    const { events, isLoading } = useSelector(state => state.events);
    const { isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        // Fetch featured events on component mount
        dispatch(fetchEvents({ limit: 6 }));
    }, [dispatch]);

    // Dynamic DOM manipulation example
    useEffect(() => {
        document.title = 'Event Management System - Home';

        // Add custom class to body for home page styling
        document.body.classList.add('home-page');

        return () => {
            document.body.classList.remove('home-page');
        };
    }, []);

    const handleExploreEvents = () => {
        // Demonstrate browser API usage
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }

        // Smooth scroll to events section
        const eventsSection = document.getElementById('featured-events');
        if (eventsSection) {
            eventsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section bg-primary text-white py-5 mb-5">
                <Container>
                    <Row className="align-items-center min-vh-50">
                        <Col lg={6}>
                            <h1 className="display-4 fw-bold mb-4">
                                Discover Amazing Events
                            </h1>
                            <p className="lead mb-4">
                                Join thousands of event enthusiasts and discover the best events
                                in your area. From conferences to concerts, find your perfect experience.
                            </p>
                            <div className="d-flex gap-3">
                                <Button
                                    size="lg"
                                    variant="light"
                                    onClick={handleExploreEvents}
                                >
                                    Explore Events
                                </Button>
                                {!isAuthenticated && (
                                    <Button
                                        as={Link}
                                        to="/register"
                                        size="lg"
                                        variant="outline-light"
                                    >
                                        Get Started
                                    </Button>
                                )}
                            </div>
                        </Col>
                        <Col lg={6} className="text-center">
                            <img
                                src="https://picsum.photos/500/400?random=hero"
                                alt="Event Hero"
                                className="img-fluid rounded shadow"
                            />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-section py-5 mb-5">
                <Container>
                    <Row>
                        <Col className="text-center mb-5">
                            <h2 className="display-6 fw-bold">Why Choose Our Platform?</h2>
                            <p className="lead text-muted">
                                Experience the future of event management
                            </p>
                        </Col>
                    </Row>
                    <Row className="g-4">
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="text-center p-4">
                                    <div className="mb-3">
                                        <i className="bi bi-calendar-event display-4 text-primary"></i>
                                    </div>
                                    <h5>Easy Event Discovery</h5>
                                    <p className="text-muted">
                                        Find events that match your interests with our advanced search and filtering system.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="text-center p-4">
                                    <div className="mb-3">
                                        <i className="bi bi-ticket-perforated display-4 text-success"></i>
                                    </div>
                                    <h5>Seamless Booking</h5>
                                    <p className="text-muted">
                                        Book tickets instantly with our secure payment system and digital ticket delivery.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="text-center p-4">
                                    <div className="mb-3">
                                        <i className="bi bi-people display-4 text-info"></i>
                                    </div>
                                    <h5>Event Management</h5>
                                    <p className="text-muted">
                                        Organize your own events with our comprehensive management tools.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Featured Events Section */}
            <section id="featured-events" className="featured-events-section py-5 bg-light">
                <Container>
                    <Row>
                        <Col className="text-center mb-5">
                            <h2 className="display-6 fw-bold">Featured Events</h2>
                            <p className="lead text-muted">
                                Don't miss out on these amazing upcoming events
                            </p>
                        </Col>
                    </Row>
                    <Row className="g-4">
                        {isLoading ? (
                            <Col className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </Col>
                        ) : (
                            events.slice(0, 3).map(event => (
                                <Col md={4} key={event._id}>
                                    <Card className="h-100 shadow-sm">
                                        <Card.Img
                                            variant="top"
                                            src={event.imageUrl}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title>{event.title}</Card.Title>
                                            <Card.Text className="text-muted flex-grow-1">
                                                {event.description.substring(0, 100)}...
                                            </Card.Text>
                                            <div className="mt-auto">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="text-muted">
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </small>
                                                    <span className="badge bg-primary">
                                                        ${event.price}
                                                    </span>
                                                </div>
                                                <Button
                                                    as={Link}
                                                    to={`/events/${event._id}`}
                                                    variant="outline-primary"
                                                    className="w-100"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                    <Row className="mt-4">
                        <Col className="text-center">
                            <Button
                                as={Link}
                                to="/events"
                                size="lg"
                                variant="primary"
                            >
                                View All Events
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="cta-section py-5">
                    <Container>
                        <Row>
                            <Col className="text-center">
                                <h2 className="display-6 fw-bold mb-4">Ready to Get Started?</h2>
                                <p className="lead mb-4">
                                    Join our community and start discovering amazing events today.
                                </p>
                                <div className="d-flex gap-3 justify-content-center">
                                    <Button
                                        as={Link}
                                        to="/register"
                                        size="lg"
                                        variant="primary"
                                    >
                                        Sign Up Now
                                    </Button>
                                    <Button
                                        as={Link}
                                        to="/login"
                                        size="lg"
                                        variant="outline-primary"
                                    >
                                        Login
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>
            )}
        </div>
    );
};

export default Home;
