#!/bin/bash

# Generate SSL certificates for local development
# This script creates self-signed certificates for localhost

CERT_DIR="config/certs"
KEY_FILE="$CERT_DIR/localhost-key.pem"
CERT_FILE="$CERT_DIR/localhost.pem"

echo "🔐 Generating SSL certificates for local development..."

# Create certs directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Check if certificates already exist
if [ -f "$KEY_FILE" ] && [ -f "$CERT_FILE" ]; then
    echo "✅ SSL certificates already exist"
    echo "   Key: $KEY_FILE"
    echo "   Cert: $CERT_FILE"
    echo ""
    echo "To regenerate certificates, delete the existing files and run this script again:"
    echo "   rm -rf $CERT_DIR"
    echo "   ./scripts/generate-certs.sh"
    exit 0
fi

# Generate self-signed certificate
echo "📝 Generating self-signed certificate..."
openssl req -x509 \
    -newkey rsa:4096 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -nodes \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1"

if [ $? -eq 0 ]; then
    echo "✅ SSL certificates generated successfully!"
    echo "   Key: $KEY_FILE"
    echo "   Cert: $CERT_FILE"
    echo ""
    echo "🔒 You can now run: npm run dev:secure"
    echo "   This will start a development server with HTTP to HTTPS redirects"
    echo ""
    echo "📝 Access your app at: https://localhost:5001"
    echo "   HTTP requests to http://localhost:5000 will be redirected to HTTPS"
else
    echo "❌ Failed to generate SSL certificates"
    echo "   Make sure OpenSSL is installed on your system"
    exit 1
fi
