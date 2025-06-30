# WEOPLE AI CODING AGENT PROMPTS

## USER STORY 1: SIGN UP

### Cycle A - Core Authentication Functionality

**RED-A:** Create a failing Vitest test in `libs/shared/data-access/src/__tests__/auth.test.ts` that verifies the `signUp(email: string, password: string)` function calls Supabase's `signUp` method, creates a user profile in the `profiles` table with Row Level Security, and returns `{ success: true, user: UserData }` for valid credentials "test@example.com" and "TestPass123!".

**GREEN-A:** Implement the minimal `signUp` function in `libs/shared/data-access/src/lib/auth.ts` that passes the test by calling `supabase.auth.signUp()`, inserting into the `profiles` table with `user_id`, `full_name`, and `email` fields, and returning the expected response format.

**BLUE-A:** Refactor the auth module to extract a `ProfileService` class in `libs/shared/data-access/src/lib/profile.service.ts` that handles profile creation, and add proper TypeScript interfaces for `SignUpInput`, `AuthResult`, and `UserProfile` in `libs/shared/types/src/auth.types.ts`.

**REG-A:** Add regression tests for invalid email formats, weak passwords (using the password strength requirements from the spec), duplicate email handling, and Supabase connection failures with proper error message assertions.

### Cycle B - Web Registration UI

**RED-B:** Write a failing test in `apps/web/src/routes/(auth)/register/__tests__/+page.test.ts` using Testing Library that mounts the registration page, fills in valid form data, clicks submit, and expects the `signUp` function to be called with correct parameters and redirect to `/dashboard` on success.

**GREEN-B:** Create the registration page at `apps/web/src/routes/(auth)/register/+page.svelte` with form inputs for email, password, confirm password, and full name, using DaisyUI form components, client-side validation, and calling the shared `signUp` function from the data-access library.

**BLUE-B:** Extract reusable form components to `libs/shared/ui/src/lib/AuthForm.svelte` and `libs/shared/ui/src/lib/PasswordStrengthBar.svelte`, implement the emotional design animations from the spec (fadeInUp on load, shake on error), and add proper ARIA labels for accessibility.

**REG-B:** Add comprehensive E2E tests using Playwright in `apps/web/src/__tests__/auth-flow.spec.ts` that test the complete registration flow including email validation, password strength feedback, form submission states, error handling, and successful redirect to dashboard.

### Cycle C - Mobile Registration & OAuth

**RED-C:** Create failing Jest tests in `apps/mobile/src/screens/__tests__/RegisterScreen.test.tsx` that verify the React Native registration screen handles OAuth providers (Google, LinkedIn), displays proper loading states, and integrates with the shared auth service for both email/password and OAuth registration flows.

**GREEN-C:** Implement `apps/mobile/src/screens/RegisterScreen.tsx` using React Native Elements, add OAuth integration using Supabase's `signInWithOAuth()` for Google and LinkedIn providers, implement the mobile-specific UI patterns from the design spec, and handle deep linking from OAuth callbacks.

**BLUE-C:** Optimize the mobile registration flow by implementing biometric authentication option using Expo's LocalAuthentication, add proper error boundaries, implement offline queue for registration attempts using AsyncStorage, and add haptic feedback for form interactions.

**REG-C:** Add comprehensive mobile E2E tests using Maestro in `.maestro/auth-flow.yml` that test OAuth flows, biometric authentication, offline registration queueing, form validation on mobile keyboards, and proper navigation handling across iOS and Android platforms.

## USER STORY 2: LOGIN

### Cycle A - Core Login Functionality

**RED-A:** Write a failing test in `libs/shared/data-access/src/__tests__/auth.test.ts` for `signIn(email: string, password: string)` that verifies authentication against Supabase, retrieves user profile data with relationship scores from the database, and returns proper session data with JWT tokens.

