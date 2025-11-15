// Environment variables utility
// Uses config module for clean access to environment variables

import { devMode, enableDevTools } from '@config/env.config';

export const NODE_ENV=devMode || process.env.NODE_ENV || 'development';

// Get ENABLE_DEV_TOOLS from config
export const ENABLE_DEV_TOOLS=enableDevTools;