#!/bin/bash

# Remove the trusted localhost SSL certificate from macOS keychain
# Use this if you need to regenerate certificates or remove trust

echo "🗑️  Removing localhost SSL certificate from System keychain..."
echo ""
echo "⚠️  You will be prompted for your password (sudo required)"
echo ""

# Find and remove the certificate
sudo security delete-certificate -c "localhost" -t /Library/Keychains/System.keychain

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificate removed successfully!"
    echo ""
    echo "📌 To regenerate and trust a new certificate:"
    echo "   1. npm run certs:generate"
    echo "   2. npm run certs:trust"
else
    echo ""
    echo "⚠️  Certificate not found or already removed"
fi

