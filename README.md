# Udhaar Tracker

## Backend without separate deployment (Supabase)

This app now supports a managed backend using Supabase, with no separate Node/Express deployment required.

- If Supabase env vars are configured, loan data syncs with Supabase.
- If not configured (or network fails), the app falls back to local AsyncStorage.

### 1) Create Supabase project

Create a new project at [Supabase](https://supabase.com/).

### 2) Create loans table

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.

### 3) Configure env variables

Copy `.env.example` to `.env` and fill in your project values:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4) Restart Expo

After changing env values, restart Metro:

```bash
npx expo start -c
```

## Phone OTP (Supabase Auth)

This app includes a mobile-number sign-in screen using Supabase SMS OTP.

Enable OTP in Supabase:

1. Open Supabase Dashboard -> Authentication -> Providers.
2. Enable Phone provider.
3. Configure an SMS provider in Supabase Auth settings (Twilio/MessageBird/etc).
4. Save settings.

App flow:
- Language select -> Phone number -> OTP verify -> Home

## Notes

- Supabase integration is handled inside `src/storage/loanStorage.js`.
- Client setup is in `src/lib/supabaseClient.js`.
- No backend server deployment is required.
