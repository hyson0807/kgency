# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **kgency**, a React Native Expo job matching mobile application that connects job seekers with companies. The app features a dual-role system with separate interfaces for users (job seekers) and companies (employers), sophisticated job matching algorithms, and interview scheduling capabilities.

## Development Commands

### Mobile App (Current Directory)
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator (requires iOS dev setup)
- `npm run android` - Run on Android emulator (requires Android dev setup)
- `npm run web` - Run web version
- `npm run lint` - Run ESLint for code quality
- `npm install` - Install dependencies

### Server (../kgency_server)
- `cd ../kgency_server && npm start` - Start production server
- `cd ../kgency_server && npm run dev` - Start development server with nodemon
- `cd ../kgency_server && npm install` - Install server dependencies

### Build & Deploy
- `eas build --platform ios --profile development` - Build development iOS app
- `eas build --platform android --profile development` - Build development Android app
- `eas build --platform all --profile production` - Production build for both platforms
- Check `eas.json` for build configurations

## Architecture & Key Concepts

### Technology Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router with file-based routing
- **Language**: TypeScript with strict mode
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Custom Node.js API + Supabase for auth/database
- **State Management**: Hybrid approach using React Context API + Zustand
  - **React Context**: Authentication (AuthContext), Internationalization (TranslationContext)
  - **Zustand**: Complex form state management (job posting, application forms)

### Hybrid Data Architecture (Critical Understanding)
**This codebase uses a HYBRID approach mixing server API calls and direct Supabase database access:**

#### Server API Layer (`lib/api.ts`)
- **Development server**: `http://[LOCAL_IP]:5004` (configure in development environment)
- **Production server**: `[PRODUCTION_SERVER_URL]` (set via environment variables)
- JWT token-based authentication with automatic headers
- Used for: Authentication (OTP), some profile operations, account management

#### Direct Supabase Access (`lib/supabase.ts`)
- **Extensively used throughout the app** for direct database operations
- Used for: Profiles, keywords, applications, messages, job postings, interview data
- **Key files with direct DB access**: 
  - `hooks/useProfile.ts`, `hooks/useUserKeywords.ts`, `hooks/useApplications.ts`
  - `app/(company)/myJobPostings.tsx`, `app/(company)/home2.tsx`
  - `app/(pages)/(user)/(application-registration)/resume.tsx`
  - `app/(pages)/(user)/(user-information)/info.tsx`
- **Important**: Many operations bypass the server API entirely

#### When Adding New Features
- **Check existing patterns** in similar components to determine whether to use server API or direct Supabase
- **Profile-related operations**: Mix of both approaches
- **Real-time data** (messages, applications): Primarily direct Supabase
- **Authentication**: Server API only

### Authentication System
- JWT-based authentication with AsyncStorage persistence
- Dual user types: 'user' (job seekers) and 'company' (employers)
- AuthContext provides authentication state management
- Automatic token validation and session management
- Phone-based OTP authentication system

### File-Based Routing Structure
```
/app
├── (auth)/                    - Authentication screens
│   ├── start.tsx             - Landing page
│   ├── user_login.tsx        - Job seeker login
│   └── company_login.tsx     - Company login
├── (user)/                   - Job seeker interface with tabs
│   ├── home.tsx             - Job seeker home
│   ├── applications.tsx     - Application management
│   ├── user-calendar.tsx    - Interview calendar
│   └── settings.tsx         - User settings
├── (company)/                - Company interface with tabs
│   ├── home2.tsx            - Company home
│   ├── myJobPostings.tsx    - Job posting management
│   ├── interview-calendar.tsx - Interview scheduling
│   └── settings2.tsx        - Company settings
├── (pages)/                  - Feature-specific pages
│   ├── (user)/              - User-specific flows
│   │   ├── (application-registration)/ - Application process
│   │   ├── (application-management)/   - Application tracking
│   │   ├── (interview-management)/     - Interview management
│   │   └── (user-information)/         - Profile setup
│   └── (company)/           - Company-specific flows
│       ├── (job-posting-registration)/ - Job posting creation
│       ├── (company-information)/      - Company profile
│       └── (interview-management)/     - Interview management
├── _layout.tsx              - Root layout with providers
└── index.tsx                - App entry point
```

### Context Providers (Applied in Root Layout)
1. **TranslationProvider** - Internationalization support
2. **AuthProvider** - Authentication state and API requests
3. **SafeAreaProvider** - Safe area handling

### Core Business Logic

#### Job Suitability System (`lib/suitability/`)
- Sophisticated matching algorithm calculating compatibility scores (0-100)
- Five levels: 'perfect', 'excellent', 'good', 'fair', 'low'
- Category-based scoring with weighted calculations
- Keyword matching across multiple dimensions (countries, jobs, conditions, location, visa status, etc.)
- Bonus point system for keyword combinations
- Required keyword validation per category

