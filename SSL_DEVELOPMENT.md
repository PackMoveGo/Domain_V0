# SSL/HTTPS Development Setup

## ✅ Configuration Complete

The development environment is now configured to run with SSL/HTTPS enabled.

## Running with HTTPS

### Frontend (Port 5001)
```bash
npm run dev
```

This will start the frontend on:
- **HTTPS**: https://localhost:5001

The `VITE_DEV_HTTPS=true` flag is now enabled by default in the dev script.

### Backend (Ports 3000 & 3001)
Make sure the backend is running with SSL certificates:

```bash
cd ../../SSD
npm run dev
```

This should start:
- **Gateway**: https://localhost:3000
- **Server**: https://localhost:3001

## Environment Configuration

Your `.env.development.local` should have:
```bash
VITE_DEV_HTTPS=true
VITE_API_URL=https://localhost:3000
```

## SSL Certificates

Certificates are located at:
```
config/certs/
├── localhost-key.pem
└── localhost.pem
```

### If Certificates Don't Exist
Generate them:
```bash
npm run certs:generate
```

### Trust the Certificate (macOS)
```bash
npm run certs:trust
```

### Untrust the Certificate
```bash
npm run certs:untrust
```

## Complete Development URLs

When everything is running:

| Service | URL | Port |
|---------|-----|------|
| Frontend | https://localhost:5001 | 5001 |
| Backend Gateway | https://localhost:3000 | 3000 |
| Backend Server | https://localhost:3001 | 3001 |

## Browser Security Warning

First time accessing https://localhost:5001, your browser will show a security warning. This is normal for self-signed certificates.

**To proceed:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"

Or trust the certificate using `npm run certs:trust`.

## Vite Proxy Configuration

The frontend proxies API calls to avoid CORS issues:
- Frontend: `https://localhost:5001`
- API requests: `/api/*` → proxied to → `https://localhost:3000/*`

This is configured in `config/vite.config.csr.ts`.

## Testing HTTPS

```bash
# Start backend
cd ../../SSD
npm run dev

# Start frontend (in another terminal)
cd NODES/views/desktop/domain_V0
npm run dev

# Visit
open https://localhost:5001
```

Everything should now run with SSL/HTTPS! 🔒

