# How to Get Your Supabase API Key

## Step-by-Step Guide

### 1. Access Your Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Log in to your Supabase account

### 2. Select Your Project
- Look for your project: **onyxqbacbtztcmruoquo**
- Click on it to open the project dashboard

### 3. Navigate to API Settings
- In the left sidebar, click on **"Settings"**
- Then click on **"API"**
- Or go directly to: https://supabase.com/dashboard/project/onyxqbacbtztcmruoquo/settings/api

### 4. Copy the Correct API Key
You'll see several keys on the API settings page:

#### ✅ **COPY THIS ONE** - "anon public" key:
- Look for the section labeled **"Project API keys"**
- Find the key labeled **"anon"** or **"public"**
- This key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Click the copy button next to it

#### ❌ **DON'T USE THESE**:
- **service_role** key (this is for server-side admin operations only)
- **JWT Secret** (this is for token verification, not client connections)

### 5. Update Your .env.local File
Replace `[YOUR-ANON-KEY-HERE]` with the copied key:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://onyxqbacbtztcmruoquo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXhxYmFjYnR6dGNtcnVvcXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2XXXXXXXXX
```

## Visual Guide

```
Supabase Dashboard → Your Project → Settings → API
                                      ↓
                              Project API keys
                                      ↓
                         anon/public key ← COPY THIS ONE
```

## Common Issues & Solutions

### Issue: "Invalid API key"
- ✅ Make sure you copied the **anon/public** key, not the service_role key
- ✅ Check there are no extra spaces at the beginning or end
- ✅ Make sure the key starts with `eyJhbGci...`

### Issue: "Project not found"
- ✅ Verify the URL matches exactly: `https://onyxqbacbtztcmruoquo.supabase.co`
- ✅ Check you're logged into the correct Supabase account

### Issue: Key not working after copying
- ✅ Restart your development server: `npm run dev`
- ✅ Clear your browser cache
- ✅ Check the .env.local file was saved properly

## What the API Key Looks Like

A valid Supabase anon key will look something like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueXhxYmFjYnR6dGNtcnVvcXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

It's a JWT token that:
- Starts with `eyJhbGci`
- Contains your project reference (`onyxqbacbtztcmruoquo`)
- Has three parts separated by dots (.)
- Is quite long (several hundred characters)

## After Getting the Key

1. **Update .env.local** with the real key
2. **Restart your dev server**: `npm run dev`  
3. **Test it**: Go to http://localhost:3000/auth/sign-up
4. **Verify**: The sign-up form should appear instead of the configuration message

## Need Help?

If you're still having trouble:
1. Double-check you're in the right project dashboard
2. Make sure you have the right permissions for the project
3. Try generating a new API key in the Supabase dashboard
4. Contact Supabase support if the project seems inaccessible