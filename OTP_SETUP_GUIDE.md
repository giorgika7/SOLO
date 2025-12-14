# OTP Authentication Setup & Troubleshooting

## Your Issue: Account Already Exists

Your account `kajaia.giorgii@gmail.com` was created on **December 8, 2025** and is already confirmed in the system. The OTP verification was failing because the system was trying to create a duplicate user profile.

## ✅ What I Fixed

1. **Updated verification flow** - Now checks if your profile exists before trying to create it
2. **Better error handling** - Clearer error messages when OTP fails
3. **Database policies** - Proper permissions for existing users

## 🔑 How to Sign In Now

1. Click **"Back to Email"** button
2. Enter your email: `kajaia.giorgii@gmail.com`
3. Click **"Send OTP"**
4. Check your email for a fresh 8-digit code
5. Enter the code within 15 minutes
6. Click **"Verify OTP"**

The system will now:
- Verify your OTP
- Check if your profile exists (it does)
- Load your existing profile instead of creating a new one
- Sign you in successfully

## 🚨 Common Issues & Solutions

### Issue 1: "Failed to verify OTP"

**Possible causes:**
- OTP code expired (15 minute limit)
- Incorrect code entered
- Supabase email confirmation enabled (should be disabled)

**Solutions:**
1. Request a fresh OTP code
2. Double-check you entered all 8 digits correctly
3. Verify Supabase settings (see below)

### Issue 2: OTP Email Not Received

**Check:**
- Spam/junk folder
- Email address spelled correctly
- Supabase email provider configured

### Issue 3: "User already registered"

**This is normal!** You're signing in to an existing account, not creating a new one.

## ⚙️ Supabase Configuration Check

Go to [Supabase Dashboard](https://app.supabase.com/project/eofsuwvuqvctawfhcagt):

1. **Authentication → Providers → Email**
   - ❌ "Confirm email" should be **DISABLED**
   - ✅ "Enable email OTP" should be **ENABLED**

2. **Authentication → Email Templates**
   - Verify "Magic Link" template exists
   - Check "Confirm signup" is configured

3. **Authentication → Settings**
   - Check "Site URL" is correct
   - Verify "Redirect URLs" include your app URL

## 🧪 Testing Your Setup

### Test 1: Request OTP
```bash
# Should receive email within seconds
1. Enter email on login screen
2. Click "Send OTP"
3. Wait for email (check spam if not received)
```

### Test 2: Verify OTP
```bash
# Should sign in successfully
1. Enter 8-digit code from email
2. Click "Verify OTP"
3. Should redirect to app home screen
```

### Test 3: Check Browser Console
```bash
# Press F12 to open developer tools
# Look for any errors in Console tab
# Check Network tab for failed requests
```

## 🔍 Debug Information

Your account details:
- **User ID:** `89caa753-5c37-422f-89d7-0e24e355d3c9`
- **Email:** `kajaia.giorgii@gmail.com`
- **Created:** December 8, 2025
- **Status:** Confirmed ✓
- **Profile:** Exists ✓

## 🛠️ Advanced Troubleshooting

### View Auth Logs in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Authentication → Logs**
3. Look for recent verification attempts
4. Check for specific error messages

### Check Database Permissions

Run this in Supabase SQL Editor:

```sql
-- Verify your user profile exists
SELECT id, email, created_at, balance, currency
FROM users
WHERE email = 'kajaia.giorgii@gmail.com';

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

### Reset Your Account (Last Resort)

If nothing works, you can reset your account:

```sql
-- WARNING: This deletes your account data
-- Run in Supabase SQL Editor
DELETE FROM users WHERE email = 'kajaia.giorgii@gmail.com';
-- Then manually delete from Authentication → Users in dashboard
```

After deletion, you can register as a new user.

## 📧 Email Provider Setup

Ensure Supabase email is configured:

1. **Development:** Uses Supabase's built-in SMTP
   - Limited to 4 emails per hour
   - Good for testing

2. **Production:** Configure custom SMTP
   - Go to **Project Settings → Auth**
   - Add SendGrid, AWS SES, or other provider
   - No rate limits

## 🔐 Security Best Practices

1. **OTP codes are single-use** - Each code can only be used once
2. **15-minute expiration** - Request new code if expired
3. **Rate limiting** - Max 4 OTP requests per hour in development
4. **No password** - OTP-only authentication for this app

## 📱 Mobile App Considerations

If testing on mobile:
- Ensure device has internet connection
- Check if email app is configured
- Try copying OTP code from email to app
- Make sure app has proper permissions

## ✅ Success Checklist

- [x] Account exists in database
- [x] User profile exists
- [x] Email is confirmed
- [x] Code updated to handle existing users
- [ ] Request fresh OTP
- [ ] Enter OTP within 15 minutes
- [ ] Successfully sign in

## 🆘 Still Having Issues?

1. **Check browser console** (F12) for detailed errors
2. **Check Supabase logs** in dashboard
3. **Try incognito/private window**
4. **Clear browser cache**
5. **Try different email address**

If none of these work, the issue might be with Supabase's email service or configuration. Check the Supabase status page or contact their support.

---

**Next Steps:** Try signing in again with a fresh OTP code. The system is now ready to handle your existing account properly!