#### Key Features
- **Dual role navigation**: Separate tab layouts for users vs companies
- **Interview scheduling**: Calendar-based interview slot management
- **Application tracking**: Complete application lifecycle management
- **Real-time messaging**: Communication between users and companies
- **Profile management**: Comprehensive user/company profiles
- **Multi-language support**: Built-in translation system

### Code Conventions

#### Import Patterns
- Use path aliases: `@/components`, `@/contexts`, `@/lib`, `@/hooks`
- Expo Router imports: `expo-router` for navigation
- Icon libraries: `@expo/vector-icons` with specific icon sets

#### Component Structure
- Functional components with TypeScript interfaces
- Custom hooks for data fetching (`useProfile`, `useApplications`, etc.)
- Context consumption via custom hooks (`useAuth`, `useTranslation`)

#### State Management Patterns
**Context API (Global State)**
- Use AuthContext for authentication state and API calls
- Use TranslationContext for internationalization
- AsyncStorage for persistent data (tokens, user data, onboarding status)

**Zustand (Complex Form State)**
- `stores/jobPostingStore.ts` - Job posting creation/editing workflow
- `stores/applicationFormStore.ts` - Multi-step application form state
- **Benefits**: Persistent draft saving, complex form navigation, undo/redo functionality
- **Pattern**: 
  ```typescript
  import { useJobPostingStore } from '@/stores/jobPostingStore';
  const { formData, updateField, resetForm } = useJobPostingStore();
  ```

**Local State (Component-Specific)**
- Use useState for simple component-specific data

#### API Integration Patterns
**Server API (via api function)**
- Use `api()` from `@/lib/api` for server API calls
- Automatic JWT token handling and 401 error management
- Structured API modules: `authAPI.sendOTP()`, `authAPI.verifyOTP()`, `profileAPI.get()`

**Direct Supabase (widespread usage)**
- Import `supabase` from `@/lib/supabase`
- Direct database operations: `supabase.from('table').select()`, `.insert()`, `.update()`, `.delete()`
- Complex joins and real-time subscriptions
- **Pattern**: Most data-heavy operations use this approach

### NativeWind Setup
- **Global CSS**: `app/global.css` imported in root layout
- **Metro config**: `metro.config.js` configured with NativeWind preset
- **Tailwind config**: `tailwind.config.js` includes app/**/* and components/**/* paths
- **Usage**: Standard Tailwind CSS classes work in React Native components

### Server Architecture (`../kgency_server`)
**Node.js Express server with modular MVC structure:**

#### Technology Stack
- **Framework**: Express.js 5.x
- **Authentication**: JWT tokens + Supabase integration
- **SMS**: Solapi for OTP verification
- **AI Services**: OpenAI API integration
- **Translation**: Google Translate API
- **Rate Limiting**: express-rate-limit

#### Server Structure
```
kgency_server/
├── server.js              - Entry point with environment validation
├── src/
│   ├── app.js             - Express app configuration
│   ├── config/            - Database, CORS, environment configs
│   ├── controllers/       - Request handlers (auth, applications, interviews, etc.)
│   ├── middlewares/       - Auth, validation, rate limiting, error handling
│   ├── routes/           - API route definitions
│   └── services/         - Business logic layer
```

#### Key API Endpoints (used by mobile app)
- **Authentication**: `/api/auth/send-otp`, `/api/auth/verify-otp`
- **Applications**: `/api/applications/*` (job application management)
- **Interviews**: `/api/interview/*` (scheduling and proposals)
- **Job Postings**: `/api/jobpostings/*` (company job management)
- **Translations**: `/api/translate/*` (Google Translate integration)
- **AI Services**: `/api/ai/*` (OpenAI integration for matching)

### Environment Setup

#### Mobile App
- **Required**: Supabase environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Development server**: Configure local IP address for testing environment
- **Expo development build**: Custom dev client enabled via `expo-dev-client`

#### Server (../kgency_server)
**Required environment variables:**
- `KEY_1`, `KEY_2` - Supabase keys
- `JWT_SECRET` - JWT token signing secret
- `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SENDER_PHONE` - SMS OTP service
- `GOOGLE_TRANSLATE_API_KEY` - Translation service
- `OPENAI_API_KEY` - AI services (if using OpenAI features)

### Database Schema Understanding

#### Database Technology
- **Database**: PostgreSQL (via Supabase)
- **Access Pattern**: Direct Supabase client for most operations
- **Real-time**: Supabase real-time subscriptions for live updates
- **Authentication**: Supabase Auth integrated with JWT tokens

#### Complete Database Schema

