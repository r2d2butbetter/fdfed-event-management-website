import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const CreateEvent = () => {
    return (
        <Container className="py-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <h3>Create Event</h3>
                            <p className="text-muted">
                                This page will contain a comprehensive form for event organizers to create new events.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateEvent;
