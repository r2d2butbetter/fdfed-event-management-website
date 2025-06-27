import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../../store/slices/eventsSlice';
import { fetchEventBookings } from '../../store/slices/bookingsSlice';

const OrganizerDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { events, isLoading: eventsLoading } = useSelector(state => state.events);
    const { eventBookings, isLoading: bookingsLoading } = useSelector(state => state.bookings);

    // Filter events by current organizer
    const myEvents = events.filter(event => event.organizer === user?._id);

    useEffect(() => {
        // Fetch organizer's events
        dispatch(fetchEvents());
    }, [dispatch]);

    const getEventStatus = (event) => {
        const now = new Date();
        const eventDate = new Date(event.date);

        if (eventDate < now) {
            return { text: 'Completed', variant: 'secondary' };
        } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
            return { text: 'Tomorrow', variant: 'warning' };
        } else {
            return { text: 'Upcoming', variant: 'success' };
        }
    };

    const stats = [
        {
            title: 'My Events',
            value: myEvents.length,
            icon: 'bi-calendar-event',
            color: 'primary'
        },
        {
            title: 'Total Bookings',
            value: eventBookings.length,
            icon: 'bi-ticket-perforated',
            color: 'success'
        },
        {
            title: 'Upcoming Events',
            value: myEvents.filter(e => new Date(e.date) > new Date()).length,
            icon: 'bi-calendar-plus',
            color: 'info'
        },
        {
            title: 'Revenue',
            value: `$${myEvents.reduce((sum, event) => sum + (event.price * (eventBookings.filter(b => b.event === event._id).length || 0)), 0)}`,
            icon: 'bi-currency-dollar',
            color: 'warning'
        }
    ];

    return (
        <div className="organizer-dashboard">
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
                {/* My Events */}
                <Col lg={8}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">My Events</h5>
                            <Button as={Link} to="/create-event" size="sm" variant="primary">
                                Create New Event
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {eventsLoading ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : myEvents.length > 0 ? (
                                <Table responsive hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Event</th>
                                            <th>Date</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myEvents.slice(0, 5).map(event => {
                                            const status = getEventStatus(event);
                                            return (
                                                <tr key={event._id}>
                                                    <td>
                                                        <div>
                                                            <h6 className="mb-1">{event.title}</h6>
                                                            <small className="text-muted">{event.category}</small>
                                                        </div>
                                                    </td>
                                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                                    <td>${event.price}</td>
                                                    <td>
                                                        <Badge bg={status.variant}>{status.text}</Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button
                                                                as={Link}
                                                                to={`/events/${event._id}`}
                                                                size="sm"
                                                                variant="outline-primary"
                                                            >
                                                                View
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-secondary"
                                                                onClick={() => dispatch(fetchEventBookings(event._id))}
                                                            >
                                                                Bookings
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="text-center p-4">
                                    <i className="bi bi-calendar-x display-4 text-muted mb-3"></i>
                                    <h5>No Events Yet</h5>
                                    <p className="text-muted mb-3">
                                        Start by creating your first event to engage with your audience.
                                    </p>
                                    <Button as={Link} to="/create-event" variant="primary">
                                        Create Your First Event
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Quick Actions */}
                <Col lg={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Quick Actions</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                <Button as={Link} to="/create-event" variant="primary">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Create New Event
                                </Button>
                                <Button variant="outline-primary">
                                    <i className="bi bi-graph-up me-2"></i>
                                    View Analytics
                                </Button>
                                <Button variant="outline-secondary">
                                    <i className="bi bi-people me-2"></i>
                                    Manage Attendees
                                </Button>
                                <Button variant="outline-info">
                                    <i className="bi bi-megaphone me-2"></i>
                                    Promote Events
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Recent Bookings */}
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Recent Bookings</h5>
                        </Card.Header>
                        <Card.Body>
                            {bookingsLoading ? (
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : eventBookings.length > 0 ? (
                                <div>
                                    {eventBookings.slice(0, 5).map(booking => (
                                        <div key={booking._id} className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h6 className="mb-1">Customer Booking</h6>
                                                <small className="text-muted">
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <Badge bg="success">${booking.amount}</Badge>
                                        </div>
                                    ))}
                                    <Button variant="outline-primary" size="sm" className="w-100">
                                        View All Bookings
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <i className="bi bi-ticket-perforated display-6 text-muted mb-2"></i>
                                    <p className="text-muted mb-0">No bookings yet</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OrganizerDashboard;