##### 1. **profiles** (User/Company profiles)
- **Purpose**: Core user and company profile data
- **Columns**:
  - `id` (uuid, PK) - References auth.users(id)
  - `name` (text) - User/company name
  - `phone_number` (text, unique) - Phone number for authentication
  - `user_type` (text) - 'user' or 'company'
  - `email` (text) - Optional email
  - `address` (text) - Company address
  - `description` (text) - Company description
  - `onboarding_completed` (boolean, default: false)
  - `job_seeking_active` (boolean, default: true) - For job seekers
  - `created_at` (timestamptz)

##### 2. **user_info** (Extended user information)
- **Purpose**: Detailed user profile for job matching
- **Columns**:
  - `id` (uuid, PK)
  - `user_id` (uuid, unique, FK → profiles.id)
  - `name` (text) - User's full name
  - `age` (smallint) - Age for matching
  - `gender` (text) - Gender preference matching
  - `visa` (text) - Visa status
  - `korean_level` (text) - Korean proficiency
  - `how_long` (text) - Duration in Korea
  - `experience` (text) - Work experience level
  - `experience_content` (text) - Detailed experience
  - `topic` (text) - Area of expertise
  - `created_at`, `updated_at` (timestamptz)

##### 3. **keyword** (Master keyword dictionary)
- **Purpose**: Central keyword repository for matching system
- **Columns**:
  - `id` (bigint, PK, auto-increment)
  - `keyword` (text) - Keyword text
  - `category` (text) - Categories: 'country', 'job', 'condition', 'location', 'visa', 'workDay', 'koreanLevel', 'gender', 'age', 'moveable'
- **Note**: Row Level Security (RLS) enabled

##### 4. **user_keyword** (User-keyword relationships)
- **Purpose**: Links users to their selected keywords
- **Columns**:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → profiles.id)
  - `keyword_id` (bigint, FK → keyword.id)
  - `created_at` (timestamptz)

##### 5. **company_keyword** (Company-keyword relationships)
- **Purpose**: Links companies to their preference keywords
- **Columns**:
  - `id` (uuid, PK)
  - `company_id` (uuid, FK → profiles.id)
  - `keyword_id` (bigint, FK → keyword.id)
  - `created_at` (timestamptz)

##### 6. **job_postings** (Company job listings)
- **Purpose**: Active job postings from companies
- **Columns**:
  - `id` (uuid, PK)
  - `company_id` (uuid, FK → profiles.id)
  - `title` (text, required) - Job title
  - `description` (text) - Job description
  - `hiring_count` (integer, default: 1)
  - `working_hours` (text)
  - `working_hours_negotiable` (boolean)
  - `working_days` (text[]) - Array of days
  - `working_days_negotiable` (boolean)
  - `salary_range` (text)
  - `salary_range_negotiable` (boolean)
  - `salary_type` (text) - hourly/monthly/etc
  - `pay_day` (text) - Payment schedule
  - `pay_day_negotiable` (boolean)
  - `job_address` (text) - Work location
  - `is_active` (boolean, default: true)
  - `created_at`, `updated_at` (timestamptz)
  - `deleted_at` (timestamptz) - Soft delete

##### 7. **job_posting_keyword** (Job posting-keyword relationships)
- **Purpose**: Links job postings to required/preferred keywords
- **Columns**:
  - `id` (uuid, PK)
  - `job_posting_id` (uuid, FK → job_postings.id)
  - `keyword_id` (bigint, FK → keyword.id)
  - `created_at` (timestamptz)

##### 8. **applications** (Job applications)
- **Purpose**: Tracks all job applications
- **Columns**:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → profiles.id)
  - `company_id` (uuid, FK → profiles.id)
  - `job_posting_id` (uuid, FK → job_postings.id)
  - `type` (varchar) - 'user_initiated', 'company_invited', 'user_instant_interview'
  - `status` (text, default: 'pending')
  - `resume_snapshot` (jsonb) - User data at application time
  - `message_id` (uuid, FK → messages.id)
  - `applied_at` (timestamptz)
  - `reviewed_at` (timestamptz)
  - `deleted_at` (timestamptz) - Soft delete
- **Constraints**: Unique on (user_id, job_posting_id)

##### 9. **messages** (Communication system)
- **Purpose**: Messages between users and companies
- **Columns**:
  - `id` (uuid, PK)
  - `sender_id` (uuid, FK → profiles.id)
  - `receiver_id` (uuid, FK → profiles.id)
  - `subject` (text)
  - `content` (text, required)
  - `is_read` (boolean, default: false)
  - `is_deleted` (boolean, default: false)
  - `created_at`, `updated_at` (timestamptz)

