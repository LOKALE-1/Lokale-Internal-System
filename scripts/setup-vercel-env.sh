#!/bin/bash
# Script to add environment variables to Vercel
# Run this after filling in your Firebase credentials

# Make sure you have Vercel CLI installed: npm i -g vercel

vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_MEASUREMENT_ID

echo "Environment variables added. Redeploy with: vercel --prod"
