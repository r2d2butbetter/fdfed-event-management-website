import React, { useState, useEffect } from 'react';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const Navbar = () => {
    const [expanded, setExpanded] = useState(false);
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Close navbar on route change (mobile)
    useEffect(() => {
        setExpanded(false);
    }, [location]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getUserDisplayName = () => {
        if (!user) return '';
        return user.name.split(' ')[0]; // Show first name
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'danger';
            case 'organizer': return 'warning';
            case 'customer': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <BSNavbar
            expand="lg"
            bg="white"
            variant="light"
            sticky="top"
            className="shadow-sm"
            expanded={expanded}
            onToggle={setExpanded}
        >
            <Container>
                <BSNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
                    <i className="bi bi-calendar-event me-2"></i>
                    EventHub
                </BSNavbar.Brand>

                <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

                <BSNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/events">
                            Events
                        </Nav.Link>
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={Link} to="/dashboard">
                                    Dashboard
                                </Nav.Link>
                                {user?.role === 'organizer' && (
                                    <Nav.Link as={Link} to="/create-event">
                                        Create Event
                                    </Nav.Link>
                                )}
                                {user?.role === 'admin' && (
                                    <Nav.Link as={Link} to="/admin">
                                        Admin Panel
                                    </Nav.Link>
                                )}
                            </>
                        )}
                    </Nav>

                    <Nav className="ms-auto">
                        {isAuthenticated ? (
                            <NavDropdown
                                title={
                                    <span>
                                        <i className="bi bi-person-circle me-1"></i>
                                        {getUserDisplayName()}
                                        <span className={`badge bg-${getRoleColor(user?.role)} ms-2`}>
                                            {user?.role}
                                        </span>
                                    </span>
                                }
                                id="user-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/profile">
                                    <i className="bi bi-person me-2"></i>
                                    Profile
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/dashboard">
                                    <i className="bi bi-speedometer2 me-2"></i>
                                    Dashboard
                                </NavDropdown.Item>
                                {user?.role === 'customer' && (
                                    <NavDropdown.Item as={Link} to="/my-bookings">
                                        <i className="bi bi-ticket-perforated me-2"></i>
                                        My Bookings
                                    </NavDropdown.Item>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <div className="d-flex gap-2">
                                <Button
                                    as={Link}
                                    to="/login"
                                    variant="outline-primary"
                                    size="sm"
                                >
                                    Login
                                </Button>
                                <Button
                                    as={Link}
                                    to="/register"
                                    variant="primary"
                                    size="sm"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </Nav>
                </BSNavbar.Collapse>
            </Container>
        </BSNavbar>
    );
};

export default Navbar;
