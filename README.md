# Contact Manager

A modern contact management platform built with Next.js and Express.js, following Hexagonal Architecture (backend) and Feature-first Architecture (frontend) principles.

## Overview

Contact management platform for storing and managing contact information including:

- Name
- Address (with Google Places API integration)
- Email
- Cellphone number
- Profile picture
- Notes

## Technology Stack

### Frontend

- React 18+ as the core UI library
- Next.js 14+ for app framework
- TypeScript for type safety
- Redux Toolkit for state management
- Formik for form handling
- TailwindCSS for styling
- React Testing Library for testing

### Backend

- Node.js with Express
- TypeScript
- PostgreSQL for database
- Prisma as ORM
- JWT for authentication
- Hexagonal Architecture pattern

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/carmesotuyo/contact-manager.git
cd contact-manager
```

2. Install all dependencies:

```bash
npm run install:all
```

### Backend Setup

1. Install PostgreSQL (if not installed):

```bash
brew install postgresql@14
```

2. Start PostgreSQL service:

```bash
brew services start postgresql@14
```

3. Navigate to backend directory:

```bash
cd backend
```

4. Create `.env` file with required configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contact_manager?schema=public"

# Server
PORT=3000
JWT_SECRET=your_jwt_secret
```

5. Set up the database:

```bash
# Create database user and database
createuser -s postgres
createdb -U postgres contact_manager

# Run database migrations
npx prisma migrate dev

# Seed initial users
npm run seed
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3001
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key
```

### Development

Available scripts (from root directory):

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both applications
- `npm run test` - Run tests for both applications
- `npm run format` - Format code using Prettier

### Default Users

The seeding process creates three default users:

| Email                  | Password    |
| ---------------------- | ----------- |
| john.doe@example.com   | password123 |
| jane.smith@example.com | password123 |
| admin@example.com      | password123 |

### Development Tools

#### Database Management

You can use Prisma Studio to view and manage the database:

```bash
cd backend
npx prisma studio
```

Then open http://localhost:5555 in your browser.

## Project Structure

```
/
├── frontend/           # Next.js frontend application
│   └── src/
│       ├── app/       # Next.js app router pages
│       ├── modules/   # Feature modules
│       │   ├── auth/  # Authentication feature
│       │   ├── contacts/ # Contacts feature
│       │   └── notes/ # Notes feature
│       ├── components/ # Shared UI components
│       ├── lib/       # Utilities and helpers
│       └── store/     # Global state management
│
├── backend/           # Express.js backend application
│   └── src/
│       ├── domain/    # Core business logic
│       ├── application/ # Services and DTOs
│       ├── infrastructure/ # External concerns
│       └── interfaces/ # API endpoints and middleware
│
└── docs/             # Project documentation
    ├── api/          # API documentation
    ├── setup/        # Setup guides
    └── architecture/ # Architecture documentation
```

## Architecture

### Backend: Hexagonal Architecture (Ports and Adapters)

- Domain Layer: Core business logic and entities
- Application Layer: Services and DTOs
- Infrastructure Layer: External adapters and implementations
- Interface Layer: API endpoints and controllers

### Frontend: Feature-first Architecture

- Feature Modules: Self-contained features (auth, contacts, notes)
- Shared Components: Reusable UI components
- Core Services: Common functionality and utilities
- Global State: Redux for cross-feature state

## API Endpoints

### Authentication

- `POST /api/login` - User login
- `GET /api/user` - Get logged user info

### Contacts

- `GET /api/contacts` - Get paginated contact list
- `GET /api/contacts/{contactId}` - Get contact details
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{contactId}` - Update contact

### Notes

- `POST /api/contacts/{contactId}/notes` - Create note
- `GET /api/notes` - Get paginated notes list
- `GET /api/notes/{noteId}` - Get note details

## Features

- User authentication with JWT
- Contact management (CRUD operations)
- Notes management
- Google Places API integration for address lookup
- Mobile-responsive design
- Form validation
- Image upload for profile pictures

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
