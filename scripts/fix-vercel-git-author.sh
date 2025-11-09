#!/bin/bash

# Fix Git Author to Match Vercel Account
# This script helps identify and fix the Git author mismatch issue

set -e

echo "🔍 Diagnosing Vercel Git Author Issue..."
echo ""

# Get current Git author
CURRENT_GIT_NAME=$(git config user.name)
CURRENT_GIT_EMAIL=$(git config user.email)
CURRENT_VERCEL_USER=$(vercel whoami 2>&1 | grep -v "Vercel CLI" | grep -v "^$" | head -1)

echo "📋 Current Configuration:"
echo "   Git Name:  $CURRENT_GIT_NAME"
echo "   Git Email: $CURRENT_GIT_EMAIL"
echo "   Vercel User: $CURRENT_VERCEL_USER"
echo ""

# Check last commit author
LAST_COMMIT_AUTHOR=$(git log -1 --pretty=format:"%an <%ae>")
echo "📋 Last Commit Author: $LAST_COMMIT_AUTHOR"
echo ""

echo "💡 Solution Options:"
echo ""
echo "Option 1: Add Git Email to Vercel Account (Recommended)"
echo "   1. Go to https://vercel.com/dashboard → Settings → Account"
echo "   2. Add '$CURRENT_GIT_EMAIL' as an email address"
echo "   3. Verify the email if required"
echo "   4. Ensure you have access to the 'PackMoveGO' team"
echo ""

echo "Option 2: Update Git Author to Match Vercel Account"
echo "   To find your Vercel account email:"
echo "   1. Go to https://vercel.com/dashboard → Settings → Account"
echo "   2. Check your primary email address"
echo "   3. Then run:"
echo "      git config user.email \"your-vercel-email@example.com\""
echo "      git config user.name \"Your Name\""
echo "   4. Amend the last commit:"
echo "      git commit --amend --author=\"Your Name <your-vercel-email@example.com>\" --no-edit"
echo ""

echo "Option 3: Use GitHub Integration (Easiest)"
echo "   1. Go to Vercel Dashboard → Your Project → Settings → Git"
echo "   2. Connect your GitHub repository"
echo "   3. Push to GitHub - Vercel will deploy automatically"
echo "   4. This bypasses the Git author check entirely"
echo ""

echo "Option 4: Deploy with Vercel Token (Advanced)"
echo "   If you have a Vercel token with team access:"
echo "   vercel --prod --token YOUR_TOKEN --scope pack-move-go1"
echo ""

echo "🔧 Quick Fix: Would you like to try amending the last commit?"
echo "   This will update the commit author to match your current Git config."
read -p "   Amend last commit? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Amending last commit with current Git author..."
    git commit --amend --author="$CURRENT_GIT_NAME <$CURRENT_GIT_EMAIL>" --no-edit
    echo "✅ Commit amended!"
    echo ""
    echo "⚠️  Note: You'll need to force push if you've already pushed this commit:"
    echo "   git push --force-with-lease"
    echo ""
    echo "💡 However, you still need to ensure '$CURRENT_GIT_EMAIL' is added to your Vercel account"
    echo "   for the deployment to work. See Option 1 above."
else
    echo "⏭️  Skipping commit amendment."
fi

echo ""
echo "📖 For more details, see: VERCEL_DEPLOYMENT_FIX.md"

