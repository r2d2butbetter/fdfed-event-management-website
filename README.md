# Event Management Website

A full-stack web application for creating, managing, and attending events. The system supports multiple user roles (attendee, organizer, manager, admin), payment processing via Razorpay, AI-powered semantic search via Google Gemini, and image uploads via Cloudinary.

---

## Deployment

### Production Environment

The application is hosted on a DigitalOcean Droplet and served at `https://wbd.shriansh.me` behind Cloudflare proxying.

The production stack runs as two Docker containers (frontend and backend) orchestrated via Docker Compose, identical to the local Docker setup described below.

### CI/CD Pipeline

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`). It triggers on every push to the `main` or `master` branch and performs the following steps:

1. SSH into the DigitalOcean Droplet using `appleboy/ssh-action`.
2. Install Docker on the droplet if it is not already present.
3. Clone the repository into `~/fdfed_project` on first run, or `git fetch` + `git reset --hard origin/master` on subsequent runs to get a clean working tree.
4. Write the production environment variables (stored in the `PROD_ENV_FILE` GitHub secret) to `~/fdfed_project/.env`.
5. Append `FRONTEND_URL=https://wbd.shriansh.me` and `VITE_API_URL=/api` to the `.env` file so the containerised frontend reaches the backend via the Nginx proxy path `/api/`.
6. Run `docker compose down` to stop existing containers.
7. Run `docker compose up -d --build` to rebuild images and start containers.

### Required GitHub Secrets

| Secret          | Description                                                    |
|-----------------|----------------------------------------------------------------|
| `DO_HOST`       | IP address or hostname of the DigitalOcean Droplet             |
| `DO_USERNAME`   | SSH username on the Droplet (typically `root`)                 |
| `DO_SSH_KEY`    | SSH private key authorised on the Droplet                      |
| `PROD_ENV_FILE` | Full contents of the production `.env` file (all variables from the Environment Variables section below) |

### How the Nginx Proxy Works in Production

In the production Docker Compose setup, `VITE_API_URL` is set to `/api` (a relative path). The frontend Nginx container proxies all requests matching `^~ /api/` to `http://backend:3000/`, stripping the `/api` prefix. This means the React app and the API are served on the same origin, avoiding cross-origin cookie issues with session-based auth.

---

## Testing

There is currently no automated test suite in the project. The backend `package.json` has a placeholder `test` script that exits with an error if invoked. Frontend testing tooling (Vitest, Jest, Cypress, etc.) has not been configured.

Manual API testing can be done using the included Postman collection (`Event_Management_API_Postman_Collection.json`) or via the Swagger UI available at `/api-docs` when the server is running.

---

## Utility Scripts

The `server/scripts/` directory contains one-off Node.js scripts for bootstrapping privileged roles. Both scripts read `MONGO_USERNAME` and `MONGO_PASSWORD` from a `server/.env` file.

### Promote a user to Admin

```bash
cd server
node scripts/addAdmin.js <user-email>
# Example: node scripts/addAdmin.js admin@example.com
```

### Promote a user to Manager

```bash
cd server
node scripts/addManager.js <user-email>
# Example: node scripts/addManager.js manager@example.com
```

Both scripts look up the user by email, verify they are not already in the target role, create the corresponding `admins` or `managers` document, and exit. The user account must already exist before running these scripts.

---

## Tech Stack

### Frontend
- React 19 with Vite 7
- React Router DOM v7 (client-side routing)
- Redux Toolkit + redux-persist (state management, persisted to localStorage)
- Material UI (MUI) v7 with Emotion
- Formik + Yup (form handling and validation)
- Chart.js / Recharts (data visualization)
- Framer Motion (animations)

### Backend
- Node.js with Express 4 (ES modules)
- MongoDB Atlas via Mongoose 8 (primary database)
- express-session + connect-mongo (session store backed by MongoDB)
- bcrypt (password hashing)
- Multer + multer-storage-cloudinary (image uploads)
- Cloudinary (media storage)
- Razorpay SDK (payment processing)
- Google Generative AI SDK (semantic search using `gemini-embedding-001` and `gemini-2.5-flash`)
- Nodemailer (transactional email)
- Helmet (HTTP security headers)
- Morgan + Winston + winston-daily-rotate-file (HTTP and application logging)
- Swagger UI Express (API documentation at `/api-docs`)
- uuid (unique ID generation)

### Infrastructure
- Docker (multi-stage builds for both frontend and backend)
- Docker Compose (orchestrates frontend and backend containers)
- Nginx (serves the compiled React app in production; proxies `/api/*` requests to the backend)

---

## Project Structure

