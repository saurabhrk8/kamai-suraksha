#!/bin/bash
BUCKET=$(grep "Bucket Name:" deployment-info.txt | cut -d' ' -f3 2>/dev/null)
if [ -n "$BUCKET" ]; then
    echo "Updating app in bucket: $BUCKET"
    npm run build
    BUILD_DIR="dist"; [ -d "build" ] && BUILD_DIR="build"
    aws s3 sync $BUILD_DIR/ s3://$BUCKET --delete
    echo "✅ App updated! Check your website."
else
    echo "❌ Run from project root with deployment-info.txt"
fi
