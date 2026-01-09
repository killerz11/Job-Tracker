#!/bin/bash

# JobTracker Chrome Extension - Publishing Commands
# Run these commands step by step

echo "🚀 JobTracker Chrome Extension Publishing Script"
echo "================================================"
echo ""

# Step 1: Convert Icons to PNG
echo "📸 Step 1: Convert Icons to PNG"
echo "================================"
echo "⚠️  CRITICAL: Chrome Web Store requires PNG icons, not JPG"
echo ""
echo "Your current icons are JPG format. You need to convert them to PNG."
echo ""
echo "Option 1: Use ImageMagick (if installed)"
echo "  cd extension/icons"
echo "  convert icon16.jpg icon16.png"
echo "  convert icon32.jpg icon32.png"
echo "  convert icon48.jpg icon48.png"
echo "  convert icon128.jpg icon128.png"
echo ""
echo "Option 2: Use online converter"
echo "  Visit: https://cloudconvert.com/jpg-to-png"
echo "  Upload all 4 icons and convert"
echo ""
echo "Option 3: Recreate in design tool"
echo "  Use Figma, Canva, or Photoshop"
echo "  Create PNG icons at sizes: 16x16, 32x32, 48x48, 128x128"
echo ""
read -p "Press Enter after converting icons to PNG..."

# Step 2: Verify Icons
echo ""
echo "🔍 Step 2: Verify PNG Icons Exist"
echo "=================================="
if [ -f "extension/icons/icon16.png" ] && \
   [ -f "extension/icons/icon32.png" ] && \
   [ -f "extension/icons/icon48.png" ] && \
   [ -f "extension/icons/icon128.png" ]; then
    echo "✅ All PNG icons found!"
else
    echo "❌ PNG icons not found. Please convert icons first."
    echo "Missing files:"
    [ ! -f "extension/icons/icon16.png" ] && echo "  - icon16.png"
    [ ! -f "extension/icons/icon32.png" ] && echo "  - icon32.png"
    [ ! -f "extension/icons/icon48.png" ] && echo "  - icon48.png"
    [ ! -f "extension/icons/icon128.png" ] && echo "  - icon128.png"
    exit 1
fi

