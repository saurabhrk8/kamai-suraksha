#!/bin/bash

echo "🚀 Complete ConnectException Fix"
echo "==============================="

USER_POOL_ID="eu-west-2_Xbm29eLke"
REGION="eu-west-2"

# Step 1: Create working domain
echo "1. Creating working Cognito domain..."
# Use a simple prefix for better visibility
DOMAIN_PREFIX="ks$(date +%s)" 

# Define the full URI structure for output
WORKING_DOMAIN_URL="https://$DOMAIN_PREFIX.auth.$REGION.amazoncognito.com"

if aws cognito-idp create-user-pool-domain \
    --domain "$DOMAIN_PREFIX" \
    --user-pool-id $USER_POOL_ID \
    --region $REGION; then
    
    WORKING_DOMAIN="$DOMAIN_PREFIX.auth.eu-west-2.amazoncognito.com"
    echo "✅ Created domain: $WORKING_DOMAIN"
    
    # Update auth.js (Frontend)
    sed -i '' "s|domain: '.*'|domain: '$WORKING_DOMAIN'|" src/config/auth.js
    echo "✅ Updated auth.js"
    
else
    echo "❌ Could not create domain. Using default."
    DEFAULT_DOMAIN="eu-west-2-xbm29elke.auth.eu-west-2.amazoncognito.com"
    sed -i '' "s|domain: '.*'|domain: '$DEFAULT_DOMAIN'|" src/config/auth.js
    WORKING_DOMAIN="$DEFAULT_DOMAIN"
fi

# Determine the final URL used for the Lambda constant
FINAL_LAMBDA_URL="https://$WORKING_DOMAIN"

# Step 2: Build and deploy frontend
echo ""
echo "2. Building and deploying frontend..."
npm run build
aws s3 sync dist/ s3://kamaisuraksha-frontend-1761239505 --delete

# Step 3: Invalidate CloudFront
echo ""
echo "3. Invalidating CloudFront..."
aws cloudfront create-invalidation \
    --distribution-id E1XSXE57VVPJR7 \
    --paths "/*" > /dev/null

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "Domain used for Frontend: $WORKING_DOMAIN"
echo "⬇️  LAMBDA CONSTANT VALUE TO USE ⬇️"
echo "   $FINAL_LAMBDA_URL"
echo ""
echo "⚠️  If new domain was created, wait 10-15 minutes before testing."
echo "💡 Now, update TokenExchangeHandler.java with the value above!"

# Export for easy copy-paste
echo "LAMBDA_DOMAIN_URL=$FINAL_LAMBDA_URL"