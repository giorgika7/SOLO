# Password Authentication Setup Guide

## What Changed

The app now uses **password-based authentication** instead of OTP codes. This eliminates the 403 errors from Supabase and provides a more traditional authentication experience.

## Supabase Configuration Required

Before testing, you must configure Supabase authentication settings:

### Step 1: Enable Email/Password Authentication

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Email** provider
5. Enable **"Email and Password"** authentication
6. **DISABLE** the **"Confirm email"** option (important!)
7. Click **Save**

### Step 2: Verify Settings

Make sure these settings are configured:

- ✅ Email Provider: **Enabled**
- ✅ Email and Password: **Enabled**
- ❌ Confirm email: **Disabled**
- ✅ Secure email change: **Enabled** (optional but recommended)

## New Authentication Flow

### Registration (New Users)

1. Navigate to `/register` or click "Register" from login screen
2. Enter email address
3. Create password (minimum 6 characters)
4. Confirm password
5. Click "Create Account"
6. Automatically logged in and redirected to main app

### Login (Returning Users)

1. Navigate to `/login` or click "Login" from home screen
2. Enter email address
3. Enter password
4. Click "Login"
5. Automatically logged in and redirected to main app

### Password Reset

1. From login screen, click "Forgot Password?"
2. Enter email address
3. Supabase sends password reset email
4. Click link in email to reset password

## Features

### Password Strength Indicator

The registration screen shows real-time password strength:

- **Weak** (Red): Less than 6 characters
- **Medium** (Yellow): 6-8 characters
- **Strong** (Green): 9+ characters

### Security Features

- Passwords hidden by default with toggle visibility (eye icon)
- Client-side validation before API calls
- Secure password hashing handled by Supabase
- Session management with automatic token refresh
- User profile automatically created on registration

## Error Handling

The app shows clear error messages:

- "Invalid email or password" - Login failures
- "Email already registered" - Duplicate signups
- "Passwords don't match" - Registration validation
- "Password must be at least 6 characters" - Weak passwords
- "Please enter a valid email" - Invalid email format

## Files Modified

### Core Authentication
- `services/auth.ts` - Added password authentication functions
- `hooks/useAuth.ts` - Removed OTP methods, kept session management

### Screens
- `app/login.tsx` - Complete rewrite with password login
- `app/register.tsx` - New registration screen
- `app/(tabs)/index.tsx` - Already properly configured

### What Was Removed
- All OTP-related code
- `signInWithOtp()` function
- `verifyOtp()` function
- Email verification code input

## Testing Checklist

- [ ] Configure Supabase authentication settings
- [ ] Test registration with new account
- [ ] Test login with created account
- [ ] Test password visibility toggle
- [ ] Test password strength indicator
- [ ] Test "Forgot Password" flow
- [ ] Test error messages (wrong password, duplicate email, etc.)
- [ ] Test "Continue as Guest" button
- [ ] Test automatic profile creation
- [ ] Test logout functionality

## Migration Notes

If you had users with the OTP system:

1. Existing users in the database will remain
2. They will need to use "Forgot Password" to set a password
3. Their profile data (balance, orders, eSIMs) will be preserved
4. No data migration required

## Support

If you encounter issues:

1. Check Supabase authentication settings
2. Verify email/password provider is enabled
3. Check browser console for detailed error messages
4. Ensure "Confirm email" is disabled in Supabase settings
