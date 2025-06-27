import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const EventList = () => {
    return (
        <Container className="py-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <h3>Events List</h3>
                            <p className="text-muted">
                                This page will display all available events with filtering and search functionality.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EventList;
