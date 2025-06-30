# Nx Weople File Structure

## Previous Weople Project Structure

The Weople project currently follows a **traditional SvelteKit structure** with these key directories:

```text
Weople/
├── src/
│   ├── components/
│   │   ├── analytics/
│   │   ├── generosity/
│   │   ├── ai/
│   │   └── __tests__/
│   ├── lib/
│   │   ├── services/
│   │   └── stores/
│   ├── pages/
│   └── stores/
├── weople-mobile/ # Expo React Native app
├── supabase/
│   ├── migrations/
│   └── functions/
├── scripts/
├── docs/
└── tests/
```

## Current Project Structure

```text
weople-workspace/
├── apps/
│   ├── web/ # SvelteKit web app
│   │   ├── src/
│   │   │   ├── app.html
│   │   │   ├── routes/
│   │   │   └── lib/
│   │   ├── vite.config.ts
│   │   ├── svelte.config.js
│   │   └── project.json
│   ├── mobile/ # Expo React Native app
│   │   ├── app/
│   │   ├── components/
│   │   ├── assets/
│   │   └── project.json
│   └── api/ # Supabase Edge Functions
│       ├── functions/
│       └── project.json
├── libs/
│   ├── shared/
│   │   ├── data-access/ # Supabase client, API calls
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── supabase.ts
│   │   │   │   │   ├── contacts.ts
│   │   │   │   │   └── analytics.ts
│   │   │   └── project.json
│   │   ├── ui/ # Shared UI components
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── ContactCard/
│   │   │   │   │   ├── AnalyticsChart/
│   │   │   │   │   └── GenerosityTracker/
│   │   │   └── project.json
│   │   ├── types/ # Shared TypeScript types
│   │   │   ├── src/
│   │   │   │   ├── database.types.ts
│   │   │   │   ├── contact.types.ts
│   │   │   │   └── analytics.types.ts
│   │   │   └── project.json
│   │   └── utils/ # Shared utilities
│   │       ├── src/
│   │       │   ├── lib/
│   │       │   │   ├── formatters.ts
│   │       │   │   ├── validators.ts
│   │       │   │   └── ai-helpers.ts
│   │       └── project.json
│   ├── web/
│   │   ├── feature-contacts/ # Web-specific contact features
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── ContactList.svelte
│   │   │   │   │   ├── ContactForm.svelte
│   │   │   │   │   └── contacts.store.ts
│   │   │   └── project.json
│   │   ├── feature-analytics/ # Web-specific analytics
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── Dashboard.svelte
│   │   │   │   │   └── analytics.store.ts
│   │   │   └── project.json
│   │   └── feature-generosity/ # Web-specific generosity tracking
│   │       ├── src/
│   │       │   ├── lib/
│   │       │   │   ├── GenerosityDashboard.svelte
│   │       │   │   └── generosity.store.ts
│   │       └── project.json
│   └── mobile/
│       ├── feature-contacts/ # Mobile-specific contact features
│       │   ├── src/
│       │   │   ├── ContactListScreen.tsx
│       │   │   └── ContactDetailScreen.tsx
│       │   └── project.json
│       ├── feature-analytics/ # Mobile-specific analytics
│       │   ├── src/
│       │   │   ├── DashboardScreen.tsx
│       │   │   └── ChartsComponent.tsx
│       │   └── project.json
│       └── ui/ # Mobile-specific UI components
│           ├── src/
│           │   ├── Button/
│           │   ├── Input/
│           │   └── Card/
│           └── project.json
├── tools/
│   ├── eslint-rules/ # Custom ESLint rules
│   ├── scripts/ # Build and deployment scripts
│   └── generators/ # Nx generators for components
├── nx.json # Nx workspace configuration
├── package.json # Root package.json
├── tsconfig.base.json # Base TypeScript config
└── workspace.json # Workspace projects configuration
```

## Key Differences with Nx Structure

### 1. Separation by Application vs Feature

- **Current**: Features mixed within single app structure
- **Nx**: Clear separation between web (`apps/web/`) and mobile (`apps/mobile/`) applications

### 2. Shared Libraries

- **Current**: Shared logic in `src/lib/`
- **Nx**: Dedicated `libs/shared/` with specific purposes:
  - `libs/shared/data-access/` - API calls, Supabase client
  - `libs/shared/ui/` - Platform-agnostic components
  - `libs/shared/types/` - TypeScript definitions
  - `libs/shared/utils/` - Helper functions

### 3. Platform-Specific Features

- **Current**: All web components in `src/components/`
- **Nx**: Separate libraries for each platform:
  - `libs/web/feature-contacts/` - Web-specific contact management
  - `libs/mobile/feature-contacts/` - Mobile-specific contact management

### 4. Build Graph and Dependencies

- **Current**: Manual dependency management
- **Nx**: Automatic dependency graph with commands like:

```bash
nx graph # Visualize project dependencies
nx affected:build # Build only affected projects
nx affected:test # Test only affected projects
```

### 5. Development Commands

