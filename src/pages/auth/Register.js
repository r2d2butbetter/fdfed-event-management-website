import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        agreeToTerms: false,
    });
    const [validated, setValidated] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        // Clear any previous errors when component mounts
        dispatch(clearError());

        // Redirect if already authenticated
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [dispatch, isAuthenticated, navigate]);

    // Advanced JavaScript: Real-time password validation
    useEffect(() => {
        setPasswordsMatch(
            formData.password === formData.confirmPassword || formData.confirmPassword === ''
        );
    }, [formData.password, formData.confirmPassword]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Dynamic validation feedback
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

        if (form.checkValidity() && passwordsMatch && formData.agreeToTerms) {
            try {
                const userData = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                };

                const resultAction = await dispatch(registerUser(userData));

                if (registerUser.fulfilled.match(resultAction)) {
                    navigate('/dashboard', { replace: true });
                }
            } catch (error) {
                console.error('Registration failed:', error);
            }
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={7} lg={6}>
                    <Card className="shadow">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Create Account</h2>
                                <p className="text-muted">Join our event management platform</p>
                            </div>

                            {error && (
                                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                                    {error}
                                </Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter your full name"
                                                minLength={2}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please provide your full name (at least 2 characters).
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Account Type</Form.Label>
                                            <Form.Select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="organizer">Event Organizer</option>
                                            </Form.Select>
                                            <Form.Text className="text-muted">
                                                Choose your account type based on your needs.
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

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

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Create a password"
                                                minLength={6}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Password must be at least 6 characters long.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Confirm your password"
                                                className={!passwordsMatch ? 'is-invalid' : ''}
                                                required
                                            />
                                            {!passwordsMatch && (
                                                <div className="invalid-feedback">
                                                    Passwords do not match.
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onChange={handleInputChange}
                                        label={
                                            <>
                                                I agree to the{' '}
                                                <Link to="/terms" target="_blank" className="text-decoration-none">
                                                    Terms of Service
                                                </Link>{' '}
                                                and{' '}
                                                <Link to="/privacy" target="_blank" className="text-decoration-none">
                                                    Privacy Policy
                                                </Link>
                                            </>
                                        }
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        You must agree to the terms and conditions.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-100 mb-3"
                                    disabled={isLoading || !passwordsMatch || !formData.agreeToTerms}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </Form>

                            <hr />

                            <div className="text-center">
                                <span className="text-muted">Already have an account? </span>
                                <Link to="/login" className="text-decoration-none">
                                    Sign in here
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
