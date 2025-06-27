import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Dashboard components for different user roles
import AdminDashboard from '../components/dashboard/AdminDashboard';
import OrganizerDashboard from '../components/dashboard/OrganizerDashboard';
import CustomerDashboard from '../components/dashboard/CustomerDashboard';

const Dashboard = () => {
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        // Dynamic title based on user role
        document.title = `Dashboard - ${user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}`;
    }, [user]);

    const renderDashboardContent = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'organizer':
                return <OrganizerDashboard />;
            case 'customer':
                return <CustomerDashboard />;
            default:
                return (
                    <Card>
                        <Card.Body className="text-center py-5">
                            <h5>Invalid User Role</h5>
                            <p className="text-muted">
                                Your account role is not recognized. Please contact support.
                            </p>
                            <Button as={Link} to="/" variant="primary">
                                Go Home
                            </Button>
                        </Card.Body>
                    </Card>
                );
        }
    };

    return (
        <Container fluid className="py-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-1">
                                Welcome back, {user?.name}!
                            </h2>
                            <p className="text-muted mb-0">
                                {user?.role === 'admin' && 'Manage your platform from here'}
                                {user?.role === 'organizer' && 'Manage your events and bookings'}
                                {user?.role === 'customer' && 'Discover and manage your event bookings'}
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            {user?.role === 'organizer' && (
                                <Button as={Link} to="/create-event" variant="primary">
                                    Create Event
                                </Button>
                            )}
                            <Button as={Link} to="/profile" variant="outline-primary">
                                Profile
                            </Button>
                        </div>
                    </div>

                    {renderDashboardContent()}
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
