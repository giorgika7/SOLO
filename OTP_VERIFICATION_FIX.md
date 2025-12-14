# OTP Verification Troubleshooting Guide

## Issue: "Failed to verify OTP"

The OTP verification is failing. This can happen for several reasons. Follow these steps to resolve:

## Solution Steps

### 1. Verify Supabase Configuration

The most common cause is that **Email Confirmation** is enabled in your Supabase project settings.

**Steps:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Click on **Email** provider
5. **IMPORTANT:** Disable "Confirm email" checkbox
6. Make sure "Enable email OTP" is checked ✓
7. Save changes

### 2. Check Email Provider

- Ensure you have an email provider configured (not in development mode)
- Go to **Authentication** → **Email Templates**
- Verify the email templates are configured
- Test by sending a new OTP

### 3. OTP Code Issues

**Common problems:**
- OTP codes expire after 15-20 minutes - request a new one if it's old
- The OTP must be exactly 6-8 digits with no spaces
- Make sure you're copying the entire code correctly

**To get a fresh OTP:**
1. Click "Back to Email" button
2. Clear the email field
3. Re-enter your email address
4. Click "Send OTP" again
5. Wait for the new email with the fresh code
6. Immediately enter it (don't wait)

### 4. Test with Debug Email

For testing purposes, you can create a test account first:

1. Request an OTP for test email
2. Check if email is received (check spam folder)
3. If no email received, check Supabase email logs
4. If email received but OTP doesn't work, try requesting a new one

### 5. Check Browser Console for Errors

While verifying OTP, open browser console (F12 or right-click → Inspect → Console):

- Look for detailed error messages about the verification
- Check network requests for the auth call
- Look for CORS or network errors

### 6. Database Permissions

Run this in Supabase SQL Editor to verify permissions:

```sql
-- Check if users table allows inserts
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';
```

### 7. Alternative: Use Service Role Key (Testing Only)

For development/testing, you can temporarily use the service role key, but **never in production**:

```typescript
// services/supabase.ts - Only for testing!
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role instead
);
```

## Complete Supabase Setup for OTP

### Minimal Configuration Needed:

1. **Authentication Enabled:** ✓
2. **Email Provider:** Configured with SMTP or SendGrid
3. **Email Confirmation:** DISABLED
4. **Email OTP:** ENABLED
5. **Users Table:** Exists with RLS enabled
6. **Policies:** Allow authenticated users to insert/update

### Verify Your Supabase Project:

```bash
# Check authentication status
curl https://YOUR_PROJECT.supabase.co/auth/v1/settings \
  -H "apikey: YOUR_ANON_KEY"
```

## Quick Checklist

- [ ] Email confirmation is DISABLED in Supabase
- [ ] Email OTP is ENABLED
- [ ] Email provider is configured (not in development)
- [ ] Users table exists with RLS
- [ ] RLS policies allow authenticated users to insert
- [ ] Browser console shows no CORS errors
- [ ] OTP code is fresh (less than 15 minutes old)
- [ ] OTP code is entered correctly with no spaces
- [ ] Check spam folder for OTP email

## If Still Not Working

1. **Clear browser cache and cookies**
   - F12 → Application → Clear site data

2. **Test in incognito/private window**
   - Opens fresh session without cache

3. **Try different email**
   - Some email providers block OTP emails

4. **Check Supabase logs**
   - Dashboard → Auth → Logs
   - Look for failed verification attempts

5. **Restart development server**
   - Kill and restart the dev server

6. **Contact Supabase Support**
   - If still failing, check Supabase status page and contact support

## Development Testing

For faster testing during development:

1. **Use test email addresses:**
   - test@example.com
   - testuser@test.com

2. **Mock OTP codes for development:**
   - Some setups allow "000000" as test OTP
   - Check Supabase documentation for your region

3. **Use seed script:**
   - Create test users directly in database
   - Bypass OTP flow for testing

## Production Recommendations

- Use professional email service (SendGrid, AWS SES)
- Configure proper email templates
- Set up email verification for critical actions
- Monitor auth logs for suspicious activity
- Implement rate limiting on OTP requests

---

**Still having issues?** Check the browser console for the exact error message and search the Supabase documentation or community forums with that specific error.
