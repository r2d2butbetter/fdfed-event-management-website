import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole, deleteUser } from '../../store/slices/usersSlice';
import { fetchEvents } from '../../store/slices/eventsSlice';

const AdminDashboard = () => {
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    const dispatch = useDispatch();
    const { users, isLoading: usersLoading } = useSelector(state => state.users);
    const { events, isLoading: eventsLoading } = useSelector(state => state.events);

    useEffect(() => {
        // Fetch initial data
        dispatch(fetchUsers({ limit: 10 }));
        dispatch(fetchEvents({ limit: 10 }));
    }, [dispatch]);

    const handleUpdateRole = async () => {
        if (selectedUser && newRole) {
            await dispatch(updateUserRole({ userId: selectedUser._id, role: newRole }));
            setShowUserModal(false);
            setSelectedUser(null);
            setNewRole('');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await dispatch(deleteUser(userId));
        }
    };

    const getUserRoleBadge = (role) => {
        const variants = {
            admin: 'danger',
            organizer: 'warning',
            customer: 'info'
        };
        return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
    };

    const stats = [
        {
            title: 'Total Users',
            value: users.length,
            icon: 'bi-people',
            color: 'primary'
        },
        {
            title: 'Total Events',
            value: events.length,
            icon: 'bi-calendar-event',
            color: 'success'
        },
        {
            title: 'Active Organizers',
            value: users.filter(u => u.role === 'organizer').length,
            icon: 'bi-person-badge',
            color: 'warning'
        },
        {
            title: 'Customers',
            value: users.filter(u => u.role === 'customer').length,
            icon: 'bi-person-check',
            color: 'info'
        }
    ];

    return (
        <div className="admin-dashboard">
            {/* Statistics Cards */}
            <Row className="mb-4">
                {stats.map((stat, index) => (
                    <Col lg={3} md={6} key={index}>
                        <Card className="dashboard-card h-100">
                            <Card.Body className="text-center">
                                <div className={`text-${stat.color} mb-2`}>
                                    <i className={`${stat.icon} display-4`}></i>
                                </div>
                                <h3 className="fw-bold">{stat.value}</h3>
                                <p className="text-muted mb-0">{stat.title}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                {/* Users Management */}
                <Col lg={8}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">User Management</h5>
                            <Button size="sm" variant="outline-primary">
                                View All Users
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {usersLoading ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <Table responsive hover className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.slice(0, 5).map(user => (
                                            <tr key={user._id}>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{getUserRoleBadge(user.role)}</td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setNewRole(user.role);
                                                                setShowUserModal(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => handleDeleteUser(user._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent Events */}
                <Col lg={4}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Recent Events</h5>
                        </Card.Header>
                        <Card.Body>
                            {eventsLoading ? (
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {events.slice(0, 5).map(event => (
                                        <div key={event._id} className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h6 className="mb-1">{event.title}</h6>
                                                <small className="text-muted">
                                                    {new Date(event.date).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <Badge bg="secondary">${event.price}</Badge>
                                        </div>
                                    ))}
                                    <Button variant="outline-primary" size="sm" className="w-100">
                                        View All Events
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* User Role Update Modal */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update User Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>User: {selectedUser.name}</Form.Label>
                                <Form.Text className="d-block text-muted">
                                    Email: {selectedUser.email}
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>New Role</Form.Label>
                                <Form.Select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="organizer">Event Organizer</option>
                                    <option value="admin">Admin</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdateRole}>
                        Update Role
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
