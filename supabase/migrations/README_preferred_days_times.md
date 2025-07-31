# Database Migration: Add Preferred Days and Times to user_info

## Migration File
- `20240128_add_preferred_days_and_times.sql`

## What this migration does
Adds 4 new columns to the `user_info` table:
- `preferred_days` (text[]): Array of preferred work days (월, 화, 수, 목, 금, 토, 일)
- `days_negotiable` (boolean): Whether work days are negotiable
- `preferred_times` (text[]): Array of preferred time slots (오전, 오후, 저녁, 새벽)
- `times_negotiable` (boolean): Whether work times are negotiable

## How to apply this migration

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `20240128_add_preferred_days_and_times.sql`
4. Run the query

### Option 2: Via Supabase CLI
```bash
supabase db push
```

## Code Changes Made
1. **Updated UserInfo interface** in `hooks/useProfile.ts` to include new fields
2. **Updated info.tsx** to save preferred days/times when updating profile
3. **Updated application-form.tsx** to pre-populate days/times from user profile

## Testing
After applying the migration, test by:
1. Going to the info page as an onboarded user
2. Setting preferred work days and times
3. Saving the profile
4. Creating a new job application - the days/times should be pre-populated