```
.
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx          # Route definitions
│   │   ├── pages/           # Page components (Home, Login, Signup, EventDetail, dashboards, etc.)
│   │   ├── components/      # Shared components (Navbar, Footer, Chatbot)
│   │   ├── redux/           # Redux store, slices (organizer, events)
│   │   ├── api/             # API call helpers
│   │   ├── context/         # React context providers
│   │   └── css/             # Global styles
│   ├── nginx.conf           # Nginx config for production container
│   ├── Dockerfile           # Multi-stage: build with Node, serve with Nginx
│   └── package.json
│
├── server/                  # Express backend
│   ├── index.js             # App entry point; registers middleware and routes
│   ├── connection.js        # MongoDB connection (Mongoose)
│   ├── multerConfig.js      # Multer + Cloudinary storage config
│   ├── routes/              # Route definitions
│   ├── controllers/         # Business logic
│   ├── models/              # Mongoose schemas
│   ├── middlewares/         # Auth, admin/manager guards, error handler, event status updater
│   ├── services/            # Session-based auth helpers
│   ├── config/              # Logger (Winston) and email (Nodemailer) setup
│   ├── docs/                # Swagger spec
│   ├── database_schema.sql  # MongoDB collection definitions with JSON Schema validators
│   ├── Dockerfile           # Node 20 Alpine image
│   └── package.json
│
├── docker-compose.yml       # Defines backend (port 3000) and frontend (port 80) services
└── Event_Management_API_Postman_Collection.json
```

---

## Database

MongoDB Atlas is the primary database. The database is named `EventManagement` and contains the following collections:

| Collection      | Required Fields                                                                 |
|-----------------|---------------------------------------------------------------------------------|
| `users`         | `name`, `email`, `passwordHash`                                                 |
| `organizers`    | `userId`, `organizationName`, `contactNo`                                       |
| `events`        | `category`, `title`, `description`, `startDateTime`, `endDateTime`, `venue`, `capacity`, `ticketPrice`, `organizerId` |
| `registrations` | `userId`, `eventId`                                                             |
| `savedevents`   | `userId`, `eventId`                                                             |
| `admins`        | `userId`                                                                        |
| `managers`      | `userId`                                                                        |
| `payments`      | (referenced in payment routes)                                                  |

Unique indexes are enforced on `users.email`, `registrations(userId, eventId)`, `savedevents(userId, eventId)`, `admins.userId`, and `managers.userId`.

The `events` collection includes an `embedding` field (`[Number]`) used to store Gemini vector embeddings for semantic search.

---

## API Routes

### Authentication (`/`)
| Method | Path               | Description                          |
|--------|--------------------|--------------------------------------|
| POST   | `/sign-up`         | Register a new user                  |
| POST   | `/login`           | Log in (session-based)               |
| GET    | `/logout`          | Destroy session                      |
| GET    | `/check-session`   | Return current session user          |
| GET    | `/organizer-login` | Organizer login info                 |
| POST   | `/host_with_us`    | Register as an organizer             |

### Events (`/events`)
| Method | Path                   | Description                                             |
|--------|------------------------|---------------------------------------------------------|
| GET    | `/events`              | List all events (with optional filters)                 |
| GET    | `/events/search/smart` | Semantic search using Gemini embeddings + RAG response  |
| GET    | `/events/category/:category` | Filter events by category                        |
| GET    | `/events/:id`          | Get event details                                       |
| DELETE | `/events/:id`          | Delete event (auth required)                            |

### Users (`/user`)
| Method | Path                                   | Description                          |
|--------|----------------------------------------|--------------------------------------|
| GET    | `/user/dashboard`                      | User dashboard data                  |
| GET    | `/user/profile`                        | Get profile                          |
| PUT    | `/user/profile`                        | Update profile                       |
| POST   | `/user/change-password`                | Change password                      |
| POST   | `/user/update-email`                   | Update email                         |
| POST   | `/user/save-event`                     | Save an event                        |
| POST   | `/user/unsave-event`                   | Unsave an event                      |
| GET    | `/user/saved-events`                   | List saved events                    |
| GET    | `/user/check-saved-status`             | Check if an event is saved           |
| POST   | `/user/cancel-booking`                 | Cancel a registration                |
| GET    | `/user/refund-preview/:registrationId` | Preview refund amount                |
| GET    | `/user/payment-history`                | Payment history                      |
| GET    | `/user/activity-stats`                 | Activity statistics                  |
| GET/PUT | `/user/notification-preferences`     | Get/update notification preferences  |

### Organizer (`/organizer`) - requires authentication
| Method | Path                                       | Description                          |
|--------|--------------------------------------------|--------------------------------------|
| GET    | `/organizer/dashboard`                     | Organizer dashboard                  |
| POST   | `/organizer/events`                        | Create event (with image upload)     |
| PUT    | `/organizer/events/:id`                    | Update event                         |
| DELETE | `/organizer/events/:id`                    | Delete event                         |
| PUT    | `/organizer/profile`                       | Update organizer profile             |
| PUT    | `/organizer/change-password`               | Change password                      |
| GET    | `/organizer/events/:eventId/attendees`     | List attendees                       |
| GET    | `/organizer/events/:eventId/attendees/export` | Export attendees                  |
| POST   | `/organizer/events/:eventId/send-email`    | Send bulk email to attendees         |
| POST   | `/organizer/submit-verification`           | Submit verification document         |
| GET    | `/organizer/verification-status`           | Check verification status            |

