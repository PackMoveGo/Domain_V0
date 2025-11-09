# PackMoveGo Desktop Application

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)

PackMoveGo is a modern, full-stack moving services platform that provides customers with an intuitive interface to book moving services, track their moves, and manage their accounts. This is the desktop frontend application built with React and TypeScript.

## Tech Stack

- React 18
- TypeScript
- Vite 6
- React Router DOM
- React Query (TanStack Query)
- TailwindCSS
- React Hook Form with Zod validation
- Axios for API requests
- Vercel Analytics and Speed Insights

## Prerequisites

- Node.js (v18.14.0 or higher)
- npm (v8.0.0 or higher)
- OpenSSL (for SSL certificate generation)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.development.local` file in the `config/` directory:

```env
NODE_ENV=development
DEV_HTTPS=true
HOST=localhost
PORT=5001
API_URL=https://localhost:3000
JWT_SECRET=your-jwt-secret-key-here
CORS_ORIGIN=https://localhost:5001
```

### 3. Set Up SSL Certificates (Required for HTTPS)

The development server uses HTTPS by default. You need to generate and trust SSL certificates:

```bash
# Generate SSL certificates
npm run certs:generate

# Trust the certificate (macOS only - requires password)
npm run certs:trust
```

**Important:** After trusting the certificate, completely quit and restart your browser (Cmd+Q) for changes to take effect.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `https://localhost:5001`

## SSL/HTTPS Setup

### Why HTTPS in Development?

This project uses HTTPS in local development to:
- Match production environment behavior
- Test secure cookie handling
- Enable service workers and PWA features
- Avoid mixed content warnings when calling HTTPS APIs

### Certificate Management

#### Generate Certificates
```bash
npm run certs:generate
```
Creates self-signed SSL certificates valid for 365 days in `config/certs/`:
- `localhost-key.pem` (private key)
- `localhost.pem` (certificate)

#### Trust Certificates (macOS)
```bash
npm run certs:trust
```
Adds the certificate to your macOS system keychain as a trusted root certificate. This eliminates browser security warnings.

**You must completely quit and restart your browser (Cmd+Q) after trusting the certificate.**

#### Remove Trust
```bash
npm run certs:untrust
```
Removes the certificate from your system keychain if needed.

### Fixing "Your connection is not private" (ERR_CERT_AUTHORITY_INVALID)

If you see this error in your browser:

1. **Quick Fix:** Click "Advanced" → "Proceed to localhost (unsafe)"
   - Works immediately but shows a warning icon

2. **Permanent Fix (Recommended):** Trust the certificate
   ```bash
   npm run certs:trust
   ```
   - Enter your password when prompted
   - Completely quit your browser (Cmd+Q)
   - Reopen your browser
   - Visit `https://localhost:5001`
   - You should see a secure lock icon with no warnings

### Disable HTTPS (Optional)

To run without HTTPS, set in your `.env.development.local`:
```env
DEV_HTTPS=false
```
Then the server will run on `http://localhost:5001` instead.

## Available Scripts

### Development
- `npm run dev` - Start development server with HTTPS on port 5001
- `npm run dev:react` - Start Vite dev server without port cleanup
- `npm run dev:secure` - Start with HTTP to HTTPS redirect server
- `npm run dev:ssr` - Build and preview SSR version

### Certificate Management
- `npm run certs:generate` - Generate SSL certificates for localhost
- `npm run certs:trust` - Trust certificate in macOS keychain (requires sudo)
- `npm run certs:untrust` - Remove certificate from keychain

### Building
- `npm run build` - Build for production (SSR)
- `npm run build:csr` - Build client-side rendering version
- `npm run build:ssr` - Build server-side rendering version
- `npm run build:clean` - Remove dist directory
- `npm run build:analyze` - Build with bundle analyzer
- `npm run build:profile` - Build with profiling

### Preview & Production
- `npm run preview` - Preview CSR production build
- `npm run preview:csr` - Build and preview CSR version
- `npm run preview:ssr` - Preview SSR build
- `npm run start` - Build and start production server
- `npm run start:prod` - Clean build and start

