# ESLint 9 Migration Guide

## Changes Made

### 1. Updated ESLint Plugins for ESLint 9 Compatibility

- **eslint-plugin-react-hooks**: `^4.6.2` → `^5.1.0` (ESLint 9 compatible)
- **typescript-eslint**: Migrated from separate `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to unified `typescript-eslint` package (v8.18.2)

### 2. Updated ESLint Config Format

The `eslint.config.js` has been updated to use the new flat config format required by ESLint 9:

**Before (ESLint 8 format):**
```js
export default [
  js.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint,
      // ...
    }
  }
];
```

**After (ESLint 9 flat config):**
```js
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // config
  }
);
```

## Installation

Run these commands to install the updated dependencies:

```bash
cd /Users/mac/Desktop/cnvm11xx/NODES/views/desktop/domain_V0

# Remove old dependencies
rm -rf node_modules package-lock.json

# Install updated dependencies
npm install
```

## Verification

After installation, verify everything works:

```bash
# Check ESLint version
npx eslint --version

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Breaking Changes

1. **Flat Config**: ESLint 9 uses a new flat config format. The config file has been updated accordingly.

2. **TypeScript ESLint**: The unified `typescript-eslint` package replaces the separate plugin and parser packages.

3. **Plugin Compatibility**: All React ESLint plugins have been updated to versions compatible with ESLint 9.

## Troubleshooting

If you encounter issues:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for peer dependency warnings:**
   ```bash
   npm install --dry-run
   ```

## References

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [typescript-eslint v8 Migration](https://typescript-eslint.io/docs/linting/typed-linting/migration)

