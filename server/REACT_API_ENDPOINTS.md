# React API Endpoints - Quick Reference

Since your server is mounted under `/api/auth/`, here are the correct endpoints for your React frontend:

## Authentication Endpoints

### User Registration
**POST** `/api/auth/sign-up-api`
```json
{
  "name": "John Doe", 
  "email": "john@example.com",
  "password1": "password123",
  "password2": "password123"
}
```

### User Login  
**POST** `/api/auth/login-api`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Organizer Registration
**POST** `/api/auth/host_with_us-api`
*Requires JWT token in Authorization header*
```json
{
  "orgName": "Event Company",
  "description": "We organize events", 
  "mobile": "+1234567890"
}
```

### Logout
**POST** `/api/auth/logout-api`
*Requires JWT token*

### Check Organizer Status
**GET** `/api/auth/organizer-status` 
*Requires JWT token*

### Refresh Token
**POST** `/api/auth/refresh-token`
```json
{
  "refreshToken": "your_refresh_token"
}
```

## Test Commands

### Using curl:
```bash
# Register
curl -X POST http://localhost:3000/api/auth/sign-up-api \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password1":"password123","password2":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login-api \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using Postman:
1. **Method**: POST
2. **URL**: `http://localhost:3000/api/auth/sign-up-api`
3. **Headers**: `Content-Type: application/json` 
4. **Body**: Raw JSON with user data

## Expected Response Format:
```json
{
  "success": true,
  "message": "User registered successfully", 
  "data": {
    "user": {
      "id": "user_id",
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "timestamp": "2024-08-23T10:30:00.000Z"
}
```