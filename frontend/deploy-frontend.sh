#!/bin/bash

# Remove old environment variables
echo "Removing old environment variables..."
cd frontend

# Remove api_url from all environments
vercel env rm api_url production <<EOF
y
EOF

vercel env rm api_url preview <<EOF
y
EOF

vercel env rm api_url development <<EOF
y
EOF

# Remove better_auth_url from all environments
vercel env rm better_auth_url production <<EOF
y
EOF

vercel env rm better_auth_url preview <<EOF
y
EOF

vercel env rm better_auth_url development <<EOF
y
EOF

# Add new environment variables with correct names
echo "Adding new environment variables..."

# Add NEXT_PUBLIC_API_URL for all environments
echo "https://todo-api-backend.vercel.app" | vercel env add NEXT_PUBLIC_API_URL production <<EOF
n
EOF

echo "https://todo-api-backend.vercel.app" | vercel env add NEXT_PUBLIC_API_URL preview <<EOF
n
EOF

echo "https://todo-api-backend.vercel.app" | vercel env add NEXT_PUBLIC_API_URL development <<EOF
n
EOF

# Add NEXT_PUBLIC_BETTER_AUTH_URL for all environments
echo "https://hackathon2-todo-app.vercel.app" | vercel env add NEXT_PUBLIC_BETTER_AUTH_URL production <<EOF
n
EOF

echo "https://hackathon2-todo-app.vercel.app" | vercel env add NEXT_PUBLIC_BETTER_AUTH_URL preview <<EOF
n
EOF

echo "https://hackathon2-todo-app.vercel.app" | vercel env add NEXT_PUBLIC_BETTER_AUTH_URL development <<EOF
n
EOF

echo "Environment variables configured successfully!"

# Deploy to production
echo "Deploying to production..."
vercel --prod