**GREEN-A:** Implement `signIn` function in `libs/shared/data-access/src/lib/auth.ts` that calls `supabase.auth.signInWithPassword()`, fetches user profile and basic relationship metrics, handles authentication errors, and manages session storage with automatic token refresh.

**BLUE-A:** Extract session management into `libs/shared/data-access/src/lib/session.service.ts` with proper TypeScript interfaces, implement token refresh logic, and add connection health monitoring with automatic retry logic for network failures.

**REG-A:** Add tests for invalid credentials, account lockout after multiple failed attempts, session expiry handling, network connectivity issues, and proper cleanup of sensitive data in memory.

### Cycle B - Web Login Interface

**RED-B:** Create failing tests in `apps/web/src/routes/(auth)/login/__tests__/+page.test.ts` that verify the login form handles user input, displays appropriate loading states, shows error messages for failed authentication, and redirects authenticated users to dashboard.

**GREEN-B:** Build the login page at `apps/web/src/routes/(auth)/login/+page.svelte` with DaisyUI form components, implement the emotional design system (button animations, input focus states), add "Remember Me" functionality, and integrate with the shared auth service.

**BLUE-B:** Refactor to use the shared `AuthForm` component with a "login" variant, implement progressive web app features for login state persistence, add keyboard shortcuts (Cmd/Ctrl+Enter to submit), and optimize for Core Web Vitals metrics.

**REG-B:** Add Playwright tests for login flow accessibility (screen reader navigation, keyboard-only interaction), password manager integration, browser auto-fill compatibility, and cross-browser authentication persistence.

### Cycle C - Mobile Login & Advanced Features

**RED-C:** Write Jest tests in `apps/mobile/src/screens/__tests__/LoginScreen.test.tsx` for biometric authentication integration, OAuth provider login, offline authentication caching, and proper handling of mobile-specific authentication flows.

**GREEN-C:** Implement `apps/mobile/src/screens/LoginScreen.tsx` with React Native Elements, add Face ID/Touch ID authentication using Expo LocalAuthentication, implement OAuth deep linking, and add offline authentication using cached credentials.

**BLUE-C:** Optimize mobile login performance with lazy loading of OAuth providers, implement smart authentication (auto-login with biometrics), add security features like screenshot prevention on login screen, and implement proper keychain/keystore integration.

**REG-C:** Create comprehensive mobile authentication tests using Maestro that verify biometric flows across different device types, OAuth provider redirects, offline login scenarios, and security compliance (preventing unauthorized access).

## USER STORY 3: ADD CONTACT

