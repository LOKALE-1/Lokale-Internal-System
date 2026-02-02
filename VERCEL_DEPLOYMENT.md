# Vercel Deployment Guide

## 🚀 Quick Fix for Firebase Error

Your app is failing because Vercel doesn't have your Firebase environment variables.

### Step 1: Add Environment Variables to Vercel

Go to your Vercel project: https://vercel.com/dashboard

1. Select your project: **Lokale-Internal-System**
2. Go to **Settings** → **Environment Variables**
3. Add these variables one by one:

| Variable Name | Value |
|--------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAS-GeUUm06x0PCPsLAdkzMLMlXdIbLMEc` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `lokale-internal-system.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `lokale-internal-system` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `lokale-internal-system.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `398720676134` |
| `VITE_FIREBASE_APP_ID` | `1:398720676134:web:37e915ded97a5b7cabd1e7` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-3YS8ETQVN1` |

4. For each variable, select environment: **Production** (or All)
5. Click **Save**

### Step 2: Redeploy

After adding all variables:
- Go to **Deployments** tab
- Click the **...** menu on the latest deployment
- Select **Redeploy**
- OR push a new commit to trigger automatic deployment

### Step 3: Verify

Once redeployed, your app should load without the Firebase error.

## 🔒 Security Note

These Firebase credentials are already exposed in your client-side code, so they're safe to add to Vercel. However, make sure your Firestore Security Rules are properly configured to protect your data.

## 📝 Alternative: Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add VITE_FIREBASE_API_KEY production
# (paste the value when prompted)

# Repeat for all variables, then redeploy
vercel --prod
```

## ✅ Checklist

- [ ] All 7 environment variables added to Vercel
- [ ] Variables set for Production environment
- [ ] Redeployed the application
- [ ] Verified app loads without Firebase error
- [ ] Tested login/signup functionality
- [ ] Firestore security rules deployed

## 🆘 Still Having Issues?

Check:
1. All variable names match exactly (case-sensitive)
2. No extra spaces in values
3. Deployment completed successfully
4. Browser cache cleared (hard refresh: Cmd+Shift+R)
