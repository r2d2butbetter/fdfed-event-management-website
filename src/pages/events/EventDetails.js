import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const EventDetails = () => {
    return (
        <Container className="py-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <h3>Event Details</h3>
                            <p className="text-muted">
                                This page will show detailed information about a specific event with booking functionality.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EventDetails;