### Manager (`/manager`) - requires manager role
| Method | Path                                    | Description                          |
|--------|-----------------------------------------|--------------------------------------|
| GET    | `/manager/dashboard`                    | Manager dashboard                    |
| GET    | `/manager/organizers`                   | List all organizers                  |
| GET    | `/manager/organizers/:id`               | Get organizer details                |
| PUT    | `/manager/organizers/:id/approve`       | Approve organizer verification       |
| PUT    | `/manager/organizers/:id/reject`        | Reject organizer verification        |
| GET    | `/manager/chart/verification-stats`     | Verification statistics              |

### Admin (`/admin`) - requires admin role
| Method | Path                                        | Description                          |
|--------|---------------------------------------------|--------------------------------------|
| GET    | `/admin/dashboard`                          | Admin dashboard                      |
| GET/POST | `/admin/users`                            | List / create users                  |
| GET/PUT/DELETE | `/admin/users/:id`                  | User CRUD                            |
| GET    | `/admin/users/:id/details`                  | User details                         |
| GET    | `/admin/users/revenue`                      | Per-user revenue                     |
| GET    | `/admin/events`                             | All events                           |
| GET    | `/admin/events/:eventId/attendees`          | Event attendees                      |
| GET    | `/admin/organizers`                         | All organizers                       |
| GET/PUT | `/admin/organizers/:id`                   | Organizer detail / update            |
| PUT    | `/admin/organizers/:id/verify`              | Verify organizer                     |
| PUT    | `/admin/organizers/:id/reject`              | Reject organizer                     |
| GET    | `/admin/organizers/revenue`                 | Per-organizer revenue                |
| GET    | `/admin/chart/*`                            | Chart data endpoints                 |
| GET    | `/admin/revenue`                            | Commission revenue                   |

### Payments (`/payments`)
Handles Razorpay order creation, payment verification, and webhook callbacks.

### Misc
| Method | Path           | Description                    |
|--------|----------------|--------------------------------|
| GET    | `/stats`       | Total events and organizer count |
| GET    | `/contact`     | Contact info                   |
| POST   | `/api/contact` | Submit contact form (sends email) |
| GET    | `/api-docs`    | Swagger UI                     |

---

## Environment Variables

### Backend (`server/.env`)
```
PORT=3000
MONGO_USERNAME=
MONGO_PASSWORD=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email (optional; emails are simulated to console if omitted)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
CONTACT_RECEIVER_EMAIL=
```

### Frontend (`client/.env` or Docker build arg)
```
VITE_API_URL=http://localhost:3000
```

---

## Running Locally

### Prerequisites
- Node.js 20+
- MongoDB Atlas cluster (or local MongoDB instance)

### Backend
```bash
cd server
npm install
# Create a .env file with the variables listed above
npm run dev   # uses nodemon
```

The backend starts on `http://localhost:3000`. Swagger UI is available at `http://localhost:3000/api-docs`.

### Frontend
```bash
cd client
npm install
npm run dev   # Vite dev server on http://localhost:5173
```

---

## Running with Docker Compose

```bash
# From the repository root
cp server/.env.example server/.env   # fill in your values

docker compose up --build
```

- Frontend: `http://localhost:80`
- Backend: `http://localhost:3000`

The frontend Nginx container proxies requests starting with `/api/` to the backend container at `http://backend:3000/`. React Router is handled by Nginx's `try_files` fallback to `index.html`.

The `VITE_API_URL` build argument is injected into the frontend image at build time via a Docker `ARG`.

---

## Authentication and Sessions

- Authentication is session-based using `express-session` with a MongoDB-backed session store (`connect-mongo`).
- Passwords are hashed with `bcrypt`.
- Role-based access is enforced by middleware:
  - `isAuth` - requires any authenticated session
  - `isAdmin` - requires admin role
  - `isManager` - requires manager role
  - `optionalAuth` - attaches user to request if a session exists, does not block unauthenticated requests

---

## Image Uploads

Multer is configured with `multer-storage-cloudinary` to upload files directly to Cloudinary under the `events/` folder. Accepted formats: `jpg`, `jpeg`, `png`, `webp`, `gif`.

---

## AI-Powered Semantic Search

The `GET /events/search/smart` endpoint:
1. Generates a vector embedding of the search query using the `gemini-embedding-001` model.
2. Compares the query vector against pre-computed embeddings stored on each event document using cosine similarity.
3. Returns the top matching events along with a conversational summary generated by `gemini-2.5-flash` (Retrieval-Augmented Generation).

---

## Logging

- HTTP request logs are written via Morgan in `combined` format to `server/logs/access.log` (static file requests are excluded).
- Application-level logs use Winston with daily log rotation via `winston-daily-rotate-file`.

---

## API Documentation

A Postman collection is included at the repository root: `Event_Management_API_Postman_Collection.json`.

Interactive Swagger UI is served by the backend at `/api-docs` when the server is running.