### Cycle A - Core Contact Management

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/contacts.test.ts` for CRUD operations: `addContact(contactData)`, `getContacts(userId)`, `updateContact(id, data)`, and `deleteContact(id)` that interact with the `contacts` table, enforce Row Level Security, and handle contact validation.

**GREEN-A:** Implement contact service in `libs/shared/data-access/src/lib/contacts.ts` with proper Supabase integration, RLS policies ensuring users only access their contacts, input validation using Zod schemas, and basic contact data structure matching the database schema.

**BLUE-A:** Extract validation logic to `libs/shared/utils/src/lib/validators.ts`, create TypeScript interfaces in `libs/shared/types/src/contact.types.ts`, and implement contact sanitization and normalization (standardize phone formats, validate email domains).

**REG-A:** Add tests for edge cases: special characters in names, international phone numbers, long company names, duplicate email detection, and proper error handling for database constraint violations.

### Cycle B - Contact Management UI

**RED-B:** Create failing tests in `libs/web/feature-contacts/src/__tests__/ContactFormModal.test.ts` and `libs/web/feature-contacts/src/__tests__/ContactList.test.ts` that verify form submission, contact display with relationship health scores, search/filter functionality, and proper state management.

**GREEN-B:** Build `libs/web/feature-contacts/src/lib/ContactFormModal.svelte` with DaisyUI form components, implement `libs/web/feature-contacts/src/lib/ContactList.svelte` with contact cards showing health scores, and create the main contacts page at `apps/web/src/routes/contacts/+page.svelte`.

**BLUE-B:** Extract reusable components to `libs/shared/ui/src/lib/ContactCard.svelte` and `libs/shared/ui/src/lib/ContactFormModal.svelte`, implement the emotional design animations (card hover effects, form validation feedback), and add advanced filtering with URL state persistence.

**REG-B:** Add Playwright E2E tests for complete contact management workflows: creating contacts through various input methods, bulk operations, search functionality, contact detail navigation, and responsive design across device sizes.

### Cycle C - AI Contact Enrichment

**RED-C:** Write tests in `apps/api/functions/__tests__/enrich-contact.test.ts` for the Edge Function that calls OpenAI o4-mini model to enrich contact data, generates vector embeddings using pgvector, handles API rate limits, and updates the `contact_embeddings` table.

**GREEN-C:** Implement `apps/api/functions/enrich-contact/index.ts` Edge Function that processes contact data through OpenAI API, generates embeddings for semantic search, stores enriched data with confidence scores, and triggers real-time updates via Supabase Realtime.

**BLUE-C:** Optimize AI processing with intelligent caching in `libs/shared/data-access/src/lib/ai-cache.ts`, implement batch processing for multiple contacts, add fallback strategies for API failures, and create cost optimization logic to minimize OpenAI token usage.

**REG-C:** Add comprehensive tests for AI processing reliability: API timeout handling, malformed response processing, embedding quality validation, cost tracking accuracy, and proper error recovery with user notification.

## USER STORY 4: LOG INTERACTION

### Cycle A - Interaction Data Management

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/interactions.test.ts` for interaction CRUD operations that store interactions in the `interactions` table with proper foreign key relationships to contacts, sentiment analysis scores, and automatic timestamp tracking.

**GREEN-A:** Implement interaction service in `libs/shared/data-access/src/lib/interactions.ts` with functions for logging different interaction types (email, call, meeting, note), automatic sentiment scoring, and relationship health score updates based on interaction patterns.

**BLUE-A:** Extract interaction types to `libs/shared/types/src/interaction.types.ts`, create interaction validation schemas, and implement automatic contact association using fuzzy matching algorithms for email participants.

**REG-A:** Add tests for interaction data integrity: handling interactions with non-existent contacts, preventing negative sentiment scores, testing interaction timeline ordering, and validating metadata JSON structure.

### Cycle B - Interaction Timeline UI

**RED-B:** Write failing tests in `libs/web/feature-interactions/src/__tests__/InteractionTimeline.test.ts` that verify chronological display of interactions, filtering by type and date range, sentiment visualization, and real-time updates when new interactions are logged.

**GREEN-B:** Build `libs/web/feature-interactions/src/lib/InteractionTimeline.svelte` with chronological interaction display, implement `libs/web/feature-interactions/src/lib/InteractionFormModal.svelte` for logging new interactions, and integrate with contact detail pages.

**BLUE-B:** Create reusable interaction components in `libs/shared/ui/src/lib/InteractionItem.svelte`, implement virtualized scrolling for large interaction histories, add interaction search with full-text capabilities, and implement the timeline animation effects from the design spec.

**REG-B:** Add Playwright tests for interaction management workflows: logging different interaction types, timeline navigation, interaction editing/deletion, bulk interaction import, and mobile-responsive interaction logging.

### Cycle C - AI Interaction Analysis

**RED-C:** Create tests in `apps/api/functions/__tests__/analyze-interaction.test.ts` for an Edge Function that analyzes interaction content using OpenAI o3 model, extracts key topics and sentiment, identifies follow-up opportunities, and updates relationship health scores.

**GREEN-C:** Implement `apps/api/functions/analyze-interaction/index.ts` that processes interaction text through OpenAI API, extracts actionable insights, generates topic tags, calculates relationship impact scores, and triggers AI recommendation generation.

