#!/bin/bash

# deploy-to-aws-vite-fixed.sh
# Complete deployment script with all fixes and error handling

set -e  # Exit on any error

echo "🚀 Complete AWS S3 + CloudFront Deployment (Fixed)"
echo "=================================================="

# Configuration
PROJECT_NAME="kamaisuraksha"
REGION="eu-west-2"
BUCKET_NAME="${PROJECT_NAME}-frontend-$(date +%s)"
DISTRIBUTION_COMMENT="Kamaisuraksha Frontend Distribution"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check and retry commands
retry_command() {
    local cmd="$1"
    local description="$2"
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt: $description"
        if eval "$cmd"; then
            return 0
        else
            if [ $attempt -eq $max_attempts ]; then
                print_error "$description failed after $max_attempts attempts"
                return 1
            fi
            print_warning "$description failed, retrying in 5 seconds..."
            sleep 5
            ((attempt++))
        fi
    done
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    echo "Install from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

print_status "AWS CLI is configured"

# Get current user info
USER_ARN=$(aws sts get-caller-identity --query 'Arn' --output text)
USERNAME=$(echo $USER_ARN | cut -d'/' -f2)
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

print_info "User: $USERNAME"
print_info "Account: $ACCOUNT_ID"

# Check if we're in a React project
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from your React project root."
    exit 1
fi

if [ ! -f "src/App.js" ] && [ ! -f "src/App.jsx" ]; then
    print_error "This doesn't appear to be a React project. src/App.js or src/App.jsx not found."
    exit 1
fi

print_status "React project detected"

# Step 1: Create production configuration
echo ""
echo "📝 Step 1: Creating production configuration..."

mkdir -p src/config

cat > src/config/production.js << 'EOF'
export const PRODUCTION_CONFIG = {
  API_BASE_URL: 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod',
  COGNITO_DOMAIN: 'kamaisuraksha-auth.auth.eu-west-2.amazoncognito.com',
  CLIENT_ID: 'nrck33p87u8mhi68nmjenk8g1',
  USER_POOL_ID: 'eu-west-2_Xbm29eLke',
  REGION: 'eu-west-2',
  REDIRECT_URI: window.location.origin + '/callback',
  LOGOUT_URI: window.location.origin + '/logout'
};
EOF

cat > src/config/environment.js << 'EOF'
import { PRODUCTION_CONFIG } from './production';

const config = {
  development: {
    API_BASE_URL: 'https://jrzuzhs5t8.execute-api.eu-west-2.amazonaws.com/prod',
    COGNITO_DOMAIN: 'kamaisuraksha-auth.auth.eu-west-2.amazoncognito.com',
    CLIENT_ID: 'nrck33p87u8mhi68nmjenk8g1',
    USER_POOL_ID: 'eu-west-2_Xbm29eLke',
    REGION: 'eu-west-2',
    REDIRECT_URI: 'http://localhost:5173/callback',
    LOGOUT_URI: 'http://localhost:5173/logout'
  },
  production: PRODUCTION_CONFIG
};

const environment = import.meta.env.MODE || 'development';
export default config[environment];
EOF

print_status "Production configuration created"

# Step 2: Build React application
echo ""
echo "🔨 Step 2: Building React application for production..."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building application..."
npm run build

# Check for both build and dist directories (Vite uses dist)
BUILD_DIR=""
if [ -d "build" ]; then
    BUILD_DIR="build"
elif [ -d "dist" ]; then
    BUILD_DIR="dist"
else
    print_error "Build failed. Neither 'build' nor 'dist' directory found."
    exit 1
fi

print_status "React application built successfully (using $BUILD_DIR directory)"

# Step 3: Create S3 bucket with error handling
echo ""
echo "🪣 Step 3: Creating S3 bucket..."

# Try to create bucket, handle if it already exists
if aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null; then
    print_status "S3 bucket created: $BUCKET_NAME"
elif aws s3 ls s3://$BUCKET_NAME 2>/dev/null; then
    print_warning "Bucket already exists, using: $BUCKET_NAME"
else
    print_error "Failed to create bucket. Trying alternative name..."
    BUCKET_NAME="${PROJECT_NAME}-app-$(date +%s)"
    if aws s3 mb s3://$BUCKET_NAME --region $REGION; then
        print_status "Alternative bucket created: $BUCKET_NAME"
    else
        print_error "Cannot create S3 bucket. Check permissions."
        exit 1
    fi
fi

# Step 4: Configure website hosting
echo ""
echo "🌐 Step 4: Configuring website hosting..."

retry_command "aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html" "Website hosting configuration"

print_status "Website hosting configured"

# Step 5: Upload files
echo ""
echo "📤 Step 5: Uploading files to S3..."

# Upload with multiple strategies
echo "Uploading files (trying multiple approaches)..."

# Strategy 1: Try with public-read ACL
if aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME --delete --acl public-read 2>/dev/null; then
    print_status "Files uploaded with public-read ACL"
    PUBLIC_ACL_SUCCESS=true
else
    print_warning "Public-read ACL failed, trying without ACL..."
    # Strategy 2: Upload without ACL
    if aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME --delete; then
        print_status "Files uploaded (without public ACL)"
        PUBLIC_ACL_SUCCESS=false
    else
        print_error "File upload failed"
        exit 1
    fi
fi

# Step 6: Handle public access configuration
echo ""
echo "🔓 Step 6: Configuring public access..."

# Try to remove public access blocks
if aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
        BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false 2>/dev/null; then
    
    print_status "Public access blocks removed"
    
    # Now try to apply bucket policy
    sleep 2
    if aws s3api put-bucket-policy \
        --bucket $BUCKET_NAME \
        --policy '{
            "Version": "2012-10-17",
            "Statement": [{
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
            }]
        }' 2>/dev/null; then
        
        print_status "Bucket policy applied successfully"
        PUBLIC_POLICY_SUCCESS=true
    else
        print_warning "Could not apply bucket policy, but files may still be accessible"
        PUBLIC_POLICY_SUCCESS=false
    fi
