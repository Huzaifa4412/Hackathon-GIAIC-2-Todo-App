# Deploy Backend to Hugging Face Spaces
# This script helps you deploy the backend to Hugging Face

Write-Host "=== Todo App Backend - Hugging Face Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if user is logged in to Hugging Face
Write-Host "Step 1: Hugging Face Authentication" -ForegroundColor Yellow
Write-Host "1. Visit: https://huggingface.co/settings/tokens"
Write-Host "2. Create a new token with 'Write' permissions"
Write-Host "3. Copy the token"
Write-Host ""

$token = Read-Host "Enter your Hugging Face token (or press Enter to skip)"
if ($token) {
    # Install huggingface_hub if not installed
    pip install huggingface_hub

    # Login to Hugging Face
    echo $token | huggingface-cli login
}

Write-Host ""
Write-Host "Step 2: Create Your Hugging Face Space" -ForegroundColor Yellow
Write-Host "1. Go to: https://huggingface.co/spaces"
Write-Host "2. Click 'Create new Space'"
Write-Host "3. Configure:"
Write-Host "   - Space name: todo-api-backend (or your preferred name)"
Write-Host "   - SDK: Docker"
Write-Host "   - Hardware: CPU basic (free)"
Write-Host "   - License: MIT"
Write-Host "   - Make public: Yes"
Write-Host ""

$username = Read-Host "Enter your Hugging Face username"
$spaceName = Read-Host "Enter your Space name (default: todo-api-backend)"
if (-not $spaceName) { $spaceName = "todo-api-backend" }

$spaceUrl = "https://huggingface.co/spaces/$username/$spaceName"
Write-Host "Your Space URL: $spaceUrl"
Write-Host ""

Write-Host "Step 3: Clone and Deploy" -ForegroundColor Yellow
Write-Host "Cloning Space repository..."
Write-Host ""

# Clone the space
git clone "https://huggingface.co/spaces/$username/$spaceName"
cd "$spaceName"

Write-Host "Copying backend files..."
Write-Host ""

# Copy backend files
Copy-Item -Path "../Backend/app" -Destination "." -Recurse -Force
Copy-Item -Path "../Backend/Dockerfile" -Destination "." -Force
Copy-Item -Path "../Backend/requirements.txt" -Destination "." -Force
Copy-Item -Path "../Backend/README.md" -Destination "." -Force

Write-Host "Files copied successfully!"
Write-Host ""

Write-Host "Step 4: Configure Environment Variables" -ForegroundColor Yellow
Write-Host "Go to: $spaceUrl/settings"
Write-Host ""
Write-Host "Add these secrets:"
Write-Host "1. DATABASE_URL = postgresql://neondb_owner:npg_dm25tWGznrxs@ep-lively-frost-a1gqfmzf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
Write-Host "2. BETTER_AUTH_SECRET = 6EwpqvvVL7coVMttESmclvrkGKZZTWtx"
Write-Host "3. PORT = 7860"
Write-Host ""

$continue = Read-Host "Have you added the environment variables? (y/n)"
if ($continue -ne "y") {
    Write-Host "Please add the environment variables first, then run this script again."
    exit 1
}

Write-Host ""
Write-Host "Step 5: Deploy to Hugging Face" -ForegroundColor Yellow
Write-Host "Committing and pushing changes..."
Write-Host ""

# Git configuration
git config user.email "deploy@todo-app.com"
git config user.name "Todo App Deploy"

# Add all files
git add .

# Commit
git commit -m "Deploy FastAPI backend to Hugging Face Spaces"

# Push
git push

Write-Host ""
Write-Host "=== Deployment Started! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Monitor your deployment at: $spaceUrl"
Write-Host "Your API will be available at: https://$username-$spaceName.hf.space"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Wait for the build to complete (2-5 minutes)"
Write-Host "2. Test the health endpoint:"
Write-Host "   curl https://$username-$spaceName.hf.space/health"
Write-Host "3. Update frontend NEXT_PUBLIC_API_URL in Vercel"
Write-Host ""
