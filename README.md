# PackMoveGo Domain V0
<<<<<<< HEAD
# Pack Move Go Movers Client

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)

This is the client-side application for Pack Move GO, a professional moving company. The application provides a user-friendly interface for customers to book moving services, track their moves, and manage their accounts.

## Tech Stack

=======
# PackMoveGo - Full Stack Moving Services Platform

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)

PackMoveGo is a comprehensive full-stack moving services platform that provides customers with an intuitive interface to book moving services, track their moves, and manage their accounts. The platform consists of a robust backend API and a modern React frontend.

## Tech Stack

### Backend (SSD/)
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT Authentication
- Stripe Payment Processing
- API Gateway Architecture

### Frontend (Views/desktop/domain_V1/)
>>>>>>> f5058b2 (Initial commit: Multi-view dashboard application)
- React 18
- TypeScript
- Vite
- React Router DOM
- React Query
- TailwindCSS
- React Hook Form with Zod validation
- Axios for API requests
- Vercel Analytics and Speed Insights

## Prerequisites

<<<<<<< HEAD
- Node.js (Latest LTS version recommended)
- npm or yarn package manager

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory (if not already present) and configure your environment variables.

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5001` by default.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally
=======
- Node.js (v18.14.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB (local or cloud instance)

## Quick Start

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables

Create `.env` files in both `SSD/` and `Views/desktop/domain_V1/` directories with the required environment variables.

**Backend (SSD/.env):**
- MongoDB connection string
- JWT secrets
- Stripe API keys
- Email service credentials

**Frontend (Views/desktop/domain_V1/.env):**
- API endpoint URLs
- Analytics keys

### 3. Start Development Servers

Run both backend and frontend concurrently:
```bash
npm run dev
```

This will start:
- **Backend API** on `http://localhost:3000`
- **Backend Gateway** on configured port
- **Frontend** on `http://localhost:5001`

Or run them individually:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Available Scripts

### Root Level Scripts
- `npm run dev` - Start both backend and frontend development servers concurrently
- `npm run dev:backend` - Start only the backend (API + Gateway)
- `npm run dev:frontend` - Start only the frontend
- `npm run build` - Build both backend and frontend for production
- `npm run build:backend` - Build backend only
- `npm run build:frontend` - Build frontend only
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean build artifacts and node_modules
- `npm run test` - Run tests for both backend and frontend

### Backend Scripts (SSD/)
- `npm run dev` - Start backend with nodemon (server + gateway)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production servers
- `npm run test` - Run backend tests
- `npm run security:check` - Run security validation

### Frontend Scripts (Views/desktop/domain_V1/)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run frontend tests
>>>>>>> f5058b2 (Initial commit: Multi-view dashboard application)

## Project Structure

```
<<<<<<< HEAD
client/
├── config/         # Configuration files
├── network/        # API and network related code
├── public/         # Static assets
├── script/         # Build and utility scripts
├── src/           # Source code
└── ...
```
=======
packmovego/
├── SSD/                          # Backend Application
│   ├── config/                   # Configuration files
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # API routes
│   │   ├── models/               # Database models
│   │   ├── middlewares/          # Express middlewares
│   │   ├── services/             # Business logic
│   │   ├── util/                 # Utility functions
│   │   ├── gateway/              # API Gateway
│   │   ├── server.ts             # Main server
│   │   └── ...
│   ├── data/                     # Database files
│   └── package.json
│
├── Views/
│   └── desktop/
│       └── domain_V1/            # Frontend Application
│           ├── src/
│           │   ├── components/   # React components
│           │   ├── pages/        # Page components
│           │   ├── hooks/        # Custom React hooks
│           │   ├── services/     # API services
│           │   ├── types/        # TypeScript types
│           │   ├── utils/        # Utility functions
│           │   └── ...
│           ├── config/           # Vite & build configs
│           ├── public/           # Static assets
│           └── package.json
│
├── package.json                  # Root package.json with monorepo scripts
├── README.md                     # This file
├── PROJECT_STATUS.md             # Project status and milestones
├── CHANGELOG.txt                 # Detailed changelog
└── ...
>>>>>>> f5058b2 (Initial commit: Multi-view dashboard application)

## Features

- Modern React with TypeScript
- Form handling with React Hook Form and Zod validation
- API integration with Axios
- Routing with React Router
- State management with React Query
- Styling with TailwindCSS
- Analytics integration with Vercel
- Google Analytics 4 integration

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory.

## Deployment

The application is configured for deployment on Vercel, with analytics and speed insights enabled.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing to this project.

## Security

We take security seriously. Please review our [Security Policy](SECURITY.md) for reporting vulnerabilities and security-related information.

## License

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited. For licensing inquiries, please contact support@packmovego.com.

# Domain V0