- **Current**: Single app commands (`pnpm dev`, `pnpm build`)
- **Nx**: Project-specific commands:

```bash
nx serve web # Serve web app
nx serve mobile # Serve mobile app
nx build web # Build web app
nx test shared-data-access # Test specific library
nx lint web # Lint web app only
```

The Nx structure would provide better **code reuse**, **dependency management**, and **scalability** for a project like Weople that has both web and mobile applications sharing common business logic.

## Core Feature Libraries (would get their own folders)

### 🎪 Contact Management Features

```text
libs/web/feature-contacts/
libs/mobile/feature-contacts/
```

- Contact creation, editing, deletion
- Contact import (Google Contacts, CSV, etc.)
- Contact search and filtering
- Contact cards and list views
- Contact detail modals
- Contact conflict resolution

### 🔄 Interaction Tracking Features

```text
libs/web/feature-interactions/
libs/mobile/feature-interactions/
```

- Interaction logging (meetings, calls, emails, notes)
- Interaction timeline and history
- Interaction form modals
- Interaction analytics and insights

### 🏥 Relationship Health Features

```text
libs/web/feature-health/
libs/mobile/feature-health/
```

- Health score calculation and display
- Health dashboard
- Health metrics and trends
- Relationship health monitoring

### ⏰ Follow-up Management Features

```text
libs/web/feature-followups/
libs/mobile/feature-followups/
```

- Follow-up creation and scheduling
- Follow-up dashboard
- Follow-up reminders and notifications
- Follow-up form modals

### 🎯 Opportunity Detection Features

```text
libs/web/feature-opportunities/
libs/mobile/feature-opportunities/
```

- Opportunity identification
- Opportunity tracking and management
- CRM opportunity cards
- Opportunity form modals

### 🎁 Generosity & Value Tracking Features

```text
libs/web/feature-generosity/
libs/mobile/feature-generosity/
```

- Value-add opportunities tracking
- Favor exchange monitoring
- Knowledge sharing tracking
- Generosity metrics and scoring
- Donation/contribution tracking

### 📊 Analytics & Insights Features

```text
libs/web/feature-analytics/
libs/mobile/feature-analytics/
```

- Network health metrics
- Interaction analytics
- User activity dashboard
- Performance metrics
- Analytics charts and visualizations

### 🌐 Social Media Integration Features

```text
libs/web/feature-social/
libs/mobile/feature-social/
```

- Multi-platform sync (LinkedIn, Twitter/X, Bluesky, Threads)
- Social media engagement tracking
- Cross-platform analytics
- Automatic contact matching

### 🧠 AI-Powered Features

```text
libs/web/feature-ai/
libs/mobile/feature-ai/
```

- AI communication assistance
- Smart message generation
- Network gap analysis
- AI recommendations
- Communication effectiveness scoring

### 🔐 Authentication Features

```text
libs/web/feature-auth/
libs/mobile/feature-auth/
```

- Login, registration, password reset
- OAuth integration (Google, etc.)
- Profile management
- Password update flows

### 🏷️ Tag Management Features

```text
libs/web/feature-tags/
libs/mobile/feature-tags/
```

- Tag creation and management
- Tag input components
- Tag filtering and organization

### 🌐 Network Analysis Features

```text
libs/web/feature-network/
libs/mobile/feature-network/
```

- Network visualization
- Connection path finding
- Network gap analysis
- Network filters and insights

### ⚙️ Settings & Configuration Features

```text
libs/web/feature-settings/
libs/mobile/feature-settings/
```

- User preferences
- Application settings
- Privacy controls
- Account management

### 📱 Offline & Sync Features

```text
libs/web/feature-offline/
libs/mobile/feature-offline/
```

- Offline storage management
- Sync status indicators
- Conflict resolution
- Offline capabilities

## Shared Feature Libraries

### 🎨 UI Component Libraries

```text
libs/shared/ui/ # Cross-platform components
libs/web/ui/ # Web-specific UI components
libs/mobile/ui/ # Mobile-specific UI components
```

### 📡 Data Access Libraries

```text
libs/shared/data-access/ # Supabase client, API calls
libs/shared/types/ # TypeScript definitions
libs/shared/utils/ # Shared utilities
```

### 🧪 Testing Libraries

```text
libs/shared/testing/ # Shared test utilities
libs/web/testing/ # Web-specific test helpers
libs/mobile/testing/ # Mobile-specific test helpers
```

## Additional Supporting Features

### 📊 Performance & Monitoring

```text
libs/shared/performance/ # Performance tracking
libs/shared/monitoring/ # Error tracking, analytics
```

### 🔧 Developer Tools

```text
libs/shared/dev-tools/ # Development utilities
libs/shared/storybook/ # Storybook configurations
```

Each of these would be organized as separate Nx libraries with their own `project.json` files, allowing for:

- **Independent development** of each feature
- **Granular testing** of specific functionality
- **Selective building** of only changed features
- **Clear dependency management** between features
- **Code sharing** between web and mobile platforms

---