# Step 3: Package Extension
echo ""
echo "📦 Step 3: Package Extension as ZIP"
echo "===================================="
cd extension
zip -r ../jobtracker-v1.0.0.zip \
  manifest.json \
  popup.html \
  popup.js \
  content.js \
  background.js \
  icons/*.png \
  PRIVACY_POLICY.md \
  README_STORE.md

cd ..

if [ -f "jobtracker-v1.0.0.zip" ]; then
    echo "✅ Extension packaged successfully!"
    echo "📁 File: jobtracker-v1.0.0.zip"
    ls -lh jobtracker-v1.0.0.zip
else
    echo "❌ Failed to create ZIP file"
    exit 1
fi

# Step 4: Verify ZIP Contents
echo ""
echo "🔍 Step 4: Verify ZIP Contents"
echo "==============================="
unzip -l jobtracker-v1.0.0.zip

# Step 5: Deployment Checklist
echo ""
echo "☁️  Step 5: Deployment Checklist"
echo "================================="
echo ""
echo "Before submitting to Chrome Web Store, you need to deploy:"
echo ""
echo "1. Backend (Railway/Render):"
echo "   - Sign up at https://railway.app"
echo "   - Deploy 'backend' folder"
echo "   - Add environment variables:"
echo "     DATABASE_URL=your_neon_postgres_url"
echo "     JWT_SECRET=your_secret_key"
echo "     NODE_ENV=production"
echo "   - Get production URL (e.g., https://your-app.railway.app)"
echo ""
echo "2. Frontend (Vercel/Netlify):"
echo "   - Sign up at https://vercel.com"
echo "   - Deploy 'job-tracker-web' folder"
echo "   - Add environment variable:"
echo "     NEXT_PUBLIC_API_URL=https://your-backend-url"
echo "   - Get production URL (e.g., https://your-app.vercel.app)"
echo ""
echo "3. Privacy Policy:"
echo "   - Host extension/PRIVACY_POLICY.md on public URL"
echo "   - Quick option: GitHub Pages"
echo "   - Get URL (e.g., https://yourusername.github.io/jobtracker-privacy)"
echo ""
echo "4. Screenshots (1280x800 PNG):"
echo "   - Extension popup - login"
echo "   - Extension popup - pending jobs"
echo "   - Dashboard with jobs"
echo "   - LinkedIn with notification"
echo "   - Configuration settings"
echo ""

# Step 6: Testing
echo ""
echo "🧪 Step 6: Test Before Submission"
echo "=================================="
echo ""
echo "1. Load unpacked extension in Chrome:"
echo "   - Go to chrome://extensions"
echo "   - Enable 'Developer mode'"
echo "   - Click 'Load unpacked'"
echo "   - Select 'extension' folder"
echo ""
echo "2. Configure with production URLs:"
echo "   - Click extension icon"
echo "   - Enter Backend API URL"
echo "   - Enter Dashboard URL"
echo "   - Click 'Save Configuration'"
echo ""
echo "3. Test all features:"
echo "   - Login with test account"
echo "   - Go to LinkedIn jobs"
echo "   - Apply to a job (Easy Apply or External)"
echo "   - Verify tracking works"
echo "   - Check dashboard shows the job"
echo ""
echo "4. Check for errors:"
echo "   - Open Chrome DevTools (F12)"
echo "   - Check Console for errors"
echo "   - Verify no red errors appear"
echo ""

# Step 7: Chrome Web Store Submission
echo ""
echo "🌐 Step 7: Chrome Web Store Submission"
echo "======================================="
echo ""
echo "1. Create Developer Account:"
echo "   - Go to: https://chrome.google.com/webstore/devconsole"
echo "   - Pay \$5 one-time registration fee"
echo "   - Verify email"
echo ""
echo "2. Upload Extension:"
echo "   - Click 'New Item'"
echo "   - Upload: jobtracker-v1.0.0.zip"
echo "   - Wait for upload to complete"
echo ""
echo "3. Fill Store Listing:"
echo "   - Name: JobTracker - LinkedIn Application Tracker"
echo "   - Description: Use content from extension/README_STORE.md"
echo "   - Category: Productivity"
echo "   - Upload 5 screenshots"
echo "   - Add privacy policy URL"
echo ""
echo "4. Submit for Review:"
echo "   - Review all information"
echo "   - Click 'Submit for Review'"
echo "   - Wait 1-3 business days"
echo ""

# Final Summary
echo ""
echo "✅ Summary"
echo "=========="
echo ""
echo "Files created:"
echo "  ✅ jobtracker-v1.0.0.zip - Ready to upload"
echo "  ✅ PRIVACY_POLICY.md - Host this publicly"
echo "  ✅ README_STORE.md - Use for store description"
echo "  ✅ CHROME_WEB_STORE_CHECKLIST.md - Complete checklist"
echo "  ✅ DEPLOYMENT_GUIDE.md - Deployment instructions"
echo "  ✅ QUICK_START_PUBLISHING.md - Quick reference"
echo ""
echo "Next steps:"
echo "  1. Deploy backend to Railway/Render"
echo "  2. Deploy frontend to Vercel/Netlify"
echo "  3. Host privacy policy publicly"
echo "  4. Take 5 screenshots"
echo "  5. Test with production URLs"
echo "  6. Submit to Chrome Web Store"
echo ""
echo "📚 Documentation:"
echo "  - Quick Start: QUICK_START_PUBLISHING.md"
echo "  - Full Guide: CHROME_WEB_STORE_CHECKLIST.md"
echo "  - Deployment: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 You're ready to publish! Good luck! 🚀"
echo ""