**BLUE-C:** Optimize interaction analysis with context-aware processing (considering previous interactions), implement privacy-preserving analysis for sensitive content, add real-time analysis for incoming emails/calendar events, and create interaction pattern recognition algorithms.

**REG-C:** Add tests for AI analysis accuracy: sentiment analysis validation against known datasets, topic extraction quality, privacy compliance for sensitive content, analysis performance under load, and proper handling of non-English content.

## USER STORY 5: FOLLOW-UP REMINDERS

### Cycle A - Follow-up Data Management

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/followUps.test.ts` for follow-up CRUD operations using the `follow_ups` table, automated reminder scheduling using Supabase Cron, and integration with notification systems for timely alerts.

**GREEN-A:** Implement follow-up service in `libs/shared/data-access/src/lib/followUps.ts` with functions to create/update/complete follow-ups, schedule reminders using Supabase Cron jobs, and handle overdue follow-up escalation.

**BLUE-A:** Extract scheduling logic to `libs/shared/utils/src/lib/scheduler.ts`, create follow-up priority algorithms based on relationship health scores, and implement intelligent reminder timing based on user behavior patterns.

**REG-A:** Add tests for follow-up edge cases: timezone handling for global contacts, follow-up conflicts with user availability, reminder delivery failures, and proper cleanup of completed follow-ups.

### Cycle B - Follow-up Dashboard UI

**RED-B:** Create failing tests in `libs/web/feature-followups/src/__tests__/FollowUpDashboard.test.ts` that verify overdue follow-up highlighting, upcoming reminder display, follow-up completion workflows, and integration with calendar systems.

**GREEN-B:** Build `libs/web/feature-followups/src/lib/FollowUpDashboard.svelte` with overdue follow-up alerts, create `libs/web/feature-followups/src/lib/FollowUpFormModal.svelte` for scheduling, and implement the main follow-ups page at `apps/web/src/routes/follow-ups/+page.svelte`.

**BLUE-B:** Create reusable components in `libs/shared/ui/src/lib/FollowUpCard.svelte`, implement calendar integration for follow-up scheduling, add bulk follow-up operations, and implement the emotional design animations for follow-up completion.

**REG-B:** Add Playwright tests for follow-up management: creating follow-ups with different priorities, mass follow-up operations, calendar integration, mobile follow-up management, and notification delivery verification.

### Cycle C - AI Follow-up Recommendations

**RED-C:** Write tests in `apps/api/functions/__tests__/generate-followups.test.ts` for an Edge Function that analyzes interaction patterns, relationship health trends, and business context to generate intelligent follow-up suggestions with optimal timing.

**GREEN-C:** Implement `apps/api/functions/generate-followups/index.ts` that uses OpenAI models to analyze relationship data, predict optimal follow-up timing, generate personalized follow-up message templates, and schedule AI-driven reminders.

**BLUE-C:** Optimize follow-up AI with machine learning from user behavior, implement context-aware follow-up suggestions based on industry and relationship type, add A/B testing for follow-up effectiveness, and create follow-up success tracking.

**REG-C:** Add tests for AI follow-up quality: recommendation relevance scoring, timing optimization accuracy, message template appropriateness, user acceptance rate tracking, and privacy compliance for sensitive relationship data.

## USER STORY 6: CONTACT IMPORT

### Cycle A - OAuth Integration & Data Pipeline

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/import.test.ts` for OAuth integration with LinkedIn and Gmail APIs, contact data transformation and normalization, duplicate detection using vector similarity, and batch processing with progress tracking.

**GREEN-A:** Implement import service in `libs/shared/data-access/src/lib/import.ts` with OAuth token management, LinkedIn/Gmail API integration, contact data mapping to internal schema, and basic duplicate detection using email matching.

**BLUE-A:** Extract OAuth handling to `libs/shared/data-access/src/lib/oauth.service.ts`, implement advanced duplicate detection using pgvector similarity search, create import progress tracking with Supabase Queues, and add data validation pipelines.