##### 10. **interview_slots** (Company interview availability)
- **Purpose**: Available time slots for interviews
- **Columns**:
  - `id` (uuid, PK)
  - `company_id` (uuid, FK → profiles.id)
  - `start_time` (timestamp)
  - `end_time` (timestamp)
  - `interview_type` (varchar, default: '대면')
  - `is_available` (boolean, default: true)
  - `created_at` (timestamp)

##### 11. **interview_proposals** (Interview invitations)
- **Purpose**: Interview scheduling proposals
- **Columns**:
  - `id` (integer, PK, auto-increment)
  - `application_id` (uuid, unique, FK → applications.id)
  - `company_id` (uuid, FK → profiles.id)
  - `location` (varchar)
  - `status` (varchar, default: 'pending')
  - `created_at` (timestamp)

##### 12. **interview_schedules** (Confirmed interviews)
- **Purpose**: Confirmed interview appointments
- **Columns**:
  - `id` (integer, PK, auto-increment)
  - `proposal_id` (integer, unique, FK → interview_proposals.id)
  - `interview_slot_id` (uuid, FK → interview_slots.id)
  - `confirmed_at` (timestamp)
  - `status` (varchar, default: 'confirmed')

##### 13. **translations** (Multi-language support)
- **Purpose**: Stores translations for all supported languages
- **Columns**:
  - `id` (uuid, PK)
  - `table_name` (text) - Source table
  - `column_name` (text) - Source column
  - `row_id` (bigint) - Source row ID
  - `language` (text) - Language code: en, ja, zh, vi, hi, si, ar, tr, my, ky, ha, mn
  - `translation` (text) - Translated content
  - `created_at` (timestamptz)

#### Database Features & Patterns

##### Data Types
- **UUIDs**: Primary keys for most tables
- **BIGINT**: Auto-incrementing IDs for keywords
- **JSONB**: Flexible data storage (resume_snapshot)
- **Arrays**: Lists like working_days
- **Timestamps**: Mix of timestamp and timestamptz

##### Key Patterns
- **Soft Deletes**: Using deleted_at timestamp
- **Audit Fields**: created_at, updated_at on most tables
- **Status Tracking**: Enum-like status fields
- **Snapshot Data**: JSONB for point-in-time data capture

##### Common Query Patterns
```typescript
// Direct Supabase queries used throughout
const { data } = await supabase
  .from('profiles')
  .select('*, user_info(*)')
  .eq('id', userId)
  .single();

// Complex joins for job matching
const applications = await supabase
  .from('applications')
  .select(`
    *,
    profiles!user_id(*),
    job_postings(*, company:profiles!company_id(*))
  `)
  .eq('user_id', userId);
```

### Key Files to Understand

#### Mobile App Core
- `contexts/AuthContext.tsx` - Authentication system and API client
- `lib/suitability/` - Job matching algorithm implementation  
- `lib/api.ts` - API configuration and helper functions
- `lib/supabase.ts` - Direct database client configuration
- `app/_layout.tsx` - Root providers and navigation setup
- `app/(user)/_layout.tsx` and `app/(company)/_layout.tsx` - Role-specific navigation

#### State Management
- `stores/jobPostingStore.ts` - Job posting form state (Zustand)
- `stores/applicationFormStore.ts` - Application form state (Zustand)
- `contexts/AuthContext.tsx` - Authentication state (Context API)
- `contexts/TranslationContext.tsx` - Internationalization (Context API)

#### Data Management Hooks
- `hooks/useProfile.ts` - User/company profile management
- `hooks/useUserKeywords.ts` - Keyword selection and management
- `hooks/useApplications.ts` - Job application tracking

#### Component Architecture
- `components/register_jobPosting(info2)/` - Modular job posting forms
  - `JobBasicInfoForm.tsx` - Basic job information
  - `SalaryInfoForm.tsx` - Salary configuration component
  - `WorkScheduleForm.tsx` - Working schedule component
  - `WorkLocationForm.tsx` - Job location setup
- `components/application-form/` - Application form components
  - `Personal-Information.tsx` - Personal details
  - `WorkExperience-Information.tsx` - Work experience
  - `Detail-Information.tsx` - Additional details
- `components/common/` - Reusable UI components
  - `BaseKeywordSelector.tsx` - Keyword selection base
  - `MultiSelectKeywordSelector.tsx` - Multi-select keywords
  - `Header.tsx`, `BottomButton.tsx` - Layout components
- `components/interview-calendar/` - Interview scheduling components
- `components/posting-detail/` - Job posting display components

#### Server (`../kgency_server`)
- `server.js` - Entry point with environment validation
- `src/app.js` - Express app configuration and middleware setup
- `src/controllers/auth.controller.js` - OTP authentication logic
- `src/services/auth.service.js` - JWT token management and validation
- `src/config/database.js` - Supabase client configuration
- `src/middlewares/auth.js` - JWT authentication middleware