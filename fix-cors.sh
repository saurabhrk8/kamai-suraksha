#!/bin/bash

echo "🚀 Complete CORS Fix for API Gateway"
echo "==================================="

API_ID="jrzuzhs5t8"
REGION="eu-west-2"

# Enable CORS for all resources and methods
echo "Enabling CORS for API Gateway..."

# Get all resources
RESOURCES=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[].id' \
    --output text)

for RESOURCE_ID in $RESOURCES; do
    echo "Processing resource: $RESOURCE_ID"
    
    # Get methods for this resource
    METHODS=$(aws apigateway get-resource \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --region $REGION \
        --query 'resourceMethods' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$METHODS" ] && [ "$METHODS" != "None" ]; then
        # Add OPTIONS method if it doesn't exist
        aws apigateway put-method \
            --rest-api-id $API_ID \
            --resource-id $RESOURCE_ID \
            --http-method OPTIONS \
            --authorization-type NONE \
            --region $REGION 2>/dev/null || echo "OPTIONS method already exists"
        
        # Configure OPTIONS integration
        aws apigateway put-integration \
            --rest-api-id $API_ID \
            --resource-id $RESOURCE_ID \
            --http-method OPTIONS \
            --type MOCK \
            --integration-http-method OPTIONS \
            --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
            --region $REGION 2>/dev/null
        
        # Configure OPTIONS responses
        aws apigateway put-method-response \
            --rest-api-id $API_ID \
            --resource-id $RESOURCE_ID \
            --http-method OPTIONS \
            --status-code 200 \
            --response-parameters \
                'method.response.header.Access-Control-Allow-Headers=false' \
                'method.response.header.Access-Control-Allow-Methods=false' \
                'method.response.header.Access-Control-Allow-Origin=false' \
            --region $REGION 2>/dev/null
        
        aws apigateway put-integration-response \
            --rest-api-id $API_ID \
            --resource-id $RESOURCE_ID \
            --http-method OPTIONS \
            --status-code 200 \
            --response-parameters \
                'method.response.header.Access-Control-Allow-Headers='"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'' \
                'method.response.header.Access-Control-Allow-Methods='"'"'GET,POST,PUT,DELETE,OPTIONS'"'"'' \
                'method.response.header.Access-Control-Allow-Origin='"'"'*'"'"'' \
            --region $REGION 2>/dev/null
    fi
done

# Deploy changes
echo ""
echo "Deploying API changes..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region $REGION

echo "✅ CORS configuration complete!"
echo ""
echo "Test your app now - CORS errors should be resolved!"