**REG-A:** Add tests for import edge cases: malformed external API responses, OAuth token expiration during import, network timeouts, large dataset handling, and proper cleanup of failed imports.

### Cycle B - Import Wizard UI

**RED-B:** Write failing tests in `libs/web/feature-contacts/src/__tests__/ContactImportModal.test.ts` for a multi-step import wizard that handles OAuth authorization, displays import progress, shows duplicate conflict resolution, and provides import summary reports.

**GREEN-B:** Build `libs/web/feature-contacts/src/lib/ContactImportModal.svelte` with step-by-step import flow, OAuth provider selection, progress visualization, duplicate resolution interface, and import results summary with error handling.

**BLUE-B:** Create reusable import components in `libs/shared/ui/src/lib/ImportWizard.svelte`, implement the animated progress indicators from the design spec, add import preview functionality, and create mobile-optimized import flows.

**REG-B:** Add Playwright tests for complete import workflows: OAuth authorization flows, large dataset imports, duplicate resolution scenarios, import cancellation, and cross-browser OAuth compatibility.

### Cycle C - AI Import Enhancement

**RED-C:** Create tests in `apps/api/functions/__tests__/enhance-import.test.ts` for an Edge Function that enriches imported contacts using OpenAI models, validates and corrects contact data, generates relationship context, and optimizes contact prioritization.

**GREEN-C:** Implement `apps/api/functions/enhance-import/index.ts` that processes imported contacts through AI enhancement, corrects data inconsistencies, generates initial relationship health scores, and creates vector embeddings for semantic search.

**BLUE-C:** Optimize import AI processing with parallel contact enhancement, implement smart contact prioritization based on professional relevance, add import quality scoring, and create automated contact categorization using industry and role analysis.

**REG-C:** Add comprehensive tests for AI import enhancement: data quality improvement validation, processing speed optimization, cost management for large imports, accuracy of automated categorization, and proper handling of multilingual contact data.

## USER STORY 7: TAGGING

### Cycle A - Tag Data Management

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/tags.test.ts` for tag CRUD operations using `tags` and `contact_tags` tables, tag hierarchy support, tag usage analytics, and automated tag suggestions based on contact data.

**GREEN-A:** Implement tag service in `libs/shared/data-access/src/lib/tags.ts` with functions for creating/managing tags, associating tags with contacts, tag search and filtering, and basic tag analytics for popular tags.

**BLUE-A:** Extract tag algorithms to `libs/shared/utils/src/lib/tag-utils.ts`, implement tag clustering for related tags, create tag validation and normalization, and add tag usage tracking for recommendation improvements.

**REG-A:** Add tests for tag edge cases: duplicate tag prevention, case-insensitive tag matching, special character handling in tags, tag deletion cascading, and tag performance with large datasets.

### Cycle B - Tag Management UI

**RED-B:** Create failing tests in `libs/web/feature-tags/src/__tests__/TagInput.test.ts` and `libs/web/feature-tags/src/__tests__/TagFilters.test.ts` that verify tag input with autocomplete, tag filtering with multiple selection, tag visualization, and tag-based contact search.

**GREEN-B:** Build `libs/web/feature-tags/src/lib/TagInput.svelte` with autocomplete functionality, create `libs/web/feature-tags/src/lib/TagFilters.svelte` for contact filtering, and integrate tag management into contact forms and lists.

**BLUE-B:** Create reusable tag components in `libs/shared/ui/src/lib/TagComponent.svelte`, implement tag color coding and visualization, add drag-and-drop tag organization, and implement the tag animation effects from the design spec.

**REG-B:** Add Playwright tests for tag management workflows: creating and applying tags, bulk tag operations, tag-based filtering and search, tag analytics dashboard, and mobile tag management interfaces.

### Cycle C - AI Tag Suggestions

**RED-C:** Write tests in `apps/api/functions/__tests__/suggest-tags.test.ts` for an Edge Function that analyzes contact data using OpenAI models to suggest relevant tags based on company, role, industry, and interaction patterns.

**GREEN-C:** Implement `apps/api/functions/suggest-tags/index.ts` that processes contact information through AI analysis, generates industry-relevant tag suggestions, learns from user tag patterns, and provides confidence scores for tag recommendations.

**BLUE-C:** Optimize tag AI with personalized learning from user tagging behavior, implement context-aware tag suggestions based on interaction content, add tag trend analysis for emerging professional categories, and create automated tag maintenance.

**REG-C:** Add tests for AI tag suggestion quality: relevance scoring against user acceptance, suggestion diversity and coverage, learning rate from user feedback, performance with diverse professional backgrounds, and privacy compliance for tag analysis.

## USER STORY 8: OPPORTUNITIES

### Cycle A - Opportunity Data Management

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/opportunities.test.ts` for opportunity CRUD operations using `opportunities` and `opportunity_contacts` tables, opportunity status tracking, value calculation, and contact-opportunity relationship management.

