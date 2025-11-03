# Secure Development Server

This directory contains scripts for running a secure development environment with HTTP to HTTPS redirects.

## Features

- 🔒 **HTTP to HTTPS redirects** in local development
- 🚨 **Status 300** response on redirect failures
- 🔐 **Self-signed SSL certificates** for localhost
- 📊 **Health check endpoint** at `/health`

## Quick Start

### 1. Generate SSL Certificates

```bash
npm run certs:generate
```

This creates self-signed certificates in `config/certs/`:
- `localhost-key.pem` - Private key
- `localhost.pem` - Certificate

### 2. Start Secure Development Server

```bash
npm run dev:secure
```

This starts:
- **HTTP server** on port 5000 (redirects to HTTPS)
- **HTTPS server** on port 5001 (main application)

### 3. Access Your Application

- **Main app**: https://localhost:5001
- **HTTP redirect**: http://localhost:5000 → https://localhost:5001
- **Health check**: https://localhost:5001/health

## How It Works

### HTTP to HTTPS Redirect

When you access `http://localhost:5000`:

1. **Request received** on HTTP port 5000
2. **Redirect middleware** detects HTTP protocol
3. **301 redirect** sent to `https://localhost:5001`
4. **Browser follows** redirect to HTTPS

### Error Handling

If redirect fails (e.g., HTTPS server down):

```json
{
  "error": "Redirect failed",
  "message": "Unable to redirect to HTTPS",
  "code": "ECONNREFUSED",
  "timestamp": "2025-08-12T22:45:00.000Z"
}
```

**Status**: 300 (Multiple Choices)

### Health Check

Access `/health` to check server status:

```json
{
  "status": "ok",
  "protocol": "https",
  "timestamp": "2025-08-12T22:45:00.000Z"
}
```

## Configuration

### Ports

- **HTTP**: 5000 (redirects)
- **HTTPS**: 5001 (main app)

### Certificates

- **Location**: `config/certs/`
- **Validity**: 365 days
- **Type**: Self-signed
- **Subject**: localhost

## Troubleshooting

### Certificate Issues

```bash
# Regenerate certificates
rm -rf config/certs
npm run certs:generate
```

### Port Conflicts

If ports are in use:

```bash
# Check what's using the ports
lsof -i :5000
lsof -i :5001

# Kill processes if needed
kill -9 <PID>
```

### Browser Security Warnings

Self-signed certificates trigger browser warnings:

1. **Chrome**: Click "Advanced" → "Proceed to localhost"
2. **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
3. **Safari**: Click "Show Details" → "visit this website"

## Development Workflow

### Regular Development

```bash
npm run dev  # Standard Vite dev server
```

### Secure Development

```bash
npm run dev:secure  # With HTTP→HTTPS redirects
```

### Production

```bash
npm run build
npm run start
```

## Security Notes

- **Self-signed certificates** are for development only
- **Never use** in production
- **Browser warnings** are expected and safe to ignore locally
- **HTTP redirects** only work in development environment
