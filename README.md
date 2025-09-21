# Pack Move Go Movers Client

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)

This is the client-side application for Pack Move GO, a professional moving company. The application provides a user-friendly interface for customers to book moving services, track their moves, and manage their accounts.

## Tech Stack

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

## Project Structure

```
client/
├── config/         # Configuration files
├── network/        # API and network related code
├── public/         # Static assets
├── script/         # Build and utility scripts
├── src/           # Source code
└── ...
```

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

