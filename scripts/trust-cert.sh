#!/bin/bash

# Trust the localhost SSL certificate in macOS
# This script adds the certificate to the system keychain

CERT_FILE="config/certs/localhost.pem"

echo "🔐 Trusting localhost SSL certificate..."
echo ""
echo "This will:"
echo "  1. Add the certificate to your System keychain"
echo "  2. Mark it as trusted for SSL connections"
echo "  3. Eliminate browser security warnings"
echo ""
echo "⚠️  You will be prompted for your password (sudo required)"
echo ""

# Check if certificate exists
if [ ! -f "$CERT_FILE" ]; then
    echo "❌ Certificate not found at: $CERT_FILE"
    exit 1
fi

# Add certificate to system keychain
echo "📝 Adding certificate to System keychain..."
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificate trusted successfully!"
    echo ""
    echo "📌 Next steps:"
    echo "   1. Completely quit your browser (Cmd+Q)"
    echo "   2. Reopen your browser"
    echo "   3. Visit https://localhost:5001"
    echo "   4. You should see a secure connection with no warnings!"
    echo ""
    echo "🔍 To verify, look for a lock icon in the address bar"
else
    echo ""
    echo "❌ Failed to trust certificate"
    echo "   Make sure you entered your password correctly"
    exit 1
fi