### Testing & Quality
- `npm run test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint and auto-fix issues
- `npm run type-check` - Check TypeScript types without emitting

### Utilities
- `npm run kill:port` - Kill process on port 5001
- `npm run dev:api:enable` - Enable API calls
- `npm run dev:api:disable` - Disable API calls (mock mode)
- `npm run dev:api:status` - Check API connection status
- `npm run perf:lighthouse` - Run Lighthouse performance audit
- `npm run audit:fix` - Fix npm audit issues
- `npm run audit:check` - Check for security vulnerabilities
- `npm run clean:deps` - Clean install all dependencies

## Project Structure

```
domain_V0/
├── config/              # Configuration files
│   ├── certs/          # SSL certificates (gitignored)
│   ├── vite.config.csr.ts    # Client-side rendering config
│   ├── vite.config.ssr.ts    # Server-side rendering config
│   ├── tailwind.config.js
│   ├── postcss.config.mjs
│   └── .env.development.local
├── src/
│   ├── component/      # React components
│   ├── pages/          # Page components
│   ├── hook/           # Custom React hooks
│   ├── services/       # API services
│   ├── context/        # React context providers
│   ├── util/           # Utility functions
│   ├── styles/         # CSS and styling
│   ├── type/           # TypeScript types
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
│   └── entry-server.jsx # SSR entry
├── public/             # Static assets
├── scripts/            # Build and utility scripts
│   ├── generate-certs.sh
│   ├── trust-cert.sh
│   └── untrust-cert.sh
├── dist/               # Build output
├── index.html
├── package.json
└── README.md

```

## Features

- ✅ Modern React 18 with TypeScript
- ✅ HTTPS development environment with SSL certificates
- ✅ Form handling with React Hook Form and Zod validation
- ✅ API integration with Axios and React Query
- ✅ Client-side and Server-side rendering support
- ✅ Routing with React Router v6
- ✅ Responsive design with TailwindCSS
- ✅ Analytics integration (Vercel & Google Analytics 4)
- ✅ Performance optimized with code splitting
- ✅ PWA support with service workers
- ✅ Cookie consent management
- ✅ SEO optimized with React Helmet

## Environment Variables

All environment variables should be placed in `config/.env.development.local` for development.

### Required Variables
- `NODE_ENV` - Environment (development/production)
- `DEV_HTTPS` - Enable HTTPS (true/false)
- `API_URL` - Backend API URL
- `PORT` - Development server port (default: 5001)

### Optional Variables
- `SKIP_BACKEND_CHECK` - Skip backend health check
- `JWT_SECRET` - JWT secret for token validation
- `CORS_ORIGIN` - CORS origin URL
- `ENABLE_DEV_TOOLS` - Enable React DevTools
- `REDUCE_LOGGING` - Reduce console logging

See `config/.env` for a complete list of available variables.

## Troubleshooting

### SSL Certificate Issues

**Problem:** Browser shows "Your connection is not private" or `ERR_CERT_AUTHORITY_INVALID`

**Solution:**
1. Generate certificates: `npm run certs:generate`
2. Trust the certificate: `npm run certs:trust`
3. Completely quit browser (Cmd+Q) and reopen
4. If still not working, try removing and re-trusting:
   ```bash
   npm run certs:untrust
   npm run certs:trust
   ```

**Alternative:** Click "Advanced" → "Proceed to localhost (unsafe)" in your browser

### Port Already in Use

**Problem:** Port 5001 is already in use

**Solution:**
```bash
npm run kill:port
# or manually
lsof -ti:5001 | xargs kill -9
```

### HMR/Hot Reload Not Working

**Problem:** Changes not reflecting in browser

**Solution:**
1. Check if WebSocket connection is working (should use `wss://` for HTTPS)
2. Try clearing browser cache and hard reload (Cmd+Shift+R)
3. Restart the dev server

### API Connection Issues

**Problem:** Cannot connect to backend API

**Solution:**
1. Verify backend is running on the configured API_URL
2. Check CORS settings in backend
3. Verify SSL certificates are trusted
4. Check API status: `npm run dev:api:status`

## Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory. For SSR builds, server assets will be in `dist/server/`.

## Deployment

The application is configured for deployment on Vercel with:
- Automatic SSL certificate handling
- Analytics and speed insights
- Server-side rendering support
- Environment variable management

See `vercel.json` for deployment configuration.

## Contributing

1. Create a new branch for your feature
2. Make your changes following the code style
3. Run tests and linting: `npm run test && npm run lint`
4. Submit a pull request

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Security

We take security seriously. Please review our [Security Policy](SECURITY.md) for reporting vulnerabilities and security-related information.

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities. Instead, email security@packmovego.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## License

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited. 

For licensing inquiries, please contact: support@packmovego.com

---

**PackMoveGo** - Professional Moving Services Platform  
Version 0.1.0 | © 2025 PackMoveGo. All rights reserved.
