# Store Release Checklist - Smart Udhaar

## 1) Authentication finalization (Email OTP)

- In Supabase -> Authentication -> Email Templates:
  - `Magic Link` template must contain `{{ .Token }}` and must not contain `{{ .ConfirmationURL }}`.
  - `Confirm signup` template should also use `{{ .Token }}` to avoid magic-link confusion for new users.
- In app, OTP verification accepts both:
  - 6-digit code
  - Full verification URL with `token_hash` (fallback)

## 2) Legal URLs and contacts

- Publish privacy policy at a public HTTPS URL.
- Use support email: support@udhaartracker.app
- Add the same details to store listing.

## 3) Production app configuration

- App name: Smart Udhaar
- Android package: com.udhaartracker.app
- iOS bundle ID: com.udhaartracker.app
- Version: 1.0.1
- Android versionCode: 2
- iOS buildNumber: 1.0.1
- EAS build profiles are configured in `eas.json`.

## 4) Signing keys

- Android (Play): use EAS managed credentials.
  - `npx eas build -p android --profile production`
- iOS (App Store): sign in with Apple account in EAS.
  - `npx eas build -p ios --profile production`

## 5) Permission declaration (Notifications)

Store listing purpose text (recommended):

"Smart Udhaar uses notifications only to remind you about borrower payment reminders you set manually. Notifications are optional and can be turned off anytime in device settings."

## 6) Data/account expectations text (for listing)

Suggested short disclosure:

"The app requires sign-in with email OTP. Loan data is stored per account and protected by access rules so users can only see their own records. Contact support@udhaartracker.app for account or data deletion requests."

## 7) Final QA before submit

- Sign in with email OTP on a fresh install.
- Create, edit, delete loan.
- Add payment and verify totals.
- Reminder scheduling works and notifications appear.
- Logout returns user to auth screen.
- App relaunch restores session for logged-in users.
- No blank screens or navigation dead-ends.
