Below is a per-story engineering inventory that is BOTH MECE (no overlaps, no gaps) and aligned with the Nx folder layout defined in weople_migration.md (apps/web, apps/mobile, libs/shared, libs/web, libs/mobile).
Each story is treated as its own “mini-domain”.
Everything is expressed in implementation language (paths, class signatures …); you can paste the ERDs directly into Mermaid-enabled docs.

───────────────────────────────
USER STORY 1 – SIGN-UP
───────────────────────────────
Screens
• Web: apps/web/src/routes/(auth)/register/+page.svelte
• Mobile: apps/mobile/src/screens/RegisterScreen.tsx

UI Components
• <AuthForm mode="signup"> – libs/shared/ui/src/lib/AuthForm.svelte
• <PasswordStrengthBar> – libs/shared/ui

Required Inputs / Outputs
• IN: email:string, password:string
• OUT: AuthResult { userId:uuid; email:string }

Imports / Exports

```ts
// libs/shared/data-access/src/lib/auth.ts
export async function signUp(
  email: string,
  password: string,
): Promise<AuthResult>;
```

Classes / Stores

```ts
export interface AuthState {
  status: 'idle' | 'loading' | 'error' | 'authenticated';
  error?: string;
  user?: { id: string; email: string };
}
export const authStore = writable<AuthState>({ status: 'idle' });
```

Input Sources → Output Consumers
Form → Supabase Auth → Edge Fn create-profile → profiles table → authStore

State Machine
idle ➜ loading ➜ authenticated | error

Edge Functions
apps/api/functions/create-profile/index.ts

ERD (sub-domain)

```mermaid
erDiagram
  USERS ||--o{ PROFILES : owns
  USERS { uuid id PK; text email }
  PROFILES { uuid user_id FK; text full_name }
```

───────────────────────────────
USER STORY 2 – LOGIN
───────────────────────────────
Screens: login pages analogous to sign-up.
Components: <AuthForm mode="login">, <ForgotPasswordLink>.
Function: `signIn(email,pwd):Promise<AuthResult>`
States: idle → checking → authenticated | error
Edge Fn: none (Supabase built-in).
ERD: same USERS/PROFILES.

───────────────────────────────
USER STORY 3 – ADD CONTACT
───────────────────────────────
Screens
• Web: apps/web/src/routes/contacts/+page.svelte
• Mobile: apps/mobile/src/screens/ContactsScreen.tsx

UI Components
• <ContactFormModal> – libs/shared/ui
• <ContactCard>/<ContactRow> – libs/web/ui and libs/mobile/ui

Classes & Functions

```ts
export type ContactInput = {
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
};
export async function addContact(i: ContactInput): Promise<Contact>;
export async function listContacts(userId: string): Promise<Contact[]>;
```

State & Transitions
list{empty} → loading → populated
modal closed → editing → saving → closed

Edge Fn
apps/api/functions/dedupe-contact/index.ts

IO Flow
UserForm → contactsStore → Supabase contacts table → list view

ERD

```mermaid
erDiagram
  USERS ||--o{ CONTACTS : owns
  CONTACTS { uuid id PK; uuid user_id FK; text full_name; text email; text phone; text company; timestamptz created_at }
```

───────────────────────────────
USER STORY 4 – LOG INTERACTION
───────────────────────────────
Screens: contact detail timeline.
UI: <InteractionFormModal>, <InteractionTimeline>.
Function signature:

```ts
export type InteractionInput = {
  contact_id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  occurred_at: Date;
  notes: string;
};
export async function addInteraction(i: InteractionInput): Promise<Interaction>;
```

State: closed → open → saving → closed.
Edge Fn: apps/api/functions/analyse-interaction (sentiment).

ERD

```mermaid
erDiagram
  CONTACTS ||--o{ INTERACTIONS : rel
  INTERACTIONS { uuid id PK; uuid contact_id FK; text type; timestamptz occurred_at; text notes; jsonb metadata }
```

───────────────────────────────
USER STORY 5 – FOLLOW-UPS
───────────────────────────────
Screens: FollowUpDashboard (web/mobile).
UI: <FollowUpFormModal>, <FollowUpCard>.
Class:

