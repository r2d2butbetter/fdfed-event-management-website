import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'react-bootstrap';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import EventList from './pages/events/EventList';
import EventDetails from './pages/events/EventDetails';
import CreateEvent from './pages/events/CreateEvent';
import Profile from './pages/Profile';
import AdminPanel from './pages/admin/AdminPanel';

// Store
import { checkAuthStatus } from './store/slices/authSlice';
import { initializeApp } from './store/slices/appSlice';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, isAuthenticated } = useSelector(state => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.app);
    const { isAuthenticated, user } = useSelector(state => state.auth);

    // Lifecycle method demonstration - componentDidMount equivalent
    useEffect(() => {
        // Initialize app and check authentication status
        dispatch(initializeApp());
        dispatch(checkAuthStatus());

        // Demonstrate browser APIs and event loop
        const handleOnlineStatus = () => {
            console.log('Network status changed:', navigator.onLine);
        };

        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOnlineStatus);

        // Cleanup - componentWillUnmount equivalent
        return () => {
            window.removeEventListener('online', handleOnlineStatus);
            window.removeEventListener('offline', handleOnlineStatus);
        };
    }, [dispatch]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="App d-flex flex-column min-vh-100">
            <Navbar />
            <Container fluid className="flex-grow-1 p-0">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<EventList />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
                    />
                    <Route
                        path="/register"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Event Organizer Routes */}
                    <Route
                        path="/create-event"
                        element={
                            <ProtectedRoute requiredRole="organizer">
                                <CreateEvent />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Container>
            <Footer />
        </div>
    );
}

export default App;
