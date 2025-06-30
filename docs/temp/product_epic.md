# Product Epic – Weople PRM (Nx Workspace Edition)

_Based on weople_migration.md – June 30 2025_

## 1. EPIC OVERVIEW

(unchanged)

## 2. USER STORIES & IMPLEMENTATION NOTES

All paths below use the Nx mono-repo layout:
• Web app source → `apps/web/...` (SvelteKit)
• Mobile app source → `apps/mobile/...` (Expo RN)
• Shared, Web-only and Mobile-only libraries → `libs/<scope>/<project>/...`

### US-1 Sign-Up

Implementation
‣ Web page `apps/web/src/routes/(auth)/register/+page.svelte`
‣ Mobile screen `apps/mobile/src/screens/RegisterScreen.tsx`
‣ Supabase helpers `libs/shared/data-access/src/lib/auth.ts`
‣ UI inputs `libs/shared/ui/src/lib/FormControls/*`
Tests
‣ Web `libs/web/feature-auth/src/__tests__/register.spec.ts`
‣ Mobile `libs/mobile/feature-auth/src/__tests__/register.spec.tsx`
Estimate 3 SP

### US-2 Login

Implementation
‣ Web `apps/web/src/routes/(auth)/login/+page.svelte`
‣ Mobile `apps/mobile/src/screens/LoginScreen.tsx`
‣ Stores `libs/shared/data-access/src/lib/session.store.ts`
Tests `libs/{web|mobile}/feature-auth/__tests__/login.spec.(ts|tsx)`
Estimate 2 SP

### US-3 Add Contact

Implementation
‣ Shared form modal `libs/shared/ui/src/lib/ContactFormModal.svelte`
‣ Web list/card `libs/web/feature-contacts/src/lib/ContactList.svelte`
‣ Mobile screens `libs/mobile/feature-contacts/src/ContactListScreen.tsx`
‣ Store `libs/shared/data-access/src/lib/contacts.store.ts`
Migration `supabase/migrations/20250610032041_shrill_marsh.sql`
Tests corresponding `__tests__` folders in each lib
Estimate 5 SP

### US-4 Log Interaction

Implementation
‣ Shared modal `libs/shared/ui/src/lib/InteractionFormModal.svelte`
‣ Web timeline `libs/web/feature-interactions/src/lib/InteractionTimeline.svelte`
‣ Mobile timeline `libs/mobile/feature-interactions/src/InteractionTimelineScreen.tsx`
‣ Store `libs/shared/data-access/src/lib/interactions.store.ts`
Migration `supabase/migrations/20250610032053_weathered_coral.sql`
Estimate 5 SP

### US-5 Follow-Up Reminders

Implementation
‣ Dashboard (web) `libs/web/feature-followups/src/lib/FollowUpDashboard.svelte`
‣ Dashboard (mobile) `libs/mobile/feature-followups/src/FollowUpListScreen.tsx`
‣ Modal `libs/shared/ui/src/lib/FollowUpFormModal.svelte`
‣ Store `libs/shared/data-access/src/lib/followUps.store.ts`
Migration `supabase/migrations/20250610133532_fierce_grove.sql`
Estimate 5 SP

### US-6 Contact Import

Implementation
‣ Wizard `libs/shared/ui/src/lib/ContactImportModal.svelte`
‣ OAuth helpers `libs/shared/data-access/src/lib/oauth.ts`
‣ Edge worker `apps/api/src/functions/import-contacts/index.ts`
Tests `libs/shared/data-access/__tests__/import.spec.ts`
Estimate 8 SP

### US-7 Tagging

Implementation
‣ Tag input `libs/shared/ui/src/lib/TagInput.svelte`
‣ Store `libs/shared/data-access/src/lib/tags.store.ts`
‣ Web filters `libs/web/feature-tags/src/lib/TagFilters.svelte`
Migration `supabase/migrations/20250610142408_dusty_swamp.sql`
Estimate 5 SP

### US-8 Opportunities

Implementation
‣ Page (web) `apps/web/src/routes/opportunities/+page.svelte`
‣ Card component `libs/shared/ui/src/lib/OpportunityCard.svelte`
‣ Store `libs/shared/data-access/src/lib/opportunities.store.ts`
Migration `supabase/migrations/20250610140455_violet_base.sql`
Estimate 8 SP

### US-9 Dashboard Overview

Implementation
‣ Dashboard shell `apps/web/src/routes/dashboard/+page.svelte`
‣ Analytics widgets `libs/web/feature-analytics/...`
‣ Engine `libs/shared/data-access/src/lib/analytics.engine.ts`
Estimate 5 SP

### US-10 Account Management

Implementation
‣ Settings page `apps/web/src/routes/settings/+page.svelte`
‣ Shared inputs `libs/shared/ui/...`
Estimate 3 SP

### US-11 Duplicate Contact Handling

Implementation
‣ Duplicate logic `libs/shared/data-access/src/lib/contacts.ts`
‣ Conflict-resolution modal `libs/shared/ui/src/lib/DuplicateResolver.svelte`
Estimate 5 SP

## 3. SHARED LIBRARIES & CROSS-CUTTING

Already generated (see Nx commands):
`libs/shared/{data-access,ui,types,utils,testing}`

## 4. PLATFORM FEATURE LIBRARIES

Web-only: `libs/web/feature-*` Mobile-only: `libs/mobile/feature-*`
Created for auth, contacts, interactions, followups, opportunities, analytics, generosity, tags, health, social, ai, network, settings, offline.

## 5. INFRASTRUCTURE / DEV-OPS

Edge functions live in `apps/api`.
Custom generators & scripts → `libs/tools/{infra,generators}`.
CI uses Nx affected commands plus Vercel & EAS workflows.

## 6. STORY-POINT SUMMARY

Base stories = 47 SP
Nx migration (NX-1 – NX-7) = 17 SP
Total epic effort = 64 SP
