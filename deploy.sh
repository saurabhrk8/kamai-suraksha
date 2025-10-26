#!/bin/bash

echo "⏳ Wait and Retry Domain Creation"
echo "==============================="

USER_POOL_ID="eu-west-2_Xbm29eLke"
REGION="eu-west-2"

# Wait for deletion to propagate
echo "Waiting for domain deletion to propagate..."
for i in {1..5}; do
    echo "Check $i/5..."
    
    CURRENT_DOMAIN=$(aws cognito-idp describe-user-pool \
        --user-pool-id $USER_POOL_ID \
        --region $REGION \
        --query 'UserPool.Domain' \
        --output text 2>/dev/null)
    
    if [ "$CURRENT_DOMAIN" = "None" ] || [ -z "$CURRENT_DOMAIN" ]; then
        echo "✅ No domain configured - ready to create new one"
        break
    else
        echo "⏳ Domain still exists: $CURRENT_DOMAIN"
        if [ $i -lt 5 ]; then
            echo "Waiting 30 seconds..."
            sleep 30
        fi
    fi
done

# Try to create new domain
echo ""
echo "Creating new domain..."
NEW_DOMAIN="kamaisuraksha$(date +%s)"

if aws cognito-idp create-user-pool-domain \
    --domain "$NEW_DOMAIN" \
    --user-pool-id $USER_POOL_ID \
    --region $REGION; then
    
    FULL_DOMAIN="$NEW_DOMAIN.auth.eu-west-2.amazoncognito.com"
    echo ""
    echo "✅ Successfully initiated domain creation: $FULL_DOMAIN"
    
    # Update auth.js (CRITICALLY REVISED FOR MACOS)
    AUTH_FILE="src/config/auth.js"
    if [ -f "$AUTH_FILE" ]; then
        sed -i '' "s|domain: '.*'|domain: '$FULL_DOMAIN'|" "$AUTH_FILE"
        echo "✅ Updated $AUTH_FILE with new domain"
    else
        echo "⚠️ WARNING: $AUTH_FILE not found. Please update the domain manually."
    fi
    
    echo ""
    echo "⚠️  FINAL STEP: You must wait 5-15 minutes for the domain to become ACTIVE."
    echo "New Domain URL: $FULL_DOMAIN"
    echo "Check status: aws cognito-idp describe-user-pool-domain --domain $NEW_DOMAIN --region $REGION"
    
else
    echo "❌ Still failed to create domain"
    echo "The old domain may still be in deletion process, or check IAM permissions."
fi