**GREEN-A:** Implement opportunity service in `libs/shared/data-access/src/lib/opportunities.ts` with functions for creating/managing opportunities, linking contacts to opportunities, tracking opportunity progress, and calculating opportunity values and success rates.

**BLUE-A:** Extract opportunity algorithms to `libs/shared/utils/src/lib/opportunity-utils.ts`, implement opportunity prioritization based on value and likelihood, create opportunity analytics and reporting, and add opportunity timeline tracking.

**REG-A:** Add tests for opportunity edge cases: opportunity value validation, contact relationship integrity, opportunity status transitions, duplicate opportunity prevention, and opportunity archival processes.

### Cycle B - Opportunity Management UI

**RED-B:** Write failing tests in `libs/web/feature-opportunities/src/__tests__/OpportunityCard.test.ts` and `libs/web/feature-opportunities/src/__tests__/OpportunityFormModal.test.ts` that verify opportunity display with linked contacts, opportunity creation/editing forms, opportunity pipeline visualization, and opportunity analytics.

**GREEN-B:** Build `libs/web/feature-opportunities/src/lib/OpportunityCard.svelte` with contact linking interface, create `libs/web/feature-opportunities/src/lib/OpportunityFormModal.svelte` for opportunity management, and implement the opportunities page at `apps/web/src/routes/opportunities/+page.svelte`.

**BLUE-B:** Create reusable opportunity components in `libs/shared/ui/src/lib/OpportunityComponents.svelte`, implement opportunity kanban board interface, add opportunity search and filtering, and implement opportunity status animations from the design spec.

**REG-B:** Add Playwright tests for opportunity management: creating opportunities with contact associations, opportunity pipeline management, opportunity analytics dashboard, bulk opportunity operations, and mobile opportunity tracking.

### Cycle C - AI Opportunity Detection

**RED-C:** Create tests in `apps/api/functions/__tests__/detect-opportunities.test.ts` for an Edge Function that analyzes relationship networks and interaction patterns using OpenAI models to identify potential business opportunities and suggest contact introductions.

**GREEN-C:** Implement `apps/api/functions/detect-opportunities/index.ts` that processes relationship data through AI analysis, identifies opportunity patterns from interaction content, suggests optimal contact connections, and predicts opportunity likelihood.

**BLUE-C:** Optimize opportunity AI with network analysis algorithms, implement predictive opportunity scoring based on historical data, add industry-specific opportunity detection, and create automated opportunity pipeline updates.

**REG-C:** Add tests for AI opportunity detection accuracy: opportunity prediction validation against actual outcomes, false positive/negative rates, opportunity value estimation accuracy, network analysis quality, and ethical AI practices for business suggestions.

## USER STORY 9: DASHBOARD OVERVIEW

