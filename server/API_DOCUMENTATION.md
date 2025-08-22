# Event Management API Documentation

## Overview
This API provides endpoints for a comprehensive event management system built for React frontend compatibility. It supports user authentication, event management, organizer features, and administrative functions.

**Base URL**: `http://localhost:3000/api`
**API Version**: v1
**Authentication**: JWT Bearer Token

## Authentication

### JWT Token Usage
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Token Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "timestamp": "2024-08-23T10:30:00.000Z"
}
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "meta": { /* optional metadata like pagination */ },
  "timestamp": "2024-08-23T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ],
  "timestamp": "2024-08-23T10:30:00.000Z"
}
```

## Authentication Endpoints

### 1. User Registration
**POST** `/api/auth/sign-up`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password1": "securePassword123",
  "password2": "securePassword123"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### 3. Organizer Registration
**POST** `/api/auth/host_with_us`
*Requires Authentication*

**Request Body:**
```json
{
  "orgName": "Amazing Events Co",
  "description": "We create unforgettable experiences",
  "mobile": "+1234567890"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Organizer registration successful",
  "data": {
    "organizer": {
      "id": "organizer_id",
      "organizationName": "Amazing Events Co",
      "description": "We create unforgettable experiences",
      "contactNo": "+1234567890"
    }
  }
}
```

### 4. Logout
**POST** `/api/auth/logout`
*Requires Authentication*

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

## Event Endpoints

### 1. Get All Events
**GET** `/api/events/`

**Query Parameters:**
- `category` (optional): Filter by event category
- `search` (optional): Search events by title or description
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": "event_id",
      "title": "Summer Music Festival",
      "description": "A great music festival",
      "date": "2024-09-15T18:00:00.000Z",
      "location": "Central Park, NYC",
      "capacity": 5000,
      "ticketPrice": 75.00,
      "imageUrl": "/uploads/events/event-image.jpg",
      "category": "music",
      "organizer": {
        "id": "organizer_id",
        "organizationName": "Music Events Inc"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Event by ID
**GET** `/api/events/:id`

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": "event_id",
    "title": "Summer Music Festival",
    "description": "Detailed event description...",
    "date": "2024-09-15T18:00:00.000Z",
    "location": "Central Park, NYC",
    "capacity": 5000,
    "ticketPrice": 75.00,
    "imageUrl": "/uploads/events/event-image.jpg",
    "category": "music",
    "organizer": {
      "id": "organizer_id",
      "organizationName": "Music Events Inc",
      "contactNo": "+1234567890"
    },
    "availableTickets": 2500
  }
}
```

### 3. Create Event (Organizer)
**POST** `/api/organizer/events`
*Requires Authentication (Organizer role)*

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `title`: Event title
- `description`: Event description
- `date`: Event date (ISO format)
- `location`: Event location
- `capacity`: Maximum attendees
- `ticketPrice`: Price per ticket
- `category`: Event category
- `eventImage`: Image file (max 5MB)

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "new_event_id",
    "title": "New Event",
    "description": "Event description",
    "date": "2024-10-01T19:00:00.000Z",
    "location": "Event Venue",
    "capacity": 1000,
    "ticketPrice": 50.00,
    "imageUrl": "/uploads/events/unique-filename.jpg",
    "category": "conference"
  }
}
```

## User Endpoints

### 1. Get User Profile
**GET** `/api/users/profile`
*Requires Authentication*

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "registeredEvents": [
      {
        "eventId": "event_id",
        "title": "Summer Music Festival",
        "date": "2024-09-15T18:00:00.000Z"
      }
    ],
    "savedEvents": [
      {
        "eventId": "event_id_2",
        "title": "Tech Conference 2024",
        "date": "2024-10-01T09:00:00.000Z"
      }
    ]
  }
}
```

### 2. Update User Profile
**PUT** `/api/users/profile`
*Requires Authentication*

**Request Body:**
```json
{
  "name": "John Updated Doe",
  "email": "john.new@example.com"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_id",
    "name": "John Updated Doe",
    "email": "john.new@example.com",
    "role": "user"
  }
}
```

## Organizer Endpoints

