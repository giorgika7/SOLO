# Temporary Password System Guide

## Overview

The SOLO eSIM app now uses a temporary password system instead of password reset links. This solves the production redirect issue and provides a better mobile experience.

## How It Works

### 1. User Requests Temporary Password

- User clicks "Forgot Password?" on login screen
- Enters their email address
- Clicks "Send Temporary Password"

### 2. Backend Processing (Edge Function)

The `send-temp-password` Edge Function:
- Validates the email address
- Finds the user in the database
- Generates a secure 8-character temporary password (uppercase letters and numbers)
- Updates the user's password in Supabase Auth
- Sets `temp_password: true` flag in user metadata
- Records creation timestamp for 24-hour expiration
- Sends email with temporary password (when email service configured)

### 3. User Logs In

- User receives email with temporary password
- Logs in using the temporary password
- Optional toast notification reminds them to change password
- Can continue using the app normally

### 4. User Changes Password

- Goes to Profile (More tab)
- Clicks "Change Password" button
- Enters:
  - Current password (the temporary one)
  - New password (minimum 6 characters)
  - Confirms new password
- Password strength indicator shows Weak/Medium/Strong
- On success, `temp_password` flag is cleared

## Security Features

### Password Expiration

Temporary passwords expire:
- After first successful login (optional - not enforced currently)
- After 24 hours (metadata includes timestamp)

### Password Strength Validation

- Minimum 6 characters
- Real-time strength indicator:
  - **Weak**: Less than 6 characters
  - **Medium**: 6-9 characters
  - **Strong**: 10+ characters

### Secure Password Generation

- Uses only uppercase letters and numbers (no confusing characters like O/0, I/1)
- 8 characters long
- Generated server-side using cryptographically secure random

## Technical Implementation

### Files Modified

1. **supabase/functions/send-temp-password/index.ts** (new)
   - Edge Function that handles temporary password generation
   - Uses Supabase Admin API to update user password
   - Includes email sending logic (requires RESEND_API_KEY)

2. **services/auth.ts**
   - Replaced `resetPassword()` with `sendTemporaryPassword()`
   - Added `updatePassword()` function
   - Handles verification of current password before update
   - Clears temp password flag after successful change

3. **app/login.tsx**
   - Updated modal title: "Get Temporary Password"
   - Updated description text
   - Changed button text: "Send Temporary Password"
   - Updated success message

4. **app/(tabs)/more.tsx**
   - Added "Change Password" button in profile section
   - Created password change modal with:
     - Current password field
     - New password field with strength indicator
     - Confirm password field
     - All fields have show/hide toggles
   - Added password validation logic
   - Added password strength calculation

## Environment Variables

Required for the Edge Function:
- `SUPABASE_URL` (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically available)
- `RESEND_API_KEY` (optional - for email sending)

Available in frontend:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Email Configuration (Optional)

The Edge Function supports email sending via Resend:

1. Sign up for Resend account
2. Get API key
3. Configure domain verification
4. Edge Function will automatically send emails

### Development Mode (No Email Service)

If no RESEND_API_KEY is configured:
- Function still works and generates temporary password
- Password is returned in API response as `debug_password` field
- Password is logged to console
- User sees password in an Alert dialog (marked "Development Only")
- No email is sent

**IMPORTANT**: The `debug_password` field in the response is for development/testing only and should be removed before production deployment. In production, configure a proper email service.

## User Experience Flow

### Happy Path (Development Mode)

1. User forgets password → clicks "Forgot Password?"
2. Enters email → clicks "Send Temporary Password"
3. Sees Alert dialog with temporary password (e.g., "K7N3R8Z2")
4. Clicks OK and copies the password
5. Logs in with temporary password
6. Sees toast: "Login successful!"
7. Goes to Profile → clicks "Change Password"
8. Enters temporary password as current password
9. Enters and confirms new password
10. Sees "Password changed successfully!"
11. Can now use new password for future logins

### Happy Path (Production with Email)

1. User forgets password → clicks "Forgot Password?"
2. Enters email → clicks "Send Temporary Password"
3. Receives success toast: "Temporary password sent to your email!"
4. Checks email → copies temporary password
5. Logs in with temporary password
6. Sees toast: "Login successful!"
7. Goes to Profile → clicks "Change Password"
8. Enters temporary password as current password
9. Enters and confirms new password
10. Sees "Password changed successfully!"
11. Can now use new password for future logins

### Error Handling

- **Email not found**: "No account found with this email address"
- **Invalid email format**: "Please enter a valid email address"
- **Current password wrong**: "Current password is incorrect"
- **Passwords don't match**: "Passwords do not match"
- **Password too short**: "Password must be at least 6 characters"
- **Network errors**: "Failed to send temporary password"

## Future Enhancements

### Optional (Not Implemented)

1. **Force Password Change**: Make users change password immediately after logging in with temp password
2. **Expiration Enforcement**: Automatically invalidate temp password after 24 hours
3. **Rate Limiting**: Prevent abuse of temporary password requests
4. **Password History**: Prevent reusing recent passwords
5. **Two-Factor Authentication**: Add extra security layer

## Testing

### Test Scenarios

1. **Request temporary password for existing user**
   - Should receive success message
   - Should be able to login with temp password

2. **Request temporary password for non-existent user**
   - Should receive appropriate error message

3. **Change password after logging in**
   - Should verify current password
   - Should enforce minimum length
   - Should match confirmation
   - Should show strength indicator

4. **Change password with wrong current password**
   - Should display error: "Current password is incorrect"

5. **Change password with mismatched confirmation**
   - Should display error: "Passwords do not match"

## Support

If users report not receiving the temporary password email:
1. Check spam/junk folder
2. Verify email is correct
3. Check Edge Function logs in Supabase dashboard
4. Verify RESEND_API_KEY is configured (if using email)
5. Manually communicate the password (check console logs)

## Differences from Old System

### Old System (Reset Link)
- ❌ Sent reset link via email
- ❌ Link redirected to localhost (broken in production)
- ❌ Required web browser flow
- ❌ Not mobile-friendly

### New System (Temporary Password)
- ✅ Sends password directly via email
- ✅ Works in production
- ✅ Mobile-friendly
- ✅ Simple copy-paste flow
- ✅ User can change password anytime
- ✅ Clear expiration policy

## Preparing for Production

Before deploying to production, you should:

1. **Configure Email Service**
   - Sign up for Resend (or another email service)
   - Get your API key
   - Set `RESEND_API_KEY` environment variable in Supabase
   - Verify domain ownership in Resend dashboard
   - Update the "from" email address in the Edge Function

2. **Remove Development Code** (Optional but Recommended)
   - The `debug_password` field will automatically not be included when `RESEND_API_KEY` is set
   - However, you may want to remove the development code entirely from `app/login.tsx`:
     ```typescript
     // Remove this section in production:
     if (data.debug_password) {
       Alert.alert(
         'Temporary Password (Development Only)',
         `Your temporary password is:\n\n${data.debug_password}\n\nPlease use this to login and then change your password in Profile > Change Password.`,
         [{ text: 'OK' }]
       );
       setShowForgotPassword(false);
       setResetEmail('');
     } else {
     ```
   - And simplify to always show the success toast

3. **Test Email Delivery**
   - Test with your own email address first
   - Check spam/junk folders
   - Verify email formatting and links
   - Test with different email providers (Gmail, Outlook, etc.)

4. **Monitor Usage**
   - Check Edge Function logs in Supabase dashboard
   - Monitor for failed email deliveries
   - Track temporary password usage patterns
