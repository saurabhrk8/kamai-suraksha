#!/bin/bash

echo "🔧 Retrieving Existing Cognito Domain"
echo "===================================="

# --- CONFIGURATION ---
USER_POOL_ID="eu-west-2_Xbm29eLke"
REGION="eu-west-2"
AUTH_CONFIG_FILE="src/config/auth.js"
# ---------------------

# 1. Retrieve the domain configuration from the User Pool
# If a custom domain exists, this returns the custom domain. If a Cognito domain exists, it returns the prefix.
DOMAIN_INFO=$(aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query "UserPool.Domain" \
    --output text 2>/dev/null)

# 2. Check if a domain prefix was found
if [ -n "$DOMAIN_INFO" ] && [ "$DOMAIN_INFO" != "None" ]; then
    
    # 3. Construct the FULL_DOMAIN (e.g., if prefix is 'abc', domain is 'abc.auth.region.amazoncognito.com')
    FULL_DOMAIN="$DOMAIN_INFO.auth.$REGION.amazoncognito.com"
    
    echo "✅ Domain found and retrieved: $FULL_DOMAIN"
    
    # 4. Determine SED syntax for OS compatibility
    # Use the 's' (substitute) command which is more reliable than 'c' (change)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        SED_INPLACE='-i ""'
    else
        SED_INPLACE='-i'
    fi

    # 5. Safely update the 'domain' constant in src/config/auth.js
    # The pattern: s/Search Pattern/Replacement/g
    # We use a non-conflicting delimiter '|' instead of '/'
    
    # The search pattern targets the existing domain string inside single quotes.
    # It replaces everything between 'domain: ' and the next comma.
    # Note: Use four spaces for indentation to match your file style.
    sed $SED_INPLACE "s|    domain: '.*',|    domain: '$FULL_DOMAIN',|" "$AUTH_CONFIG_FILE"

    echo "✅ Updated $AUTH_CONFIG_FILE with the existing domain: $FULL_DOMAIN"
    echo "🎉 Your clean custom auth setup should now be configured correctly."

else
    echo "❌ No Cognito Hosted UI domain found or retrieval failed."
    # Fallback to the default (which is what failed in your attempt, but is a valid format)
    DEFAULT_DOMAIN="$USER_POOL_ID.auth.$REGION.amazoncognito.com"
    echo "Falling back to the default format: $DEFAULT_DOMAIN"
    
    # Use the same safe sed command for the fallback
    if [[ "$OSTYPE" == "darwin"* ]]; then
        SED_INPLACE='-i ""'
    else
        SED_INPLACE='-i'
    fi
    sed $SED_INPLACE "s|    domain: '.*',|    domain: '$DEFAULT_DOMAIN',|" "$AUTH_CONFIG_FILE"
    echo "Updated $AUTH_CONFIG_FILE with default domain."
fi

echo "===================================="