### 1. Get Organizer Dashboard
**GET** `/api/organizer/dashboard`
*Requires Authentication (Organizer role)*

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "organizer": {
      "id": "organizer_id",
      "organizationName": "Events Co",
      "description": "We organize events",
      "verified": true
    },
    "stats": {
      "totalEvents": 15,
      "upcomingEvents": 8,
      "totalRevenue": 25000.00,
      "totalTicketsSold": 500
    },
    "recentEvents": [
      {
        "id": "event_id",
        "title": "Recent Event",
        "date": "2024-09-01T18:00:00.000Z",
        "ticketsSold": 150,
        "revenue": 7500.00
      }
    ]
  }
}
```

### 2. Get Organizer Events
**GET** `/api/organizer/events`
*Requires Authentication (Organizer role)*

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Organizer events retrieved successfully",
  "data": [
    {
      "id": "event_id",
      "title": "My Event",
      "description": "Event description",
      "date": "2024-09-15T18:00:00.000Z",
      "capacity": 1000,
      "ticketsSold": 750,
      "revenue": 37500.00,
      "status": "active"
    }
  ]
}
```

## Admin Endpoints

### 1. Get Admin Dashboard
**GET** `/api/admin/dashboard`
*Requires Authentication (Admin role)*

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Admin dashboard data retrieved",
  "data": {
    "stats": {
      "totalUsers": 1500,
      "totalEvents": 250,
      "totalOrganizers": 45,
      "totalRevenue": 500000.00
    },
    "recentActivity": [
      {
        "type": "user_registration",
        "details": "New user registered",
        "timestamp": "2024-08-23T10:00:00.000Z"
      }
    ],
    "pendingApprovals": [
      {
        "type": "organizer",
        "id": "organizer_id",
        "organizationName": "New Events Co",
        "submittedAt": "2024-08-22T15:30:00.000Z"
      }
    ]
  }
}
```

### 2. Get All Users (Admin)
**GET** `/api/admin/users`
*Requires Authentication (Admin role)*

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "registrationDate": "2024-08-01T10:00:00.000Z",
      "isActive": true
    }
  ]
}
```

## Payment Endpoints

### 1. Get Payment Page
**GET** `/api/payment/:eventId`
*Requires Authentication*

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Payment information retrieved",
  "data": {
    "event": {
      "id": "event_id",
      "title": "Summer Music Festival",
      "date": "2024-09-15T18:00:00.000Z",
      "ticketPrice": 75.00,
      "availableTickets": 100
    },
    "paymentMethods": [
      "credit_card",
      "paypal",
      "stripe"
    ]
  }
}
```

### 2. Process Payment
**POST** `/api/payment/:eventId`
*Requires Authentication*

**Request Body:**
```json
{
  "paymentMethod": "credit_card",
  "quantity": 2,
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "cardholderName": "John Doe"
  }
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transactionId": "txn_123456",
    "amount": 150.00,
    "tickets": [
      {
        "ticketId": "ticket_1",
        "eventId": "event_id",
        "userId": "user_id",
        "qrCode": "base64_qr_code_data"
      }
    ]
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

## File Upload Guidelines

### Supported File Types
- Images: PNG, JPEG, JPG, GIF, WebP
- Maximum file size: 5MB
- Maximum files per request: 5

### Upload Fields
- `eventImage`: Single event image
- `eventImages`: Multiple event images (max 5)
- `profileImage`: Single profile image

### Example Upload with Axios (React)
```javascript
const formData = new FormData();
formData.append('title', 'Event Title');
formData.append('description', 'Event Description');
formData.append('eventImage', imageFile);

const response = await axios.post('/api/organizer/events', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});
```

## Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- File upload endpoints: 10 requests per hour per user
- General API endpoints: 100 requests per hour per user

## Development Notes

### Environment Variables Required
```env
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:3000
MONGO_USERNAME=your-mongo-username
MONGO_PASSWORD=your-mongo-password
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### React Integration Example
```javascript
// API service example
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/sign-up', userData),
  logout: () => apiClient.post('/auth/logout'),
};

export const eventAPI = {
  getAll: (params) => apiClient.get('/events', { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (eventData) => apiClient.post('/organizer/events', eventData),
};
```

---

**Last Updated**: August 23, 2025
**API Version**: 1.0.0
**Contact**: Your development team