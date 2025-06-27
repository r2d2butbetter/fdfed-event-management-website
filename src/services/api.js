import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Mock API responses for development
const mockData = {
    users: [
        {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'customer',
            createdAt: '2024-01-01T00:00:00Z',
        },
        {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'organizer',
            createdAt: '2024-01-02T00:00:00Z',
        },
        {
            _id: '3',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: '2024-01-03T00:00:00Z',
        },
    ],
    events: [
        {
            _id: '1',
            title: 'Tech Conference 2024',
            description: 'Annual technology conference featuring latest innovations',
            category: 'Technology',
            date: '2024-07-15T09:00:00Z',
            endDate: '2024-07-15T17:00:00Z',
            location: 'Convention Center, New York',
            price: 299,
            capacity: 500,
            organizer: '2',
            imageUrl: 'https://picsum.photos/400/250?random=1',
            createdAt: '2024-01-01T00:00:00Z',
        },
        {
            _id: '2',
            title: 'Music Festival',
            description: 'Three-day music festival with international artists',
            category: 'Entertainment',
            date: '2024-08-20T18:00:00Z',
            endDate: '2024-08-22T23:00:00Z',
            location: 'Central Park, New York',
            price: 150,
            capacity: 10000,
            organizer: '2',
            imageUrl: 'https://picsum.photos/400/250?random=2',
            createdAt: '2024-01-02T00:00:00Z',
        },
    ],
};

// Development mode mock responses
if (process.env.NODE_ENV === 'development') {
    // Override axios with mock responses
    const originalRequest = api.request;

    api.request = function (config) {
        const { method, url } = config;

        // Simulate network delay
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Mock login
        if (method === 'post' && url === '/auth/login') {
            return delay(1000).then(() => {
                const { email, password } = JSON.parse(config.data);
                const user = mockData.users.find(u => u.email === email);

                if (user && password === 'password') {
                    return {
                        data: {
                            user,
                            token: 'mock_jwt_token_' + user._id,
                        },
                    };
                } else {
                    throw new Error('Invalid credentials');
                }
            });
        }

        // Mock register
        if (method === 'post' && url === '/auth/register') {
            return delay(1000).then(() => {
                const userData = JSON.parse(config.data);
                const newUser = {
                    _id: Date.now().toString(),
                    ...userData,
                    role: userData.role || 'customer',
                    createdAt: new Date().toISOString(),
                };

                return {
                    data: {
                        user: newUser,
                        token: 'mock_jwt_token_' + newUser._id,
                    },
                };
            });
        }

        // Mock get current user
        if (method === 'get' && url === '/auth/me') {
            return delay(500).then(() => {
                const token = config.headers.Authorization?.replace('Bearer ', '');
                if (token?.startsWith('mock_jwt_token_')) {
                    const userId = token.replace('mock_jwt_token_', '');
                    const user = mockData.users.find(u => u._id === userId);
                    return {
                        data: { user, token },
                    };
                }
                throw new Error('Unauthorized');
            });
        }

        // Mock get events
        if (method === 'get' && url === '/events') {
            return delay(800).then(() => ({
                data: {
                    events: mockData.events,
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalEvents: mockData.events.length,
                        hasNext: false,
                        hasPrev: false,
                    },
                },
            }));
        }

        // Default to original request for unmocked endpoints
        return originalRequest.call(this, config);
    };
}

export default api;