```ts
class FollowUpScheduler {
  static async schedule(input: {
    contact_id: string;
    due: Date;
    note: string;
  }): Promise<FollowUp>;
}
```

States: scheduled → completed / overdue.
Edge Fn: functions/notify-followups (cron).

ERD

```mermaid
erDiagram
  CONTACTS ||--o{ FOLLOW_UPS : rel
  FOLLOW_UPS { uuid id PK; uuid contact_id FK; timestamptz due_date; timestamptz completed_at; text note }
```

───────────────────────────────
USER STORY 6 – CONTACT IMPORT
───────────────────────────────
Screens: <ContactImportModal>.
Classes

```ts
class GoogleImporter {
  constructor(accessToken: string);
  fetchContacts(): Promise<ContactInput[]>;
}
```

States: idle → connecting → fetching → reviewing → importing → done.
Edge Fns: google-oauth-callback, batch-import.
IO: OAuth token → Google People API → batch import → Supabase.

ERD: same CONTACTS plus import_source.

───────────────────────────────
USER STORY 7 – TAGGING
───────────────────────────────
UI Components: <TagInput>, <TagFilterChips>.
Functions: createTag(name), addTagToContact(tagId, contactId).
Edge Fn: none.

ERD

```mermaid
erDiagram
  CONTACTS ||--o{ CONTACT_TAGS : tag
  TAGS ||--o{ CONTACT_TAGS : tag
  TAGS { uuid id PK; uuid user_id FK; text name }
  CONTACT_TAGS { uuid contact_id FK; uuid tag_id FK }
```

───────────────────────────────
USER STORY 8 – OPPORTUNITIES
───────────────────────────────
Screens: apps/web/src/routes/opportunities/+page.svelte
UI: <OpportunityCard>, <OpportunityFormModal>, <ContactSearchSelect>.
Functions:

```ts
export interface OpportunityInput {
  title: string;
  value: number;
  status: 'open' | 'won' | 'lost';
}
export async function createOpportunity(
  o: OpportunityInput,
): Promise<Opportunity>;
```

ERD

```mermaid
erDiagram
  USERS ||--o{ OPPORTUNITIES : owns
  CONTACTS ||--o{ OPPORTUNITY_CONTACTS : link
  OPPORTUNITIES { uuid id PK; uuid user_id FK; text title; numeric value; text status }
  OPPORTUNITY_CONTACTS { uuid opportunity_id FK; uuid contact_id FK }
```

───────────────────────────────
USER STORY 9 – DASHBOARD OVERVIEW
───────────────────────────────
Screen: apps/web/src/routes/dashboard/+page.svelte
Widgets: <MetricCard>, <NetworkGrowthChart>, <UpcomingFollowUpsWidget>.
Core engine: libs/shared/data-access/src/lib/analytics.engine.ts
States: loading → ready (per-widget).
Edge Fn: functions/aggregate-metrics.

───────────────────────────────
USER STORY 10 – ACCOUNT SETTINGS
───────────────────────────────
Screen: apps/web/src/routes/settings/+page.svelte
UI: <ProfileForm>, <PasswordUpdateForm>, <DangerZoneCard>.
Functions: auth.updateUser(), updateProfile(profileInput).
States per section: idle → saving → success | error.
Edge Fn: none.
ERD extends USERS / PROFILES.

───────────────────────────────
USER STORY 11 – DUPLICATE CONTACT HANDLING
───────────────────────────────
Trigger Points: ContactFormModal & Import workflow.
UI: <DuplicateResolverModal>.
Functions:

```ts
export async function findDuplicates(
  email?: string,
  phone?: string,
): Promise<DuplicateMatch[]>;
export async function resolveDuplicate(opts: {
  existingId: string;
  incoming: ContactInput;
  strategy: 'merge' | 'overwrite';
}): Promise<Contact>;
```

States: detecting → conflict → user-choice → resolved.
Edge Fn: functions/dedupe-contact.

ERD

```mermaid
erDiagram
  CONTACTS ||--o{ CONTACT_MERGE_LOG : merges
  CONTACT_MERGE_LOG { uuid id PK; uuid kept_id FK; uuid merged_id FK; timestamptz merged_at; text strategy }
```
