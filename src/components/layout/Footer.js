import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-light py-4 mt-auto">
            <Container>
                <Row>
                    <Col md={6}>
                        <h5 className="fw-bold mb-3">EventHub</h5>
                        <p className="text-muted">
                            Your premier destination for discovering and managing amazing events.
                            Built with modern web technologies including React, Redux, and Bootstrap.
                        </p>
                    </Col>
                    <Col md={3}>
                        <h6 className="fw-bold mb-3">Quick Links</h6>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-muted text-decoration-none">Home</a></li>
                            <li><a href="/events" className="text-muted text-decoration-none">Events</a></li>
                            <li><a href="/about" className="text-muted text-decoration-none">About</a></li>
                            <li><a href="/contact" className="text-muted text-decoration-none">Contact</a></li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h6 className="fw-bold mb-3">Support</h6>
                        <ul className="list-unstyled">
                            <li><a href="/help" className="text-muted text-decoration-none">Help Center</a></li>
                            <li><a href="/terms" className="text-muted text-decoration-none">Terms of Service</a></li>
                            <li><a href="/privacy" className="text-muted text-decoration-none">Privacy Policy</a></li>
                            <li><a href="/faq" className="text-muted text-decoration-none">FAQ</a></li>
                        </ul>
                    </Col>
                </Row>
                <hr className="my-4" />
                <Row>
                    <Col md={6}>
                        <p className="text-muted mb-0">
                            &copy; {currentYear} EventHub. All rights reserved.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <div className="d-inline-flex gap-3">
                            <a href="#" className="text-muted">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="text-muted">
                                <i className="bi bi-twitter"></i>
                            </a>
                            <a href="#" className="text-muted">
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="#" className="text-muted">
                                <i className="bi bi-linkedin"></i>
                            </a>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
