#!/bin/bash

echo "🔍 Checking What Domain Actually Exists"
echo "======================================"

USER_POOL_ID="eu-west-2_Xbm29eLke"
REGION="eu-west-2"

# Check what domain is configured in the user pool
echo "1. Checking configured domain..."
CONFIGURED_DOMAIN=$(aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.Domain' \
    --output text 2>/dev/null)

echo "Configured domain: $CONFIGURED_DOMAIN"

# List all domains for this user pool
echo ""
echo "2. Checking domain details..."
if [ "$CONFIGURED_DOMAIN" != "None" ] && [ -n "$CONFIGURED_DOMAIN" ]; then
    aws cognito-idp describe-user-pool-domain \
        --domain "$CONFIGURED_DOMAIN" \
        --region $REGION 2>/dev/null || echo "Domain details not found"
else
    echo "No domain configured in user pool"
fi

# Test DNS resolution for different formats
echo ""
echo "3. Testing DNS resolution..."
DOMAIN_FORMATS=(
    "eu-west-2-xbm29elke.auth.eu-west-2.amazoncognito.com"
    "eu-west-2_xbm29elke.auth.eu-west-2.amazoncognito.com"
    "$USER_POOL_ID.auth.$REGION.amazoncognito.com"
)

for DOMAIN in "${DOMAIN_FORMATS[@]}"; do
    echo ""
    echo "Testing: $DOMAIN"
    
    # DNS test
    if nslookup "$DOMAIN" >/dev/null 2>&1; then
        echo "✅ DNS resolves"
        
        # HTTP test
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$DOMAIN/.well-known/jwks.json" 2>/dev/null || echo "000")
        echo "HTTP Status: $HTTP_STATUS"
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo "🎯 THIS DOMAIN WORKS: $DOMAIN"
            WORKING_DOMAIN="$DOMAIN"
            break
        fi
    else
        echo "❌ DNS does not resolve"
    fi
done

if [ -n "$WORKING_DOMAIN" ]; then
    echo ""
    echo "✅ FOUND WORKING DOMAIN: $WORKING_DOMAIN"
    echo "Update your auth.js with this domain!"
else
    echo ""
    echo "❌ No working domain found. Need to create one."
fi
