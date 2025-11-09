# Configuration Files

All configuration files for this project are located in the `config/` directory.

## Files in this directory:

- **eslint.config.js** - ESLint configuration (ESLint 9 flat config)
- **vite.config.csr.ts** - Vite config for Client-Side Rendering
- **vite.config.ssr.ts** - Vite config for Server-Side Rendering
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.mjs** - PostCSS configuration
- **cors.ts** - CORS configuration
- **contentSecurityPolicy.ts** - Content Security Policy configuration
- **.env.development.local** - Development environment variables
- **.env.production.local** - Production environment variables
- **.npmrc** - npm configuration

## Important Notes:

### `.npmrc` Location
**Important**: npm reads `.npmrc` from the project root by default, not from subdirectories. 

Since this file is in `config/`, npm will not automatically read it. To use these npm settings, you have two options:

**Option 1: Create a symlink in root** (recommended)
```bash
ln -s config/.npmrc .npmrc
```

**Option 2: Copy to root when needed**
```bash
cp config/.npmrc .npmrc
```

**Option 3: Use npm config commands**
The settings can be applied via npm config commands in package.json scripts if needed.

### Environment Files
Environment files (`.env.development.local`, `.env.production.local`) are loaded by Vite based on the `NODE_ENV` environment variable. They should remain in the `config/` directory as the Vite configs reference them from here.

### ESLint Config
The ESLint config is referenced in package.json scripts with `--config config/eslint.config.js`.

### Vite Configs
All Vite-related scripts in package.json use `--config config/vite.config.*.ts`.

### TypeScript Config
TypeScript uses `--project config/tsconfig.json` as specified in package.json.