else
    print_warning "Could not modify public access blocks - may need admin permissions"
    PUBLIC_POLICY_SUCCESS=false
fi

# Step 7: Test S3 website
echo ""
echo "🧪 Step 7: Testing S3 website..."

WEBSITE_URL="http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
print_info "Website URL: $WEBSITE_URL"

# Wait a moment for S3 to propagate
sleep 5

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" 2>/dev/null || echo "000")

case $HTTP_STATUS in
    200)
        print_status "S3 website is working perfectly!"
        S3_WORKING=true
        ;;
    403)
        print_warning "S3 website returning 403 - public access may be blocked"
        S3_WORKING=false
        ;;
    404)
        print_warning "S3 website returning 404 - may need time to propagate"
        S3_WORKING=false
        ;;
    *)
        print_warning "S3 website status: $HTTP_STATUS - may still be setting up"
        S3_WORKING=false
        ;;
esac

# Step 8: Create CloudFront distribution
echo ""
echo "🌐 Step 8: Creating CloudFront distribution..."

# Create CloudFront distribution configuration
DISTRIBUTION_CONFIG='{
    "CallerReference": "'$(date +%s)'",
    "Comment": "'$DISTRIBUTION_COMMENT'",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-'$BUCKET_NAME'",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true,
        "AllowedMethods": {
            "Quantity": 7,
            "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        }
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-'$BUCKET_NAME'",
                "DomainName": "'$BUCKET_NAME'.s3-website.'$REGION'.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}'

echo "Creating CloudFront distribution (this may take a few minutes)..."

if DISTRIBUTION_RESULT=$(aws cloudfront create-distribution --distribution-config "$DISTRIBUTION_CONFIG" 2>/dev/null); then
    
    # Parse distribution info (with fallback if jq not available)
    if command -v jq &> /dev/null; then
        DISTRIBUTION_ID=$(echo "$DISTRIBUTION_RESULT" | jq -r '.Distribution.Id')
        DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_RESULT" | jq -r '.Distribution.DomainName')
    else
        DISTRIBUTION_ID=$(echo "$DISTRIBUTION_RESULT" | grep -o '"Id":"[^"]*"' | cut -d'"' -f4 | head -1)
        DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_RESULT" | grep -o '"DomainName":"[^"]*"' | cut -d'"' -f4 | head -1)
    fi
    
    print_status "CloudFront distribution created"
    print_info "Distribution ID: $DISTRIBUTION_ID"
    print_info "Distribution Domain: $DISTRIBUTION_DOMAIN"
    
    CLOUDFRONT_URL="https://$DISTRIBUTION_DOMAIN"
    CLOUDFRONT_SUCCESS=true
    
else
    print_warning "CloudFront creation failed - may need additional permissions"
    print_info "Your app is still available via S3 website URL"
    CLOUDFRONT_SUCCESS=false
    CLOUDFRONT_URL=""
fi

# Step 9: Update Cognito configuration
echo ""
echo "🔐 Step 9: Updating Cognito configuration..."

# Prepare callback URLs
CALLBACK_URLS='"http://localhost:5173/callback"'
LOGOUT_URLS='"http://localhost:5173/logout"'

if [ "$S3_WORKING" = true ]; then
    CALLBACK_URLS="$CALLBACK_URLS, \"$WEBSITE_URL/callback\""
    LOGOUT_URLS="$LOGOUT_URLS, \"$WEBSITE_URL/logout\""
fi

if [ "$CLOUDFRONT_SUCCESS" = true ]; then
    CALLBACK_URLS="$CALLBACK_URLS, \"$CLOUDFRONT_URL/callback\""
    LOGOUT_URLS="$LOGOUT_URLS, \"$CLOUDFRONT_URL/logout\""
fi

# Update Cognito
if aws cognito-idp update-user-pool-client \
    --user-pool-id eu-west-2_Xbm29eLke \
    --client-id nrck33p87u8mhi68nmjenk8g1 \
    --callback-ur-ls $CALLBACK_URLS \
    --logout-ur-ls $LOGOUT_URLS \
    --allowed-o-auth-flows "code" \
    --allowed-o-auth-scopes "email" "openid" "profile" \
    --allowed-o-auth-flows-user-pool-client \
    --region eu-west-2 2>/dev/null; then
    
    print_status "Cognito configuration updated successfully"
else
    print_warning "Cognito update failed - may need additional permissions"
fi

# Step 10: Save deployment information
echo ""
echo "💾 Step 10: Saving deployment information..."

cat > deployment-info.txt << EOF
Kamai Suraksha Deployment Information
====================================
Date: $(date)
User: $USERNAME
Account: $ACCOUNT_ID

Build Configuration:
- Build Directory: $BUILD_DIR
- Project: $PROJECT_NAME
- Region: $REGION

S3 Configuration:
- Bucket Name: $BUCKET_NAME
- Website URL: $WEBSITE_URL
- Public ACL Success: $PUBLIC_ACL_SUCCESS
- Public Policy Success: $PUBLIC_POLICY_SUCCESS
- S3 Working: $S3_WORKING

CloudFront Configuration:
- Success: $CLOUDFRONT_SUCCESS
$(if [ "$CLOUDFRONT_SUCCESS" = true ]; then
echo "- Distribution ID: $DISTRIBUTION_ID"
echo "- CloudFront URL: $CLOUDFRONT_URL"
fi)

Cognito URLs Configured:
- Callback URLs: 
  * http://localhost:5173/callback
$(if [ "$S3_WORKING" = true ]; then echo "  * $WEBSITE_URL/callback"; fi)
$(if [ "$CLOUDFRONT_SUCCESS" = true ]; then echo "  * $CLOUDFRONT_URL/callback"; fi)
- Logout URLs:
  * http://localhost:5173/logout
$(if [ "$S3_WORKING" = true ]; then echo "  * $WEBSITE_URL/logout"; fi)
$(if [ "$CLOUDFRONT_SUCCESS" = true ]; then echo "  * $CLOUDFRONT_URL/logout"; fi)

Access URLs:
$(if [ "$S3_WORKING" = true ]; then echo "✅ S3 Website (immediate): $WEBSITE_URL"; else echo "⚠️  S3 Website (needs admin): $WEBSITE_URL"; fi)
$(if [ "$CLOUDFRONT_SUCCESS" = true ]; then echo "✅ CloudFront (15-20 min): $CLOUDFRONT_URL"; else echo "❌ CloudFront: Failed to create"; fi)

Cost Estimate:
- S3 Storage: ~$0.023 per GB per month
- S3 Requests: ~$0.0004 per 1000 requests
$(if [ "$CLOUDFRONT_SUCCESS" = true ]; then echo "- CloudFront: ~$0.085 per GB for first 10TB"; fi)
- Total: $1-5 per month for typical usage

Troubleshooting:
$(if [ "$PUBLIC_POLICY_SUCCESS" = false ]; then echo "- Need admin to run: aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"; fi)
$(if [ "$CLOUDFRONT_SUCCESS" = false ]; then echo "- CloudFront creation failed - may need CloudFrontFullAccess policy"; fi)
EOF

print_status "Deployment information saved to deployment-info.txt"

# Step 11: Final status and instructions
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""

if [ "$S3_WORKING" = true ]; then
    echo "✅ Your app is LIVE and working at:"
    echo "🌐 S3 Website: $WEBSITE_URL"
    
    if [ "$CLOUDFRONT_SUCCESS" = true ]; then
        echo "🌐 CloudFront: $CLOUDFRONT_URL (will be ready in 15-20 minutes)"
    fi
    
    echo ""
    print_status "SUCCESS! You can test your application now!"
    
elif [ "$S3_WORKING" = false ] && [ "$PUBLIC_POLICY_SUCCESS" = false ]; then
    echo "⚠️  Your app is deployed but needs admin help for public access:"
    echo "🌐 S3 Website: $WEBSITE_URL (currently 403)"
    
    if [ "$CLOUDFRONT_SUCCESS" = true ]; then
        echo "🌐 CloudFront: $CLOUDFRONT_URL (may work in 15-20 minutes)"
    fi
    
    echo ""
    print_warning "Ask an admin to run this command to fix public access:"
    echo "aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
    
else
    echo "✅ Your app is deployed:"
    echo "🌐 S3 Website: $WEBSITE_URL"
    
    if [ "$CLOUDFRONT_SUCCESS" = true ]; then
        echo "🌐 CloudFront: $CLOUDFRONT_URL"
    fi
fi

echo ""
echo "Next Steps:"
echo "1. Test your application functionality"
echo "2. Verify login/logout works with Cognito"
echo "3. Test API calls to your backend"
if [ "$CLOUDFRONT_SUCCESS" = false ]; then
    echo "4. (Optional) Ask admin to add CloudFrontFullAccess for HTTPS"
fi
echo "5. (Optional) Set up custom domain name"
echo ""
echo "All deployment details are saved in: deployment-info.txt"
echo ""

# Final test
if [ "$S3_WORKING" = true ]; then
    print_status "🚀 Deployment 100% successful! Your app is live!"
    
    # Try to open in browser
    if command -v xdg-open &> /dev/null; then
        echo "Opening in browser..."
        xdg-open "$WEBSITE_URL" &
    elif command -v open &> /dev/null; then
        echo "Opening in browser..."
        open "$WEBSITE_URL" &
    fi
    
elif [ "$PUBLIC_POLICY_SUCCESS" = false ]; then
    print_warning "Deployment 90% complete - just need admin to enable public access"
else
    print_status "Deployment complete with minor issues - check deployment-info.txt"
fi

echo ""
print_info "Total deployment time: $SECONDS seconds"
