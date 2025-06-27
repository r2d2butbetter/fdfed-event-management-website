import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Profile = () => {
    return (
        <Container className="py-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Body className="text-center py-5">
                            <h3>User Profile</h3>
                            <p className="text-muted">
                                This page will allow users to view and edit their profile information.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
