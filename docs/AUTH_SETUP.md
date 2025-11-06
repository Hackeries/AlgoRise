# Authentication & OAuth Configuration Guide

This guide explains how to configure authentication providers (GitHub, Google) for AlgoRise in both local development and production environments.

## Prerequisites

- Supabase project created ([supabase.com](https://supabase.com))
- GitHub account (for GitHub OAuth)
- Google Cloud account (for Google OAuth)

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to your deployed domain.

## Database Setup

1. Navigate to your Supabase project's SQL Editor
2. Run the main setup script: `SUPABASE_SETUP.sql`
3. Run migrations in order:
   - `schema/migrations/001_add_cf_verification_columns.sql`

## OAuth Provider Configuration

### GitHub OAuth

#### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: AlgoRise (or your app name)
   - **Homepage URL**: 
     - Local: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - **Authorization callback URL**: `<YOUR_SUPABASE_URL>/auth/v1/callback`
     - Example: `https://abcdefghij.supabase.co/auth/v1/callback`
4. Click **"Register application"**
5. Note the **Client ID** (shown immediately)
6. Click **"Generate a new client secret"** and copy it

#### 2. Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** in the list
4. Toggle **Enable Sign in with GitHub**
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

### Google OAuth

#### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**
4. Create OAuth credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Configure the consent screen if prompted:
     - User Type: External (for public apps) or Internal (for organization)
     - Add app name, support email, and developer contact
   - Application type: **Web application**
   - Name: AlgoRise (or your app name)
   - **Authorized JavaScript origins**:
     - Local: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - **Authorized redirect URIs**: `<YOUR_SUPABASE_URL>/auth/v1/callback`
     - Example: `https://abcdefghij.supabase.co/auth/v1/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

#### 2. Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle **Enable Sign in with Google**
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

## Email Authentication Configuration

Email authentication is automatically enabled in Supabase. To customize email templates:

1. Go to **Authentication** → **Email Templates** in Supabase Dashboard
2. Customize the following templates:
   - **Confirm signup**: Email verification link sent to new users
   - **Magic Link**: Passwordless login email
   - **Change Email Address**: Email change confirmation
   - **Reset Password**: Password reset email

### Email Verification Flow

When users sign up with email:
1. User submits email and password on `/auth/sign-up`
2. System sends verification email to user's inbox
3. User clicks verification link in email
4. System verifies email and activates account
5. User is redirected to their profile page

## Testing OAuth Locally

### GitHub OAuth Test

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/login`
3. Click **"Sign in with GitHub"**
4. You'll be redirected to GitHub to authorize the app
5. After authorization, you'll be redirected back to your app

### Google OAuth Test

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/login`
3. Click **"Sign in with Google"**
4. You'll be redirected to Google to authorize the app
5. After authorization, you'll be redirected back to your app

## Production Deployment

### Update OAuth Apps for Production

#### GitHub
1. Go to your GitHub OAuth App settings
2. Update **Homepage URL** to your production domain
3. Add production callback URL: `<YOUR_PRODUCTION_SUPABASE_URL>/auth/v1/callback`
4. You may want to create a separate OAuth app for production

#### Google
1. Go to your Google OAuth credentials
2. Add production domain to **Authorized JavaScript origins**
3. Add production callback URL to **Authorized redirect URIs**
4. Update OAuth consent screen if needed

### Environment Variables for Production

Set these environment variables in your deployment platform (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

## Troubleshooting

### Common Issues

#### "Redirect URI mismatch" error

- **Cause**: The callback URL in your OAuth app doesn't match Supabase's callback URL
- **Solution**: Ensure callback URL is exactly `<SUPABASE_URL>/auth/v1/callback`

#### OAuth popup blocked

- **Cause**: Browser is blocking the OAuth popup window
- **Solution**: Allow popups for your domain in browser settings

#### "Invalid credentials" error

- **Cause**: Client ID or Client Secret is incorrect
- **Solution**: Double-check credentials in both OAuth provider and Supabase Dashboard

#### Email verification not working

- **Cause**: Email provider not configured or email template issues
- **Solution**: 
  - Check Supabase email settings
  - Verify email templates are correctly configured
  - Check spam folder for verification emails

### Testing Email in Development

Supabase provides a test email service for development. Check your Supabase project's **Authentication** → **Email** section for test emails during development.

## Security Best Practices

1. **Never commit** OAuth secrets to version control
2. **Use different OAuth apps** for development and production
3. **Rotate secrets** periodically
4. **Enable two-factor authentication** on GitHub and Google accounts
5. **Review authorized applications** regularly
6. **Use HTTPS** in production
7. **Configure CORS** properly in Supabase settings

## Feature Flags

The Codeforces verification UI can be toggled using the feature flag:

```bash
NEXT_PUBLIC_CF_VERIFICATION_ENABLED=true
```

Set to `false` to disable CF verification UI (users can still authenticate but won't see CF verification options).

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
