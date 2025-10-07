# Codeforces Verification Flow

## Overview
This document describes the complete CF verification and profile setup flow implemented in AlgoRise.

## Flow Diagram

\`\`\`
User Login → Check CF Verification → Profile Page
                    ↓                      ↓
              Not Verified          CF Verification
                    ↓                      ↓
            Redirect to Profile    Profile Information Form
                                          ↓
                                   Save & Redirect to Home
\`\`\`

## Implementation Details

### 1. Middleware Protection (`lib/supabase/middleware.ts`)

The middleware checks:
- If user is authenticated
- If user has verified CF handle
- Redirects to `/profile` if not verified (except for `/profile` itself and API routes)

\`\`\`typescript
if (user && !isApiRoute && !request.nextUrl.pathname.startsWith("/auth/")) {
  if (request.nextUrl.pathname === "/profile") {
    return supabaseResponse
  }

  const { data: cfHandle } = await supabase
    .from("cf_handles")
    .select("verified")
    .eq("user_id", user.id)
    .single()

  if (!cfHandle?.verified) {
    const url = request.nextUrl.clone()
    url.pathname = "/profile"
    return NextResponse.redirect(url)
  }
}
\`\`\`

### 2. Profile Page (`app/profile/page.tsx`)

The profile page has two main sections:

#### A. CF Verification Section
- Shows first if user is not verified
- Uses compilation error submission method
- User submits code to Problem 1869A that generates compilation error
- 2-minute timer for verification
- Once verified, shows success message

#### B. Profile Information Section
- Only shows after CF verification is complete
- Smart form with:
  - Status selection (Student/Working Professional)
  - For Students:
    - Degree type selection (B.Tech, M.Tech, BCA, MCA, MBA, etc.)
    - College selection with search (80+ colleges seeded)
    - Year selection (smart - shows years based on degree type)
    - Option to add custom college
  - For Working Professionals:
    - Company selection with search (60+ companies seeded)
    - Option to add custom company
    - Custom company name field if "Other" is selected

### 3. CF Verification Component (`components/auth/cf-verification-compilation.tsx`)

Implements the compilation error verification method:

**Step 1: Input Handle**
- User enters Codeforces handle
- Validates handle exists on Codeforces

**Step 2: Submit Code**
- Generates unique verification ID
- Creates code snippet with timestamp and verification ID
- User copies code and submits to Problem 1869A
- 2-minute countdown timer

**Step 3: Verify**
- Checks Codeforces API for compilation error submission
- Verifies submission was made during verification window
- Updates database with verification status

### 4. API Routes

#### `/api/cf/verify/compilation/start` (POST)
- Validates CF handle exists
- Generates verification ID and code snippet
- Stores verification attempt in database
- Returns code snippet and expiration time

#### `/api/cf/verify/compilation/check` (POST)
- Checks if verification has expired
- Fetches recent submissions from Codeforces API
- Looks for compilation error on Problem 1869A
- Verifies submission timestamp
- Updates verification status
- Creates CF snapshot

#### `/api/profile` (GET)
- Returns user's CF verification status
- Returns user's profile information

#### `/api/profile` (PUT)
- Validates profile data based on status
- Upserts profile to database
- Returns success status

#### `/api/colleges` (GET)
- Returns list of colleges with optional search
- Supports pagination

#### `/api/colleges` (POST)
- Adds new college to database
- Prevents duplicates
- Returns newly created college

#### `/api/companies` (GET)
- Returns list of companies with optional search
- Supports pagination

#### `/api/companies` (POST)
- Adds new company to database
- Prevents duplicates
- Returns newly created company

### 5. Database Schema

#### `profiles` table
\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('student', 'working')),
  degree_type TEXT,
  college_id UUID REFERENCES colleges(id),
  year TEXT,
  company_id UUID REFERENCES companies(id),
  custom_company TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### `colleges` table
\`\`\`sql
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT DEFAULT 'India',
  user_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### `companies` table
\`\`\`sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  user_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

### 6. Smart Features

#### Degree-Based Year Selection
The form intelligently shows year options based on degree type:
- B.Tech/B.E.: 4 years
- M.Tech/M.E.: 2 years
- BCA: 3 years
- MCA: 2 years
- MBA: 2 years
- Ph.D.: 5 years

#### User-Contributed Data
- Users can add colleges/companies not in the list
- New entries are stored in database
- Future users can select from these entries
- Prevents duplicate entries

#### Searchable Dropdowns
- Command component with search functionality
- Easy to find college/company from large lists
- Shows "Add New" option when no results found

## User Experience Flow

1. **New User Login**
   - User logs in with email/password
   - Middleware detects no CF verification
   - Redirects to `/profile`

2. **CF Verification**
   - User enters CF handle
   - System generates verification code
   - User submits code to Codeforces
   - User clicks "Verify Now"
   - System confirms verification
   - Shows success message

3. **Profile Setup**
   - User selects status (Student/Working)
   - If Student:
     - Selects degree type
     - Searches and selects college (or adds new)
     - Selects year based on degree
   - If Working:
     - Searches and selects company (or adds new)
     - Enters custom company name if "Other"
   - Clicks "Save Profile & Continue"
   - Redirects to home page

4. **Subsequent Logins**
   - Middleware checks CF verification
   - User is verified, allows access to all pages
   - No need to verify again

## Benefits

1. **One-Time Verification**: Users only need to verify CF handle once
2. **Smart Forms**: Year selection adapts to degree type
3. **Comprehensive Data**: 80+ colleges and 60+ companies pre-seeded
4. **User Contributions**: Users can add missing colleges/companies
5. **Search Functionality**: Easy to find from large lists
6. **Secure**: Middleware ensures all users are verified before accessing features
7. **User-Friendly**: Clear instructions and visual feedback throughout the process

## Testing Checklist

- [ ] New user can complete CF verification
- [ ] Verified user can access all pages
- [ ] Unverified user is redirected to profile
- [ ] Student can select college and year
- [ ] Working professional can select company
- [ ] User can add custom college
- [ ] User can add custom company
- [ ] Year options change based on degree type
- [ ] Search works for colleges and companies
- [ ] Profile saves correctly
- [ ] User redirects to home after profile save
- [ ] Middleware allows access to profile page without verification
- [ ] API routes handle errors gracefully
