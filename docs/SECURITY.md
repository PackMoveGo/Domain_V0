# Security Policy

## Protected Files

The following files contain sensitive information and are **NEVER** committed to Git:

### Environment Files
- `.env.development.local`
- `.env.production.local`
- `.env.test.local`
- Any `.env*.local` files

These files contain:
- JWT secrets
- API keys
- Database credentials
- Internal URLs and ports

### Certificate Files
- `config/certs/*.pem`
- Any `*.pem` files

These files contain SSL/TLS certificates for local development.

## Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp config/.env.example config/.env.development.local
   ```

2. **Update the sensitive values:**
   - Change `JWT_SECRET` to a strong random string
   - Update `API_KEY_FRONTEND` with your actual API key
   - Modify URLs and ports as needed

3. **For production:**
   ```bash
   cp config/.env.example config/.env.production.local
   ```
   - Use **different** secrets than development
   - Update `SIGNIN_HOST` to your production domain
   - Set `ENABLE_DEV_TOOLS=false`

## Vercel Deployment

Environment variables for Vercel should be set in the Vercel Dashboard:
- Project Settings → Environment Variables
- Add all variables from `.env.production.local`

**NEVER** commit production secrets to Git!

## SSL Certificates

Generate local SSL certificates for HTTPS development:
```bash
npm run certs:generate
```

Certificates are stored in `config/certs/` and are automatically ignored by Git.

## Reporting Security Issues

If you discover a security vulnerability, please email: security@packmovego.com

Do **NOT** open public issues for security vulnerabilities.

