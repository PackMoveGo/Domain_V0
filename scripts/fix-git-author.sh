#!/bin/bash

# Fix Git Author for Vercel Deployment
# This script ensures the last commit has the correct author

set -e

echo "🔧 Fixing Git author for Vercel deployment..."

# Get current Git author
GIT_AUTHOR_NAME=$(git config user.name || echo "Pack Move GO")
GIT_AUTHOR_EMAIL=$(git config user.email || echo "support@packmovego.com")

echo "📝 Setting Git author to: $GIT_AUTHOR_NAME <$GIT_AUTHOR_EMAIL>"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository!"
    exit 1
fi

# Get the last commit hash
LAST_COMMIT=$(git rev-parse HEAD)
LAST_AUTHOR=$(git log -1 --pretty=format:"%an <%ae>")

echo "📋 Last commit author: $LAST_AUTHOR"
echo "📋 Last commit hash: $LAST_COMMIT"

# Check if author needs to be fixed
if [ "$LAST_AUTHOR" != "$GIT_AUTHOR_NAME <$GIT_AUTHOR_EMAIL>" ]; then
    echo "⚠️  Last commit author doesn't match current Git config"
    echo "💡 You may need to:"
    echo "   1. Amend the last commit: git commit --amend --author=\"$GIT_AUTHOR_NAME <$GIT_AUTHOR_EMAIL>\" --no-edit"
    echo "   2. Or ensure support@packmovego.com is added to your Vercel account"
    echo "   3. Or use GitHub integration for automatic deployments"
else
    echo "✅ Last commit author matches Git config"
fi

