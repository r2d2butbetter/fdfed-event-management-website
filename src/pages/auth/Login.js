import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [validated, setValidated] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

    // Get redirect path from location state
    const from = location.state?.from?.pathname || '/dashboard';

    useEffect(() => {
        // Clear any previous errors when component mounts
        dispatch(clearError());

        // Redirect if already authenticated
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [dispatch, isAuthenticated, navigate, from]);

    // Advanced JavaScript: Event handling with validation
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Real-time validation feedback
        if (e.target.checkValidity()) {
            e.target.classList.remove('is-invalid');
            e.target.classList.add('is-valid');
        } else {
            e.target.classList.remove('is-valid');
            e.target.classList.add('is-invalid');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        setValidated(true);

        if (form.checkValidity()) {
            try {
                const resultAction = await dispatch(loginUser({
                    email: formData.email,
                    password: formData.password,
                }));

                if (loginUser.fulfilled.match(resultAction)) {
                    // Store remember me preference
                    if (formData.rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }

                    navigate(from, { replace: true });
                }
            } catch (error) {
                console.error('Login failed:', error);
            }
        }
    };

    // Demo login function for testing
    const handleDemoLogin = (role) => {
        const demoCredentials = {
            admin: { email: 'admin@example.com', password: 'password' },
            organizer: { email: 'jane@example.com', password: 'password' },
            customer: { email: 'john@example.com', password: 'password' },
        };

        const credentials = demoCredentials[role];
        setFormData(prev => ({
            ...prev,
            email: credentials.email,
            password: credentials.password,
        }));

        // Auto-submit after a brief delay
        setTimeout(() => {
            dispatch(loginUser(credentials));
        }, 500);
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <Card className="shadow">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Welcome Back</h2>
                                <p className="text-muted">Sign in to your account</p>
                            </div>

                            {error && (
                                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                                    {error}
                                </Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid email address.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        minLength={6}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Password must be at least 6 characters long.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        label="Remember me"
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-100 mb-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </Form>

                            <div className="text-center mb-3">
                                <Link to="/forgot-password" className="text-decoration-none">
                                    Forgot your password?
                                </Link>
                            </div>

                            <hr />

                            <div className="text-center mb-3">
                                <small className="text-muted">Demo Accounts (for testing):</small>
                            </div>

                            <div className="d-grid gap-2">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDemoLogin('admin')}
                                    disabled={isLoading}
                                >
                                    Demo Admin Login
                                </Button>
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => handleDemoLogin('organizer')}
                                    disabled={isLoading}
                                >
                                    Demo Organizer Login
                                </Button>
                                <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => handleDemoLogin('customer')}
                                    disabled={isLoading}
                                >
                                    Demo Customer Login
                                </Button>
                            </div>

                            <hr />

                            <div className="text-center">
                                <span className="text-muted">Don't have an account? </span>
                                <Link to="/register" className="text-decoration-none">
                                    Sign up here
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
