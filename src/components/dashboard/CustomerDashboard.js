import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../../store/slices/eventsSlice';
import { fetchUserBookings } from '../../store/slices/bookingsSlice';

const CustomerDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { events, isLoading: eventsLoading } = useSelector(state => state.events);
    const { userBookings, bookingStats, isLoading: bookingsLoading } = useSelector(state => state.bookings);

    useEffect(() => {
        // Fetch user's bookings and featured events
        if (user?._id) {
            dispatch(fetchUserBookings(user._id));
        }
        dispatch(fetchEvents({ limit: 6 }));
    }, [dispatch, user]);

    const getBookingStatus = (booking) => {
        if (booking.status === 'confirmed') {
            return { text: 'Confirmed', variant: 'success' };
        } else if (booking.status === 'pending') {
            return { text: 'Pending', variant: 'warning' };
        } else {
            return { text: 'Cancelled', variant: 'danger' };
        }
    };

    const stats = [
        {
            title: 'Total Bookings',
            value: bookingStats.totalBookings || 0,
            icon: 'bi-ticket-perforated',
            color: 'primary'
        },
        {
            title: 'Confirmed',
            value: bookingStats.confirmedBookings || 0,
            icon: 'bi-check-circle',
            color: 'success'
        },
        {
            title: 'Pending',
            value: bookingStats.pendingBookings || 0,
            icon: 'bi-clock',
            color: 'warning'
        },
        {
            title: 'Cancelled',
            value: bookingStats.cancelledBookings || 0,
            icon: 'bi-x-circle',
            color: 'danger'
        }
    ];

    return (
        <div className="customer-dashboard">
            {/* Statistics Cards */}
            <Row className="mb-4">
                {stats.map((stat, index) => (
                    <Col lg={3} md={6} key={index}>
                        <Card className="dashboard-card h-100">
                            <Card.Body className="text-center">
                                <div className={`text-${stat.color} mb-2`}>
                                    <i className={`${stat.icon} display-4`}></i>
                                </div>
                                <h3 className="fw-bold">{stat.value}</h3>
                                <p className="text-muted mb-0">{stat.title}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                {/* My Bookings */}
                <Col lg={8}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">My Bookings</h5>
                            <Button as={Link} to="/events" size="sm" variant="primary">
                                Browse Events
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {bookingsLoading ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : userBookings.length > 0 ? (
                                <div>
                                    {userBookings.slice(0, 5).map(booking => {
                                        const status = getBookingStatus(booking);
                                        return (
                                            <Card key={booking._id} className="mb-3 border-start border-3 border-primary">
                                                <Card.Body>
                                                    <Row className="align-items-center">
                                                        <Col md={6}>
                                                            <h6 className="mb-1">{booking.eventTitle || 'Event Title'}</h6>
                                                            <p className="text-muted mb-1">
                                                                <i className="bi bi-calendar me-1"></i>
                                                                {new Date(booking.eventDate).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-muted mb-0">
                                                                <i className="bi bi-geo-alt me-1"></i>
                                                                {booking.eventLocation || 'Event Location'}
                                                            </p>
                                                        </Col>
                                                        <Col md={3} className="text-center">
                                                            <Badge bg={status.variant} className="mb-2">
                                                                {status.text}
                                                            </Badge>
                                                            <p className="mb-0 fw-bold">${booking.amount}</p>
                                                        </Col>
                                                        <Col md={3} className="text-end">
                                                            <div className="d-flex flex-column gap-2">
                                                                <Button size="sm" variant="outline-primary">
                                                                    View Details
                                                                </Button>
                                                                {booking.status === 'confirmed' && (
                                                                    <Button size="sm" variant="outline-secondary">
                                                                        Download Ticket
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        );
                                    })}
                                    <div className="text-center">
                                        <Button variant="outline-primary">
                                            View All Bookings
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <i className="bi bi-ticket-perforated display-4 text-muted mb-3"></i>
                                    <h5>No Bookings Yet</h5>
                                    <p className="text-muted mb-3">
                                        Discover amazing events and start booking your experiences.
                                    </p>
                                    <Button as={Link} to="/events" variant="primary">
                                        Browse Events
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recommended Events */}
                <Col lg={4}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Recommended Events</h5>
                        </Card.Header>
                        <Card.Body>
                            {eventsLoading ? (
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {events.slice(0, 3).map(event => (
                                        <Card key={event._id} className="mb-3 border-0 bg-light">
                                            <Card.Body className="p-3">
                                                <h6 className="mb-1">{event.title}</h6>
                                                <p className="text-muted small mb-2">
                                                    {new Date(event.date).toLocaleDateString()}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <Badge bg="primary">${event.price}</Badge>
                                                    <Button
                                                        as={Link}
                                                        to={`/events/${event._id}`}
                                                        size="sm"
                                                        variant="outline-primary"
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    <Button
                                        as={Link}
                                        to="/events"
                                        variant="outline-primary"
                                        size="sm"
                                        className="w-100"
                                    >
                                        View All Events
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="mt-4">
                        <Card.Header>
                            <h5 className="mb-0">Quick Actions</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button as={Link} to="/events" variant="primary">
                                    <i className="bi bi-search me-2"></i>
                                    Find Events
                                </Button>
                                <Button variant="outline-primary">
                                    <i className="bi bi-heart me-2"></i>
                                    My Favorites
                                </Button>
                                <Button variant="outline-secondary">
                                    <i className="bi bi-person me-2"></i>
                                    Update Profile
                                </Button>
                                <Button variant="outline-info">
                                    <i className="bi bi-bell me-2"></i>
                                    Notifications
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CustomerDashboard;
