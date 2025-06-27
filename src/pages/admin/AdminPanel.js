import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AdminPanel = () => {
    return (
        <Container className="py-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <h3>Admin Panel</h3>
                            <p className="text-muted">
                                This page will provide comprehensive administrative controls for managing the platform.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPanel;
