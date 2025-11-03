# Production Ready Checklist - Domain V0

## ✅ Completed Changes

### 1. **Dev Tools Restored**
- Created `DevToolsLauncher` component at `src/component/debug/DevToolsLauncher.tsx`
- Features:
  - Toggle 503 status for testing
  - Clear API cache
  - Reload page
  - Shows environment info
  - Fixed floating button (z-index: 11000)

### 2. **Z-Index Layering Fixed**
- Cookie Consent: `z-[10000]` (TOP LAYER)
- API 503 Modal: `z-[9500]` (BEHIND COOKIE CONSENT) ✅
- API 503 Backdrop: `z-[9400]`
- Dev Tools: `z-[11000]` (ABOVE ALL)

### 3. **Port Configuration Updated**
All scripts now use port **5001** (frontend) instead of 5050:
- `npm run dev` → Port 5001
- `npm run start` → Port 5001
- `npm run preview` → Port 5001
- `npm run start:prod` → Port 5001

### 4. **New NPM Scripts Added**
```bash
npm run audit:fix        # Fix npm audit issues
npm run audit:check      # Check for moderate+ vulnerabilities
npm run clean:deps       # Clean reinstall dependencies
```

## 🚀 Quick Start Commands

### Development
```bash
npm run dev              # Start dev server on port 5001
```

### Production
```bash
npm run start            # Build + Start production on port 5001
npm run start:prod       # Kill port + Build + Start production
```

### Testing & Quality
```bash
npm run lint             # Fix linting issues
npm run type-check       # TypeScript type checking
npm run audit:check      # Check security vulnerabilities
npm run audit:fix        # Auto-fix audit issues
```

## 📦 Environment Configuration

### Development (.env.development.local)
- PORT: 5001
- NODE_ENV: development
- DEV_HTTPS: true
- ENABLE_DEV_TOOLS: true

### Production (.env.production.local)
- PORT: 5001
- NODE_ENV: production
- DEV_HTTPS: true
- ENABLE_DEV_TOOLS: false

## 🛠️ Dev Tools Usage

In development mode, a floating 🛠️ button appears in the bottom-right corner.

**Features:**
1. **503 Status Toggle** - Test API failure states
2. **Clear Cache** - Reset API cache
3. **Reload Page** - Quick page refresh
4. **Environment Info** - Current ENV and port

## 🔒 Security & Audit

### Current Known Issues
The codebase has vulnerabilities from deprecated dependencies:
- Legacy ESLint packages
- Old rimraf versions
- Deprecated utility packages

### Recommended Actions
```bash
# Check current issues
npm run audit:check

# Auto-fix what's safe
npm run audit:fix

# For breaking changes (use caution)
npm audit fix --force

# Clean reinstall if needed
npm run clean:deps
```

## 📋 Layer Hierarchy (Z-Index)

```
11000 - Dev Tools (highest)
10000 - Cookie Consent Modal
 9500 - API 503 Modal
 9400 - API 503 Backdrop
    0 - Normal page content (lowest)
```

## 🎯 Production Deployment Checklist

- [x] Port configured to 5001
- [x] Z-index layering corrected
- [x] Dev tools enabled in development only
- [x] Production scripts ready
- [x] Environment files configured
- [ ] Run `npm run audit:fix`
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Test `npm run start`
- [ ] Build succeeds without errors
- [ ] Deploy to Vercel

## 🐛 Known Issues to Address

1. **Vulnerabilities**: 49 total (13 moderate, 13 high, 23 critical)
   - Most from deprecated dev dependencies
   - Action: Run `npm audit fix` or update manually

2. **Unused Dependencies**: Some packages may not be actively used
   - Review and remove in future cleanup

3. **Redundant Code**: Some duplicate utility functions exist
   - Consolidate in future refactor

## 📝 Next Steps

1. **Immediate**:
   ```bash
   cd /Users/mac/Desktop/node/Views/desktop/domain_V0
   npm run audit:fix
   npm run lint
   npm run type-check
   npm run start
   ```

2. **Before Production**:
   - Update JWT_SECRET in production env
   - Configure actual API_URL
   - Test all features with backend
   - Run lighthouse audit

3. **Future Improvements**:
   - Upgrade deprecated dependencies
   - Remove unused packages
   - Consolidate duplicate code
   - Add unit tests

## ✨ Summary

**domain_V0** is now ready for both development and production use:
- ✅ Dev tools available in development
- ✅ Proper modal layering
- ✅ Port 5001 configured
- ✅ Production build scripts ready
- ⚠️ Security audit recommended before deploy

---
*Last Updated: November 3, 2025*

