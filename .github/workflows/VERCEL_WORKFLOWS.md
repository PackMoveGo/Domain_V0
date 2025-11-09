# 🚀 Vercel Deployment Workflow

This repository contains a single, optimized GitHub Actions workflow for deploying to Vercel.

## 📋 Workflow

### **Vercel Deployment** (`vercel.yml`)
**Full-featured deployment workflow with comprehensive testing and health checks.**

#### Features:
- ✅ **Type checking** and linting
- ✅ **Build testing** before deployment
- ✅ **Artifact caching** for faster builds
- ✅ **Health checks** after deployment
- ✅ **Pull request comments** with deployment URLs
- ✅ **Manual deployment** with environment selection
- ✅ **Deployment notifications**
- ✅ **Uses correct build command** (`npm run build:csr`)
- ✅ **Uses Node.js 22** (matches Vercel settings)

#### Triggers:
- Push to `main` branch
- Pull requests to `main` branch
- Manual dispatch (with environment selection)

#### Jobs:
1. **Build and Test** - Type check, lint, and build with `npm run build:csr`
2. **Deploy** - Deploy to Vercel using Vercel CLI
3. **Health Check** - Verify deployment health
4. **Notify** - Final status notification

## 🔧 Setup Requirements

### Required Secrets:
```yaml
VERCEL_TOKEN: Your Vercel API token
VERCEL_ORG_ID: Your Vercel organization ID
VERCEL_PROJECT_ID: Your Vercel project ID
VITE_API_URL_PROD: Production API URL
VITE_APP_NAME: Application name
VITE_APP_VERSION: Application version
VITE_APP_DOMAIN: Application domain
```

### How to Get Secrets:
1. **VERCEL_TOKEN**: Generate in Vercel dashboard → Settings → Tokens
2. **VERCEL_ORG_ID**: Found in Vercel dashboard URL or project settings
3. **VERCEL_PROJECT_ID**: Found in project settings or `.vercel/project.json`

## 🎯 Usage

### Automatic Deployment:
```bash
# Push to main branch triggers automatic deployment
git add .
git commit -m "Your changes"
git push
```

### Manual Deployment:
1. Go to **Actions** tab in GitHub
2. Select **Vercel Deployment** workflow
3. Click **Run workflow**
4. Choose environment (production/preview)
5. Click **Run workflow**

## 📊 Deployment Status

### Production URLs:
- **Live Site**: `https://domainv0-pack-move-go1.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/pack-move-go1/domain_v0`
- **Latest Deployment**: Check Vercel dashboard for current deployment URL

### Monitoring:
- **GitHub Actions**: Check Actions tab for workflow status
- **Vercel Dashboard**: Monitor deployments and performance
- **Health Checks**: Automatic verification after deployment

## 🔄 Workflow Details

The single workflow provides:
- **Type Checking**: ✅ Full TypeScript validation
- **Linting**: ✅ ESLint code quality checks
- **Health Checks**: ✅ Automatic deployment verification
- **PR Comments**: ✅ Automatic deployment URL comments on PRs
- **Manual Environment**: ✅ Choose production or preview
- **Build Command**: ✅ Uses `npm run build:csr` (CSR build)
- **Node Version**: ✅ Node.js 22.x (matches Vercel settings)
- **Speed**: ⏱️ 3-5 minutes (with caching)
- **Reliability**: 🛡️ High (comprehensive testing before deployment)

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check TypeScript errors: `npm run type-check`
   - Check linting errors: `npm run lint`
   - Verify all dependencies are installed

2. **Deployment Failures**:
   - Verify Vercel secrets are correct
   - Check Vercel project settings
   - Ensure Vercel CLI is properly configured

3. **Health Check Failures**:
   - Wait for deployment to fully propagate
   - Check Vercel dashboard for deployment status
   - Verify domain configuration

### Debug Commands:
```bash
# Local build test (CSR)
npm run build:csr

# Type checking
npm run type-check

# Linting
npm run lint

# Manual Vercel deployment
vercel --prod
```

## 📈 Performance

### Build Times:
- **Full Workflow**: ~3-5 minutes
- **Cache Hit**: ~30 seconds faster

### Optimization Tips:
- Use dependency caching (already configured)
- Keep node_modules in cache
- Minimize build artifacts
- Use parallel jobs where possible

---

**Note**: The workflow is configured for optimal performance and reliability. It uses the correct build command (`build:csr`) and Node.js version (22) to match Vercel project settings.
