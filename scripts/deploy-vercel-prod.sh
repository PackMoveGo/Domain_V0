#!/bin/bash

# Deploy to Vercel Production with Git Author Fix
# This script ensures the Git author is properly set before deployment
# Note: Build should be done before calling this script

set -e

echo "🚀 Deploying PackMoveGo to Vercel Production..."

# Get Git author information
GIT_AUTHOR_NAME=$(git config user.name || echo "Pack Move GO")
GIT_AUTHOR_EMAIL=$(git config user.email || echo "support@packmovego.com")
GIT_COMMITTER_NAME=$(git config user.name || echo "Pack Move GO")
GIT_COMMITTER_EMAIL=$(git config user.email || echo "support@packmovego.com")

echo "📝 Git Author: $GIT_AUTHOR_NAME <$GIT_AUTHOR_EMAIL>"

# Ensure Git author is set for this session
export GIT_AUTHOR_NAME
export GIT_AUTHOR_EMAIL
export GIT_COMMITTER_NAME
export GIT_COMMITTER_EMAIL

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Verify build exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory not found! Please run 'npm run build:csr' first."
    exit 1
fi

echo "✅ Build directory found!"

# Deploy to Vercel with scope flag
echo "🚀 Deploying to Vercel Production with team scope..."
if vercel --prod --scope pack-move-go1; then
    echo "✅ Deployment completed!"
    echo "🌐 Your app is now live on Vercel!"
    echo "📊 Check Vercel dashboard for deployment details"
else
    echo ""
    echo "❌ Deployment failed due to Git author access issue."
    echo ""
    echo "💡 Solutions:"
    echo "   1. Add $GIT_AUTHOR_EMAIL to your Vercel account:"
    echo "      → Go to https://vercel.com/dashboard → Settings → Account"
    echo "      → Add $GIT_AUTHOR_EMAIL as an email"
    echo ""
    echo "   2. Or use GitHub integration (recommended):"
    echo "      → Go to Vercel Dashboard → Project Settings → Git"
    echo "      → Connect GitHub repository for automatic deployments"
    echo ""
    echo "   3. Or match Git author to your Vercel account email:"
    echo "      → Run: vercel whoami (to see your Vercel account)"
    echo "      → Run: git config user.email \"your-vercel-email@example.com\""
    echo ""
    echo "📖 See VERCEL_DEPLOYMENT_FIX.md for detailed instructions"
    exit 1
fi