### Cycle A - Analytics Data Pipeline

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/analytics.test.ts` for analytics data aggregation from contacts, interactions, and follow-ups tables, real-time metric calculation, trend analysis, and performance optimization using materialized views.

**GREEN-A:** Implement analytics service in `libs/shared/data-access/src/lib/analytics.ts` with functions for calculating relationship health metrics, interaction trends, network growth statistics, and follow-up effectiveness rates using optimized SQL queries.

**BLUE-A:** Extract analytics algorithms to `libs/shared/utils/src/lib/analytics-utils.ts`, implement caching strategies for expensive calculations, create real-time analytics updates using Supabase Realtime, and add analytics data validation.

**REG-A:** Add tests for analytics edge cases: handling users with no data, large dataset performance, real-time update accuracy, analytics calculation consistency, and proper handling of deleted/archived data.

### Cycle B - Dashboard Interface

**RED-B:** Create failing tests in `libs/web/feature-analytics/src/__tests__/Dashboard.test.ts` that verify metric widgets display current data, charts show trend information, dashboard customization works properly, and real-time updates function correctly.

**GREEN-B:** Build dashboard components in `libs/web/feature-analytics/src/lib/` including `MetricCard.svelte`, `NetworkGrowthChart.svelte`, and `AnalyticsDashboard.svelte`, and create the main dashboard page at `apps/web/src/routes/dashboard/+page.svelte`.

**BLUE-B:** Create reusable analytics components in `libs/shared/ui/src/lib/AnalyticsComponents.svelte`, implement interactive chart functionality, add dashboard personalization features, and implement the dashboard animation effects including counter animations.

**REG-B:** Add Playwright tests for dashboard functionality: metric accuracy verification, chart interaction testing, dashboard responsiveness, customization persistence, and real-time data update validation across multiple browser tabs.

### Cycle C - AI Dashboard Insights

**RED-C:** Write tests in `apps/api/functions/__tests__/generate-insights.test.ts` for an Edge Function that analyzes dashboard metrics using OpenAI models to generate personalized insights, identify networking trends, and suggest strategic actions.

**GREEN-C:** Implement `apps/api/functions/generate-insights/index.ts` that processes analytics data through AI analysis, generates natural language insights about networking performance, identifies areas for improvement, and suggests actionable recommendations.

**BLUE-C:** Optimize dashboard AI with predictive analytics for relationship trends, implement personalized goal setting based on user patterns, add competitive benchmarking insights, and create automated insight delivery scheduling.

**REG-C:** Add tests for AI dashboard insights: insight relevance and accuracy, recommendation effectiveness tracking, insight personalization quality, processing performance for real-time insights, and user engagement with AI-generated suggestions.

## USER STORY 10: ACCOUNT MANAGEMENT

### Cycle A - User Profile Management

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/profile.test.ts` for user profile CRUD operations, password change functionality with Supabase Auth integration, email update with verification, and account deletion with data cleanup.

**GREEN-A:** Implement profile service in `libs/shared/data-access/src/lib/profile.ts` with functions for updating user profiles, changing passwords using Supabase Auth methods, managing email changes with verification, and handling account deactivation.

**BLUE-A:** Extract security features to `libs/shared/data-access/src/lib/security.service.ts`, implement audit logging for profile changes, create data export functionality for GDPR compliance, and add profile validation with business rules.

**REG-A:** Add tests for profile management edge cases: concurrent profile updates, password strength validation, email change conflicts, account deletion cascading, and proper cleanup of user data across all tables.

### Cycle B - Settings Interface

**RED-B:** Write failing tests in `apps/web/src/routes/settings/__tests__/+page.test.ts` that verify profile editing forms, password change workflows, notification preferences, privacy settings, and account deletion confirmation processes.

**GREEN-B:** Build the settings page at `apps/web/src/routes/settings/+page.svelte` with profile editing forms, password change interface, notification preferences, privacy controls, and account management options using DaisyUI components.

