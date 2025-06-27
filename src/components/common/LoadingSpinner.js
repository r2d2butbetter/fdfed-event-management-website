import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'lg', text = 'Loading...' }) => {
    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Row>
                <Col className="text-center">
                    <Spinner animation="border" variant="primary" size={size} />
                    {text && (
                        <div className="mt-3">
                            <p className="text-muted">{text}</p>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default LoadingSpinner;