**BLUE-B:** Create reusable settings components in `libs/shared/ui/src/lib/SettingsComponents.svelte`, implement form validation with real-time feedback, add settings change confirmation, and implement the settings animation effects from the design spec.

**REG-B:** Add Playwright tests for settings management: profile update workflows, password change security, notification preference persistence, privacy setting validation, and account deletion prevention safeguards.

### Cycle C - Advanced Security Features

**RED-C:** Create tests in `apps/api/functions/__tests__/security-audit.test.ts` for security auditing functionality that tracks login patterns, detects suspicious activity, manages device authorization, and implements advanced account protection.

**GREEN-C:** Implement security monitoring in `apps/api/functions/security-audit/index.ts` that analyzes login patterns, detects unusual access attempts, manages trusted devices, and provides security alerts to users.

**BLUE-C:** Optimize security features with machine learning for anomaly detection, implement advanced MFA options, add security dashboard for user awareness, and create automated security recommendations.

**REG-C:** Add tests for advanced security: anomaly detection accuracy, MFA workflow reliability, security alert delivery, device management functionality, and compliance with security standards and privacy regulations.

## USER STORY 11: DUPLICATE CONTACT HANDLING

### Cycle A - Duplicate Detection Engine

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/duplicates.test.ts` for duplicate detection using pgvector similarity search, fuzzy matching algorithms for names and companies, confidence scoring for matches, and merge conflict resolution.

**GREEN-A:** Implement duplicate detection service in `libs/shared/data-access/src/lib/duplicates.ts` with functions for finding similar contacts using vector embeddings, calculating match confidence scores, and providing merge recommendations with conflict highlighting.

**BLUE-A:** Extract matching algorithms to `libs/shared/utils/src/lib/matching-utils.ts`, implement advanced similarity scoring using multiple data points, create duplicate detection optimization for large datasets, and add machine learning for improving match accuracy.

**REG-A:** Add tests for duplicate detection edge cases: partial name matches, different email formats, international name variations, company name changes, and handling of contacts with minimal information.

### Cycle B - Duplicate Resolution UI

**RED-B:** Create failing tests in `libs/web/feature-contacts/src/__tests__/DuplicateResolver.test.ts` that verify duplicate conflict display, merge option selection, field-level merge choices, merge preview functionality, and post-merge validation.

**GREEN-B:** Build `libs/web/feature-contacts/src/lib/DuplicateResolver.svelte` with side-by-side contact comparison, field-level merge selection, merge preview, and integration into the contact creation and import workflows.

**BLUE-B:** Create reusable duplicate resolution components in `libs/shared/ui/src/lib/DuplicateComponents.svelte`, implement smart merge suggestions based on data quality, add undo functionality for merges, and implement duplicate resolution animations.

**REG-B:** Add Playwright tests for duplicate resolution: complete merge workflows, field selection validation, merge preview accuracy, undo functionality, and bulk duplicate resolution for imports.

### Cycle C - AI Duplicate Intelligence

**RED-C:** Write tests in `apps/api/functions/__tests__/smart-duplicates.test.ts` for an Edge Function that uses OpenAI models to analyze contact similarities beyond basic matching, understand context clues for same person identification, and provide intelligent merge suggestions.

**GREEN-C:** Implement `apps/api/functions/smart-duplicates/index.ts` that processes contact data through AI analysis to identify subtle duplicate patterns, analyze professional relationships for identity confirmation, and generate confidence-scored merge recommendations.

**BLUE-C:** Optimize duplicate AI with continuous learning from user merge decisions, implement industry-specific duplicate detection patterns, add relationship network analysis for duplicate validation, and create automated duplicate cleanup for high-confidence matches.

**REG-C:** Add tests for AI duplicate detection: accuracy against manually verified duplicates, false positive/negative rates, learning improvement over time, processing performance for real-time detection, and proper handling of edge cases like common names and job changes.

---

**Total: 132 prompts (11 stories × 12 prompts each) providing comprehensive guidance for building the complete Weople professional relationship management platform.**
