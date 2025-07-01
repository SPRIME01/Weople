**IMPROVED PROMPT:**

"Based on the comprehensive Weople technical specification, Nx workspace structure, and engineering inventory provided, create 132 specific, actionable TDD-focused coding prompts for an AI agent to build the complete Weople professional relationship management application. Each prompt must reference exact file paths, API endpoints, database schemas, component names, and technical implementation details from the specifications.

For each of the 11 user stories, provide exactly 3 cycles of 4 prompts (RED-GREEN-BLUE-REG pattern):

- **Cycle A**: Core backend/data functionality
- **Cycle B**: UI components and integration
- **Cycle C**: AI features and advanced capabilities

Each prompt should be immediately executable by an AI coding agent with specific technical requirements, acceptance criteria, and integration points."

---

# WEOPLE AI CODING AGENT PROMPTS

## USER STORY 1: SIGN UP

### Cycle A - Core Authentication Infrastructure

~~**RED-A:** Create failing Vitest tests in `libs/shared/data-access/src/__tests__/auth.test.ts` that verify `signUp(email: string, password: string)` function calls Supabase's `auth.signUp()`, automatically creates a profile record in the `profiles` table with RLS policy `users_own_profile`, generates JWT tokens with `auth.uid()`, and returns `AuthResult` interface. Test should expect specific Supabase error codes for duplicate emails and invalid passwords.~~

~~**GREEN-A:** Implement the minimal `signUp` function in `libs/shared/data-access/src/lib/auth.ts` that passes all tests by integrating with Supabase client from `libs/shared/data-access/src/lib/supabase.ts`, calling `supabase.auth.signUp()` with email/password validation, creating profile record via RLS-protected insert to `profiles` table, and returning properly typed `AuthResult` with user data and session tokens.~~

~~**BLUE-A:** Refactor auth module to extract `ProfileService` class in `libs/shared/data-access/src/lib/profile.service.ts`, add comprehensive TypeScript interfaces in `libs/shared/types/src/auth.types.ts` including `SignUpInput`, `AuthResult`, `UserProfile`, implement password strength validation using industry standards from the spec, and add proper error handling for all Supabase auth scenarios.~~

~~**REG-A:** Add comprehensive regression tests covering edge cases: email format validation per RFC 5322, password requirements (12+ chars, complexity), duplicate email handling with proper Supabase error mapping, profile creation failure rollback, JWT token validation, and RLS policy enforcement verification using test user contexts.~~

### Cycle B - SvelteKit Registration Interface

**RED-B:** Write failing tests in `apps/web/src/routes/(auth)/register/__tests__/+page.test.ts` using Testing Library and Vitest that mount the SvelteKit registration page, verify DaisyUI form components render correctly, test form validation with real-time feedback, simulate user input with email "test@weople.com" and password "SecurePass123!", verify `signUp` function calls with correct parameters, and assert redirect to `/dashboard` on success with proper SvelteKit navigation.

**GREEN-B:** Create registration page at `apps/web/src/routes/(auth)/register/+page.svelte` using SvelteKit with DaisyUI form components (input, button, card classes), implement client-side validation with Zod schema, integrate auth store from `libs/shared/data-access/src/lib/auth.ts`, add password strength indicator with real-time updates, implement proper form submission handling with loading states, and configure SvelteKit redirect to dashboard on successful signup.

**BLUE-B:** Extract reusable `AuthForm` component to `libs/shared/ui/src/lib/AuthForm.svelte` with TypeScript props for mode ('signup'|'login'), implement emotional design animations from `emotional_design_spec.md` including fadeInUp entrance, input focus transitions, and button hover effects, add ARIA labels for accessibility compliance, and integrate with SvelteKit stores for reactive state management.

**REG-B:** Create comprehensive Playwright E2E tests in `apps/web/src/__tests__/auth-registration.spec.ts` that test complete registration workflow including form validation feedback, password strength visualization, successful account creation flow, email verification integration, error handling scenarios, cross-browser compatibility (Chrome, Firefox, Safari), and mobile responsive behavior with touch interactions.

### Cycle C - Mobile Registration & OAuth

**RED-C:** Create failing Jest tests in `apps/mobile/src/screens/__tests__/RegisterScreen.test.tsx` that verify React Native registration screen renders with React Native Elements components, handles OAuth providers (Google, LinkedIn) using Supabase's `signInWithOAuth()`, implements biometric authentication with Expo LocalAuthentication when available, manages deep linking from OAuth callbacks, and integrates with shared auth service for consistent cross-platform behavior.

**GREEN-C:** Implement `apps/mobile/src/screens/RegisterScreen.tsx` using React Native Elements UI components, integrate Expo LocalAuthentication for biometric signup option, implement OAuth flows for Google/LinkedIn using Supabase auth with proper deep linking configuration in `apps/mobile/app.json`, add offline registration queueing with AsyncStorage, and ensure consistent error handling with web platform using shared auth types.

**BLUE-C:** Optimize mobile registration with intelligent caching strategies using AsyncStorage, implement progressive enhancement for devices without biometric capabilities, add haptic feedback using Expo Haptics for form interactions, integrate with device contacts permission for pre-filling user information, and implement background sync for offline registration attempts with proper conflict resolution when reconnected.

**REG-C:** Create comprehensive mobile E2E tests using Maestro in `.maestro/auth/registration-flow.yml` that verify OAuth provider redirects work correctly on both iOS and Android, test biometric authentication scenarios, validate offline registration queueing and sync behavior, ensure proper deep linking handling from external OAuth providers, and verify consistent behavior across different device types and OS versions.

## USER STORY 2: LOGIN

### Cycle A - Authentication Engine

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/auth.test.ts` for `signIn(email: string, password: string)` that verifies Supabase `signInWithPassword()` integration, retrieves user profile with relationship scores from database join queries, validates JWT token structure and claims, implements session refresh logic with automatic token rotation, and returns proper `AuthResult` with user context and permissions.

**GREEN-A:** Implement `signIn` function in `libs/shared/data-access/src/lib/auth.ts` that calls Supabase auth, fetches user profile data with optimized queries using PostgreSQL joins, handles authentication errors with proper error mapping, manages JWT tokens with automatic refresh using Supabase client configuration, and implements secure session storage with httpOnly cookies where possible.

**BLUE-A:** Extract session management into `libs/shared/data-access/src/lib/session.service.ts` with comprehensive TypeScript interfaces, implement connection health monitoring with automatic retry logic for network failures, add rate limiting for failed login attempts to prevent brute force attacks, and create secure token storage abstraction that works consistently across web and mobile platforms.

**REG-A:** Add regression tests for authentication edge cases: invalid credentials with proper error codes, account lockout after configurable failed attempts, session expiry handling with automatic refresh, network connectivity issues with offline queue management, and security validation including XSS prevention and CSRF protection in authentication flows.

### Cycle B - SvelteKit Login Interface

**RED-B:** Create failing tests in `apps/web/src/routes/(auth)/login/__tests__/+page.test.ts` that verify login form renders with DaisyUI styling, handles user input validation with real-time feedback, displays appropriate loading states during authentication, shows contextual error messages for different failure scenarios, implements "Remember Me" functionality with persistent sessions, and redirects authenticated users to appropriate dashboard based on user role.

**GREEN-B:** Build login page at `apps/web/src/routes/(auth)/login/+page.svelte` with DaisyUI form components and emotional design animations, implement progressive web app features for login state persistence across browser sessions, add keyboard shortcuts (Cmd/Ctrl+Enter for form submission), integrate with shared AuthForm component, and optimize for Core Web Vitals with proper loading strategies and resource hints.

**BLUE-B:** Enhance login experience with advanced features: implement smart login suggestions based on browser autofill, add social login buttons with proper OAuth flow integration, create smooth page transitions using SvelteKit navigation, implement login attempt analytics for security monitoring, and add progressive enhancement features that work without JavaScript for basic functionality.

**REG-B:** Create Playwright accessibility tests in `apps/web/src/__tests__/auth-login-a11y.spec.ts` that verify screen reader navigation works correctly, test keyboard-only interaction patterns, validate password manager integration compatibility, ensure proper focus management throughout login flow, test cross-browser authentication persistence, and verify compliance with WCAG 2.1 AA standards.

### Cycle C - Advanced Mobile Authentication

**RED-C:** Write Jest tests in `apps/mobile/src/screens/__tests__/LoginScreen.test.tsx` for advanced mobile authentication including Face ID/Touch ID integration using Expo LocalAuthentication, OAuth provider login with deep linking, offline authentication caching with encrypted storage, background authentication refresh, and security features like screenshot prevention during login process.

**GREEN-C:** Implement `apps/mobile/src/screens/LoginScreen.tsx` with React Native Elements, add biometric authentication as primary login method when available, implement smart authentication that remembers user preference for biometric vs password, integrate with OAuth providers using secure deep linking, and add offline authentication using cached encrypted credentials with proper security measures.

**BLUE-C:** Optimize mobile login performance with intelligent preloading of authentication providers, implement adaptive UI that adjusts based on device capabilities (biometric availability, screen size), add advanced security features including jailbreak/root detection warnings, implement smart session management that adapts to usage patterns, and create seamless handoff between web and mobile authentication states.

**REG-C:** Create comprehensive mobile authentication test suite using Maestro that verifies biometric authentication flows across different device types and OS versions, tests OAuth provider redirects and callbacks, validates offline authentication scenarios with network simulation, ensures proper keychain/keystore integration security, and tests authentication state synchronization between multiple logged-in devices.

## USER STORY 3: ADD CONTACT

### Cycle A - Contact Data Management

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/contacts.test.ts` for CRUD operations including `addContact(ContactInput)`, `getContacts(userId)`, `updateContact(id, data)`, `deleteContact(id)` that interact with PostgreSQL `contacts` table, enforce Row Level Security policies ensuring users only access their own contacts, implement proper input validation using Zod schemas, and handle duplicate detection using pgvector similarity search with configurable thresholds.

**GREEN-A:** Implement contact service in `libs/shared/data-access/src/lib/contacts.ts` with full Supabase integration, create RLS policies ensuring `user_id = auth.uid()` enforcement, implement Zod validation schemas in `libs/shared/types/src/contact.types.ts`, add contact normalization (phone format standardization, email domain validation), and create basic duplicate detection using email matching with case-insensitive comparison.

**BLUE-A:** Refactor contact management to extract validation logic into `libs/shared/utils/src/lib/validators.ts`, create comprehensive TypeScript interfaces with proper nullable field handling, implement advanced contact sanitization including international phone number formatting using libphonenumber, add fuzzy duplicate detection using pgvector cosine similarity with configurable match thresholds, and create audit logging for contact changes.

**REG-A:** Add comprehensive regression tests covering contact data edge cases: special characters in names (Unicode, emoji), international phone number formats, very long company names, email validation edge cases, database constraint violations, concurrent modification handling, and proper cleanup of related data when contacts are deleted.

### Cycle B - Contact Management UI

**RED-B:** Write failing tests in `libs/web/feature-contacts/src/__tests__/ContactFormModal.test.ts` and `libs/web/feature-contacts/src/__tests__/ContactList.test.ts` that verify DaisyUI form components render correctly, validate real-time form validation feedback, test contact display with relationship health scores from database, verify search/filter functionality with debounced input, test modal state management, and ensure proper integration with Supabase Realtime for live updates.

**GREEN-B:** Build `libs/web/feature-contacts/src/lib/ContactFormModal.svelte` using DaisyUI form components with comprehensive validation feedback, implement `libs/web/feature-contacts/src/lib/ContactList.svelte` with contact cards displaying health scores and last interaction data, create main contacts page at `apps/web/src/routes/contacts/+page.svelte` with search and filtering, and integrate real-time updates using Supabase Realtime subscriptions.

**BLUE-B:** Extract reusable components to `libs/shared/ui/src/lib/ContactCard.svelte` and enhance with emotional design animations from the spec including hover effects and card entrance animations, implement advanced filtering with URL state persistence using SvelteKit page stores, add bulk operations for contact management, optimize list rendering with virtual scrolling for large contact lists, and implement contact detail quick preview with smooth transitions.

**REG-B:** Create comprehensive Playwright E2E tests in `apps/web/src/__tests__/contact-management-flow.spec.ts` that test complete contact CRUD workflows, verify search functionality across large datasets, test bulk operations and undo functionality, validate responsive design on different screen sizes, ensure contact import/export functionality works correctly, and verify real-time synchronization between multiple browser sessions.

### Cycle C - AI Contact Enrichment

**RED-C:** Write tests in `apps/api/functions/__tests__/enrich-contact.test.ts` for Edge Function that processes contact data through OpenAI o4-mini model for cost-effective enrichment, generates vector embeddings using text-embedding-3-small model, stores enhanced data with confidence scores in PostgreSQL with pgvector extension, handles API rate limiting with exponential backoff, and triggers Supabase Realtime updates for immediate UI refresh.

**GREEN-C:** Implement `apps/api/functions/enrich-contact/index.ts` Edge Function using Deno runtime that processes contact data through OpenAI API with intelligent prompt engineering, generates semantic embeddings for similarity search, stores enriched data including job title suggestions and company information with confidence metrics, implements cost optimization through intelligent caching, and provides real-time progress updates via Supabase Realtime channels.

**BLUE-C:** Optimize AI enrichment pipeline with intelligent batching for cost reduction stored in `libs/shared/data-access/src/lib/ai-cache.ts`, implement progressive enhancement where basic contact functionality works without AI, add fallback strategies for API failures using cached suggestions, create cost tracking and budget management to prevent overages, and implement quality scoring for AI suggestions with user feedback loops to improve accuracy over time.

**REG-C:** Create comprehensive AI integration tests covering API timeout handling with circuit breaker patterns, malformed response processing with graceful degradation, embedding quality validation against known datasets, cost tracking accuracy with budget alerts, proper error recovery with user notifications, and performance testing under load with realistic contact data volumes and API rate limits.

## USER STORY 4: LOG INTERACTION

### Cycle A - Interaction Data Architecture

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/interactions.test.ts` for interaction CRUD operations storing data in PostgreSQL `interactions` table with proper foreign key relationships to `contacts`, automatic sentiment analysis scoring using OpenAI integration, relationship health score updates based on interaction patterns and frequency, timestamp tracking with timezone handling, and metadata storage using JSONB fields for flexible data.

**GREEN-A:** Implement interaction service in `libs/shared/data-access/src/lib/interactions.ts` with functions for logging different interaction types (email, call, meeting, note), automatic sentiment scoring using OpenAI o4-mini model, relationship health calculation algorithms based on interaction frequency and sentiment, proper timezone handling for global users, and integration with Supabase Realtime for immediate updates across devices.

**BLUE-A:** Extract interaction types and validation to `libs/shared/types/src/interaction.types.ts` with comprehensive TypeScript interfaces, create intelligent interaction categorization using machine learning patterns, implement automatic contact association using fuzzy matching for email participants, add interaction analytics aggregation with efficient database queries, and create interaction timeline optimization for fast retrieval of large datasets.

**REG-A:** Add regression tests for interaction data integrity including interactions with non-existent contacts, preventing negative sentiment scores, validating interaction timeline chronological ordering, testing metadata JSONB structure validation, concurrent interaction logging, and proper cleanup when related contacts are deleted while maintaining referential integrity.

### Cycle B - Interaction Timeline Interface

**RED-B:** Write failing tests in `libs/web/feature-interactions/src/__tests__/InteractionTimeline.test.ts` that verify chronological display of interactions with proper sorting, filtering by interaction type and date range with debounced search, sentiment visualization using color-coded indicators, real-time updates when new interactions are logged via Supabase Realtime, infinite scrolling for large interaction histories, and responsive design for mobile devices.

**GREEN-B:** Build `libs/web/feature-interactions/src/lib/InteractionTimeline.svelte` with chronological interaction display using efficient list rendering, implement `libs/web/feature-interactions/src/lib/InteractionFormModal.svelte` for logging new interactions with rich text editing, integrate with contact detail pages for contextual interaction history, add sentiment visualization with accessible color schemes, and implement real-time updates with smooth animations for new items.

**BLUE-B:** Create reusable interaction components in `libs/shared/ui/src/lib/InteractionItem.svelte` with emotional design animations from the spec, implement virtualized scrolling for optimal performance with thousands of interactions, add advanced search with full-text capabilities using PostgreSQL text search, implement interaction editing and deletion with proper audit trails, and create interaction export functionality for data portability.

**REG-B:** Create Playwright tests for complete interaction management workflows including logging different interaction types with rich content, timeline navigation with keyboard shortcuts, interaction editing and deletion with confirmation dialogs, bulk interaction operations, mobile-responsive interaction logging with touch gestures, and verification of real-time synchronization between multiple devices showing the same contact.

### Cycle C - AI Interaction Analysis

**RED-C:** Create tests in `apps/api/functions/__tests__/analyze-interaction.test.ts` for Edge Function that analyzes interaction content using OpenAI o3 model for advanced reasoning, extracts key topics and actionable insights, identifies follow-up opportunities automatically, calculates relationship impact scores based on interaction sentiment and content, generates topic tags for categorization, and stores analysis results with confidence metrics.

**GREEN-C:** Implement `apps/api/functions/analyze-interaction/index.ts` that processes interaction text through OpenAI API with context-aware prompts, extracts business-relevant insights and action items, generates intelligent follow-up suggestions with optimal timing recommendations, calculates relationship strength deltas based on interaction analysis, implements natural language processing for topic extraction, and triggers automated workflow suggestions.

**BLUE-C:** Optimize interaction analysis with context preservation considering previous interactions for relationship continuity, implement privacy-preserving analysis for sensitive content with configurable privacy levels, add real-time analysis for incoming emails and calendar events with webhook integration, create interaction pattern recognition for relationship health trending, and implement machine learning feedback loops to improve analysis accuracy over time.

**REG-C:** Add comprehensive AI analysis tests including sentiment analysis validation against manually labeled datasets, topic extraction quality assessment with precision/recall metrics, privacy compliance verification for sensitive content handling, analysis performance under high load with realistic interaction volumes, proper handling of non-English content with language detection, and cost optimization validation for API usage patterns.

## USER STORY 5: FOLLOW-UP REMINDERS

### Cycle A - Follow-up Data Management

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/followUps.test.ts` for follow-up CRUD operations using PostgreSQL `follow_ups` table with automated reminder scheduling using Supabase Cron Jobs with natural language scheduling syntax, integration with notification systems for timely alerts, timezone-aware scheduling for global users, and intelligent reminder escalation based on relationship importance and follow-up history.

**GREEN-A:** Implement follow-up service in `libs/shared/data-access/src/lib/followUps.ts` with functions to create, update, and complete follow-ups with proper validation, schedule reminders using Supabase Cron with sub-minute precision, handle overdue follow-up escalation with progressive notification intervals, implement follow-up priority algorithms based on relationship health scores, and integrate with calendar systems for external reminder synchronization.

**BLUE-A:** Extract intelligent scheduling logic to `libs/shared/utils/src/lib/scheduler.ts` with machine learning-based optimal timing suggestions, create follow-up templates based on interaction history and relationship type, implement smart conflict detection to avoid overwhelming users with simultaneous reminders, add follow-up effectiveness tracking with completion rate analytics, and create automated follow-up suggestions based on interaction patterns.

**REG-A:** Add comprehensive regression tests for follow-up edge cases including timezone handling for international contacts with proper DST transitions, follow-up conflicts with user calendar availability, reminder delivery failure handling with retry mechanisms, proper cleanup of completed follow-ups while maintaining historical data, concurrent follow-up modifications, and performance testing with large numbers of scheduled reminders.

### Cycle B - Follow-up Dashboard Interface

**RED-B:** Create failing tests in `libs/web/feature-followups/src/__tests__/FollowUpDashboard.test.ts` that verify overdue follow-up highlighting with visual priority indicators, upcoming reminder display with timeline visualization, follow-up completion workflows with smooth animations, calendar integration for scheduling and conflict detection, bulk follow-up operations, and real-time updates when follow-ups are modified across devices.

**GREEN-B:** Build `libs/web/feature-followups/src/lib/FollowUpDashboard.svelte` with intelligent follow-up prioritization and visual overdue alerts, create `libs/web/feature-followups/src/lib/FollowUpFormModal.svelte` for scheduling with calendar integration, implement main follow-ups page at `apps/web/src/routes/follow-ups/+page.svelte` with filtering and search capabilities, add drag-and-drop rescheduling functionality, and integrate with external calendar systems.

**BLUE-B:** Create reusable components in `libs/shared/ui/src/lib/FollowUpCard.svelte` with emotional design animations for completion celebrations, implement calendar integration with Google Calendar and Outlook, add bulk follow-up operations with undo functionality, create follow-up analytics dashboard showing completion rates and effectiveness metrics, and implement smart notifications that adapt to user behavior patterns and preferences.

**REG-B:** Create Playwright tests for comprehensive follow-up management including creating follow-ups with different priority levels and reminder intervals, mass follow-up operations with bulk selection, calendar integration testing with external providers, mobile follow-up management with touch gestures, notification delivery verification across different channels, and follow-up completion workflows with proper state management.

### Cycle C - AI Follow-up Intelligence

**RED-C:** Write tests in `apps/api/functions/__tests__/generate-followups.test.ts` for Edge Function that analyzes relationship interaction patterns using machine learning, predicts optimal follow-up timing based on historical success rates, generates personalized follow-up message templates using OpenAI models, schedules AI-driven reminders based on relationship health trends, and provides relationship opportunity scoring for prioritization.

**GREEN-C:** Implement `apps/api/functions/generate-followups/index.ts` that uses OpenAI models to analyze relationship data and interaction patterns, predicts optimal follow-up timing using machine learning algorithms, generates contextual follow-up message templates based on previous interactions, creates intelligent priority scoring considering relationship value and engagement history, and implements A/B testing framework for follow-up effectiveness optimization.

**BLUE-C:** Optimize follow-up AI with continuous learning from user behavior patterns and completion rates, implement context-aware suggestions based on industry verticals and relationship types, add predictive analytics for relationship maintenance scheduling, create automated follow-up cadence optimization based on individual relationship responses, and implement intelligent follow-up content suggestions that adapt to communication style preferences.

**REG-C:** Create comprehensive AI follow-up testing including recommendation relevance scoring against user acceptance rates, timing optimization accuracy measured against actual completion data, message template appropriateness validation, user adoption rate tracking with feedback loops, privacy compliance for relationship data analysis, and performance validation under realistic user loads with thousands of contacts and relationships.

## USER STORY 6: CONTACT IMPORT

### Cycle A - OAuth Integration & Import Pipeline

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/import.test.ts` for OAuth integration with LinkedIn and Gmail APIs using proper authentication flows, contact data transformation and normalization from different provider schemas, duplicate detection using pgvector similarity search with configurable match thresholds, batch processing with progress tracking and error handling, and rate limit compliance with intelligent request throttling.

**GREEN-A:** Implement import service in `libs/shared/data-access/src/lib/import.ts` with secure OAuth token management and refresh handling, LinkedIn and Gmail API integration with proper error handling, contact data mapping to internal schema with validation, basic duplicate detection using email and name matching, intelligent batch processing with Supabase Queues for reliability, and comprehensive progress tracking with real-time updates.

**BLUE-A:** Extract OAuth handling to `libs/shared/data-access/src/lib/oauth.service.ts` with security best practices, implement advanced duplicate detection using pgvector similarity search with machine learning-enhanced matching, create import progress tracking with granular status updates, add comprehensive data validation pipelines with field-level error reporting, and implement intelligent import resume functionality for interrupted operations.

**REG-A:** Add comprehensive regression tests for import edge cases including malformed external API responses with graceful error handling, OAuth token expiration during long import operations, network timeouts with automatic retry mechanisms, large dataset handling with memory optimization, proper cleanup of failed imports, and data integrity validation with referential constraint checking.

### Cycle B - Import Wizard Interface

**RED-B:** Write failing tests in `libs/web/feature-contacts/src/__tests__/ContactImportModal.test.ts` for multi-step import wizard that handles OAuth authorization flows with proper error states, displays import progress with real-time updates, shows duplicate conflict resolution interface with side-by-side comparison, provides detailed import summary reports with success/error breakdown, and implements responsive design for mobile import workflows.

**GREEN-B:** Build `libs/web/feature-contacts/src/lib/ContactImportModal.svelte` with step-by-step import flow using emotional design animations, OAuth provider selection with official branding, progress visualization with animated progress bars, duplicate resolution interface with intelligent merge suggestions, import results summary with detailed statistics, and comprehensive error handling with actionable recovery options.

**BLUE-B:** Create reusable import components in `libs/shared/ui/src/lib/ImportWizard.svelte` with accessible step navigation, implement animated progress indicators with smooth transitions, add import preview functionality with data validation feedback, create mobile-optimized import flows with touch-friendly interfaces, implement import scheduling for large datasets, and add import template saving for recurring import patterns.

**REG-B:** Create Playwright tests for complete import workflows including OAuth authorization flows with provider-specific testing, large dataset imports with performance validation, duplicate resolution scenarios with various conflict types, import cancellation and cleanup, cross-browser OAuth compatibility testing, and mobile import workflows with touch interaction validation.

### Cycle C - AI Import Enhancement

**RED-C:** Create tests in `apps/api/functions/__tests__/enhance-import.test.ts` for Edge Function that enriches imported contacts using OpenAI models for data completion, validates and corrects contact data inconsistencies, generates relationship context from available information, optimizes contact prioritization based on professional relevance scoring, implements intelligent contact categorization, and provides data quality assessment with confidence scores.

**GREEN-C:** Implement `apps/api/functions/enhance-import/index.ts` that processes imported contacts through AI enhancement pipeline, corrects data inconsistencies using machine learning validation, generates initial relationship health scores based on available information, creates vector embeddings for semantic search optimization, implements automated contact categorization using industry and role analysis, and provides import quality scoring with improvement suggestions.

**BLUE-C:** Optimize import AI processing with parallel contact enhancement for performance, implement smart contact prioritization based on professional network relevance, add import quality scoring with detailed improvement recommendations, create automated contact deduplication with high-confidence merging, implement multilingual contact data handling with language detection, and add continuous learning from user import feedback to improve future imports.

**REG-C:** Add comprehensive AI import enhancement tests including data quality improvement validation against manual verification, processing speed optimization with realistic dataset sizes, cost management for large imports with budget controls, accuracy assessment of automated categorization, proper handling of edge cases like incomplete or ambiguous data, and privacy compliance validation for data processing workflows.

## USER STORY 7: TAGGING

### Cycle A - Tag Data Management

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/tags.test.ts` for tag CRUD operations using PostgreSQL `tags` and `contact_tags` junction tables with proper many-to-many relationships, tag hierarchy support for nested categorization, tag usage analytics for popularity tracking, automated tag suggestions based on contact data patterns, and tag merging functionality for consolidating similar tags.

**GREEN-A:** Implement tag service in `libs/shared/data-access/src/lib/tags.ts` with functions for creating and managing tags with duplicate prevention, associating tags with contacts using junction table, tag search and filtering with full-text search capabilities, basic tag analytics for usage patterns, tag validation and normalization, and bulk tag operations for efficient management.

**BLUE-A:** Extract tag algorithms to `libs/shared/utils/src/lib/tag-utils.ts` with intelligent tag clustering for related tag discovery, create advanced tag validation with business rules, add tag usage tracking for recommendation improvements, implement tag hierarchies for organizational structure, create tag synonym detection for consistency, and add tag performance analytics for optimization insights.

**REG-A:** Add comprehensive tag regression tests covering edge cases including duplicate tag prevention with case-insensitive matching, special character handling in tag names, tag deletion cascading with proper cleanup, tag performance with large datasets and high-frequency operations, concurrent tag modifications, and tag relationship integrity when contacts are deleted or modified.

### Cycle B - Tag Management Interface

**RED-B:** Create failing tests in `libs/web/feature-tags/src/__tests__/TagInput.test.ts` and `libs/web/feature-tags/src/__tests__/TagFilters.test.ts` that verify tag input component with autocomplete functionality, tag filtering with multiple selection support, tag visualization with color coding and size indicators, tag-based contact search with real-time results, tag management interface with creation and editing, and accessible keyboard navigation for tag operations.

**GREEN-B:** Build `libs/web/feature-tags/src/lib/TagInput.svelte` with intelligent autocomplete using fuzzy search, create `libs/web/feature-tags/src/lib/TagFilters.svelte` for advanced contact filtering with tag combinations, integrate tag management into contact forms and lists, implement tag color coding and visualization, add tag usage statistics display, and create tag suggestion system based on contact attributes.

**BLUE-B:** Create reusable tag components in `libs/shared/ui/src/lib/TagComponent.svelte` with emotional design animations from the spec, implement drag-and-drop tag organization with visual feedback, add advanced tag filtering with boolean logic support, create tag analytics dashboard with usage insights, implement tag import/export functionality, and add tag template system for common categorization patterns.

**REG-B:** Create Playwright tests for comprehensive tag management workflows including creating and applying tags with various combinations, bulk tag operations with undo functionality, tag-based filtering and search with complex queries, tag analytics dashboard interaction, mobile tag management with touch gestures, and tag synchronization testing between multiple devices and browser sessions.

### Cycle C - AI Tag Intelligence

**RED-C:** Write tests in `apps/api/functions/__tests__/suggest-tags.test.ts` for Edge Function that analyzes contact data using OpenAI models to suggest relevant tags based on company information, job titles, industry verticals, and interaction patterns, learns from user tagging behavior to improve suggestions, provides confidence scores for tag recommendations, and implements tag trend analysis for emerging categories.

**GREEN-C:** Implement `apps/api/functions/suggest-tags/index.ts` that processes contact information through AI analysis with industry-specific prompts, generates contextually relevant tag suggestions with confidence scoring, learns from user tagging patterns using machine learning, provides tag trend analysis for professional category identification, implements intelligent tag merging suggestions, and creates personalized tag recommendation systems.

**BLUE-C:** Optimize tag AI with personalized learning algorithms that adapt to individual user tagging preferences, implement context-aware tag suggestions based on interaction content and relationship dynamics, add tag trend analysis for emerging professional categories and industry changes, create automated tag maintenance with cleanup suggestions, implement tag relationship discovery for semantic tagging, and add collaborative tag suggestions for team environments.

**REG-C:** Create comprehensive AI tag testing including relevance scoring validation against user acceptance rates, suggestion diversity and coverage analysis, learning rate assessment from user feedback, performance evaluation with diverse professional backgrounds and industries, privacy compliance for tag analysis, and scalability testing with large tag taxonomies and user bases.

## USER STORY 8: OPPORTUNITIES

### Cycle A - Opportunity Data Architecture

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/opportunities.test.ts` for opportunity CRUD operations using PostgreSQL `opportunities` and `opportunity_contacts` junction tables with proper foreign key constraints, opportunity status tracking with state machine validation, value calculation and currency handling, contact-opportunity relationship management with role tracking, and opportunity analytics with aggregation queries.

**GREEN-A:** Implement opportunity service in `libs/shared/data-access/src/lib/opportunities.ts` with functions for creating and managing opportunities with comprehensive validation, linking contacts to opportunities with role specification, tracking opportunity progress through defined stages, calculating opportunity values with currency conversion, implementing opportunity search and filtering, and creating opportunity analytics with performance metrics.

**BLUE-A:** Extract opportunity algorithms to `libs/shared/utils/src/lib/opportunity-utils.ts` with intelligent opportunity prioritization based on value and likelihood scoring, create opportunity analytics and reporting with trend analysis, add opportunity timeline tracking with milestone management, implement opportunity value prediction using historical data, create opportunity collaboration features for team environments, and add opportunity template system for common patterns.

**REG-A:** Add comprehensive opportunity regression tests covering edge cases including opportunity value validation with currency constraints, contact relationship integrity with proper cleanup, opportunity status transitions with business rule validation, duplicate opportunity prevention, concurrent opportunity modifications, and opportunity archival processes with data retention compliance.

### Cycle B - Opportunity Management Interface

**RED-B:** Write failing tests in `libs/web/feature-opportunities/src/__tests__/OpportunityCard.test.ts` and `libs/web/feature-opportunities/src/__tests__/OpportunityFormModal.test.ts` that verify opportunity display with linked contact visualization, opportunity creation and editing forms with comprehensive validation, opportunity pipeline visualization with drag-and-drop functionality, opportunity analytics dashboard with interactive charts, and responsive design for mobile opportunity management.

**GREEN-B:** Build `libs/web/feature-opportunities/src/lib/OpportunityCard.svelte` with contact linking interface and visual relationship indicators, create `libs/web/feature-opportunities/src/lib/OpportunityFormModal.svelte` for comprehensive opportunity management with contact association, implement opportunities page at `apps/web/src/routes/opportunities/+page.svelte` with filtering and search, add opportunity pipeline visualization, and integrate analytics dashboard with performance metrics.

**BLUE-B:** Create reusable opportunity components in `libs/shared/ui/src/lib/OpportunityComponents.svelte` with emotional design animations, implement opportunity kanban board interface with drag-and-drop status updates, add advanced opportunity search and filtering with saved views, create opportunity collaboration features with activity feeds, implement opportunity export functionality, and add opportunity template system for rapid creation.

**REG-B:** Create Playwright tests for complete opportunity management including creating opportunities with complex contact associations, opportunity pipeline management with status transitions, opportunity analytics dashboard with interactive elements, bulk opportunity operations, mobile opportunity tracking with touch interactions, and opportunity collaboration workflows with real-time updates.

### Cycle C - AI Opportunity Intelligence

**RED-C:** Create tests in `apps/api/functions/__tests__/detect-opportunities.test.ts` for Edge Function that analyzes relationship networks using graph algorithms, identifies potential business opportunities from interaction patterns, suggests optimal contact connections for opportunity advancement, predicts opportunity likelihood using machine learning models, implements network analysis for connection path optimization, and provides opportunity scoring with confidence metrics.

**GREEN-C:** Implement `apps/api/functions/detect-opportunities/index.ts` that processes relationship data through AI analysis with network science algorithms, identifies opportunity patterns from interaction content and timing, suggests strategic contact connections with relationship path analysis, predicts opportunity success likelihood using historical patterns, implements intelligent opportunity ranking, and creates automated opportunity pipeline updates.

**BLUE-C:** Optimize opportunity AI with advanced network analysis algorithms for relationship mapping, implement predictive opportunity scoring based on historical data and market conditions, add industry-specific opportunity detection with vertical expertise, create automated opportunity pipeline management with intelligent status updates, implement opportunity risk assessment with mitigation suggestions, and add collaborative intelligence for team-based opportunity development.

**REG-C:** Create comprehensive AI opportunity testing including opportunity prediction validation against actual outcomes with accuracy metrics, false positive and negative rate analysis, opportunity value estimation accuracy assessment, network analysis quality validation, ethical AI practices verification for business suggestions, and performance testing with realistic relationship network sizes and complexity.

## USER STORY 9: DASHBOARD OVERVIEW

### Cycle A - Analytics Data Pipeline

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/analytics.test.ts` for analytics data aggregation from contacts, interactions, and follow-ups tables using optimized PostgreSQL queries, real-time metric calculation with materialized view updates, trend analysis with time-series data processing, performance optimization using database indexing strategies, and analytics caching with intelligent invalidation patterns.

**GREEN-A:** Implement analytics service in `libs/shared/data-access/src/lib/analytics.ts` with functions for calculating relationship health metrics using complex aggregation queries, interaction trend analysis with time-based grouping, network growth statistics with cohort analysis, follow-up effectiveness rates with completion tracking, comprehensive performance optimization using materialized views, and real-time analytics updates using Supabase Realtime subscriptions.

**BLUE-A:** Extract analytics algorithms to `libs/shared/utils/src/lib/analytics-utils.ts` with advanced statistical calculations, implement intelligent caching strategies for expensive computations, create real-time analytics pipeline using Supabase Realtime with change detection, add analytics data validation with anomaly detection, implement analytics export functionality, and create analytics API with rate limiting and pagination.

**REG-A:** Add comprehensive analytics regression tests covering edge cases including users with no data scenarios, large dataset performance with realistic data volumes, real-time update accuracy with concurrent modifications, analytics calculation consistency with data changes, proper handling of deleted or archived data, and analytics performance optimization validation.

### Cycle B - Dashboard Interface

**RED-B:** Create failing tests in `libs/web/feature-analytics/src/__tests__/Dashboard.test.ts` that verify metric widgets display current data with proper formatting, interactive charts show trend information with hover tooltips, dashboard customization works with drag-and-drop layout, real-time updates function correctly with WebSocket connections, responsive design adapts to different screen sizes, and dashboard performance remains optimal with large datasets.

**GREEN-B:** Build dashboard components in `libs/web/feature-analytics/src/lib/` including `MetricCard.svelte` with animated counters, `NetworkGrowthChart.svelte` with interactive visualizations, and `AnalyticsDashboard.svelte` with customizable layout, create main dashboard page at `apps/web/src/routes/dashboard/+page.svelte` with real-time updates, implement dashboard personalization with saved layouts, and add export functionality for analytics data.

**BLUE-B:** Create reusable analytics components in `libs/shared/ui/src/lib/AnalyticsComponents.svelte` with emotional design animations including counter animations and chart transitions, implement interactive chart functionality with drill-down capabilities, add dashboard personalization features with widget configuration, create mobile-optimized dashboard layouts with touch-friendly interactions, implement dashboard sharing functionality, and add dashboard templating system.

**REG-B:** Create Playwright tests for comprehensive dashboard functionality including metric accuracy verification with database validation, chart interaction testing with hover and click events, dashboard responsiveness across different devices and screen sizes, customization persistence with layout saving, real-time data update validation with multiple browser sessions, and dashboard performance testing with large datasets.

### Cycle C - AI Dashboard Intelligence

**RED-C:** Write tests in `apps/api/functions/__tests__/generate-insights.test.ts` for Edge Function that analyzes dashboard metrics using OpenAI models to generate natural language insights about networking performance, identifies patterns and trends in relationship data, suggests strategic actions for network growth, provides competitive benchmarking insights, implements predictive analytics for relationship trends, and creates personalized goal recommendations.

**GREEN-C:** Implement `apps/api/functions/generate-insights/index.ts` that processes analytics data through AI analysis with business intelligence prompts, generates natural language insights about networking performance patterns, identifies areas for improvement with actionable recommendations, suggests strategic networking actions based on data patterns, implements automated insight delivery with scheduling, and creates personalized dashboard content based on user behavior.

**BLUE-C:** Optimize dashboard AI with predictive analytics for relationship trend forecasting, implement personalized goal setting based on historical patterns and industry benchmarks, add competitive benchmarking insights with anonymized data comparison, create automated insight delivery scheduling with user preference adaptation, implement insight effectiveness tracking with user engagement metrics, and add collaborative insights for team dashboard environments.

**REG-C:** Create comprehensive AI dashboard testing including insight relevance and accuracy validation against business outcomes, recommendation effectiveness tracking with user adoption rates, insight personalization quality assessment, processing performance for real-time insight generation, user engagement measurement with AI-generated content, and privacy compliance validation for aggregated analytics processing.

## USER STORY 10: ACCOUNT MANAGEMENT

### Cycle A - User Profile Management

**RED-A:** Create failing tests in `libs/shared/data-access/src/__tests__/profile.test.ts` for user profile CRUD operations with comprehensive validation, password change functionality using Supabase Auth with security compliance, email update workflows with verification processes, account deletion with complete data cleanup, audit logging for profile changes, and data export functionality for GDPR compliance.

**GREEN-A:** Implement profile service in `libs/shared/data-access/src/lib/profile.ts` with functions for updating user profiles with validation, secure password changes using Supabase Auth methods with strength requirements, managing email changes with verification workflows, handling account deactivation with data retention policies, comprehensive audit logging for security compliance, and data export functionality for privacy regulations.

**BLUE-A:** Extract security features to `libs/shared/data-access/src/lib/security.service.ts` with advanced threat detection, implement comprehensive audit logging for all profile changes with tamper-proof storage, create data export functionality with complete user data aggregation, add profile validation with business rules and security checks, implement account recovery workflows, and create privacy control systems for granular data management.

**REG-A:** Add comprehensive profile management regression tests covering edge cases including concurrent profile updates with conflict resolution, password strength validation with comprehensive security rules, email change conflicts with existing accounts, account deletion cascading with complete data cleanup, proper cleanup of user data across all related tables, and privacy compliance validation with data retention verification.

### Cycle B - Settings Interface

**RED-B:** Write failing tests in `apps/web/src/routes/settings/__tests__/+page.test.ts` that verify profile editing forms with real-time validation, password change workflows with security feedback, notification preference management with granular controls, privacy settings with clear explanations, account deletion confirmation processes with data impact warnings, and responsive design for mobile settings management.

**GREEN-B:** Build settings page at `apps/web/src/routes/settings/+page.svelte` with comprehensive profile editing forms using DaisyUI components, secure password change interface with strength indicators, notification preferences with granular control options, privacy controls with clear explanations and impact warnings, account management options with safety confirmations, and integration with external services for data sync.

**BLUE-B:** Create reusable settings components in `libs/shared/ui/src/lib/SettingsComponents.svelte` with emotional design animations for smooth interactions, implement advanced form validation with real-time feedback and security indicators, add settings change confirmation with undo functionality, create settings export and import functionality, implement settings search for complex preference management, and add settings history tracking for change management.

**REG-B:** Create Playwright tests for comprehensive settings management including profile update workflows with validation testing, password change security with strength requirement validation, notification preference persistence across devices, privacy setting validation with data impact verification, account deletion prevention safeguards with recovery options, and settings synchronization testing between multiple sessions.

### Cycle C - Advanced Security Features

**RED-C:** Create tests in `apps/api/functions/__tests__/security-audit.test.ts` for security monitoring functionality that tracks login patterns with anomaly detection, detects suspicious activity using machine learning, manages device authorization with trust scoring, implements advanced account protection with behavioral analysis, provides security alerts with actionable recommendations, and creates comprehensive security dashboards for user awareness.

**GREEN-C:** Implement security monitoring in `apps/api/functions/security-audit/index.ts` that analyzes login patterns with geolocation and device fingerprinting, detects unusual access attempts using behavioral analysis, manages trusted devices with automatic trust decay, provides real-time security alerts with context and recommendations, implements advanced multi-factor authentication options, and creates security dashboard with actionable insights.

**BLUE-C:** Optimize security features with machine learning for advanced anomaly detection, implement adaptive authentication that adjusts security requirements based on risk assessment, add comprehensive security dashboard for user security awareness, create automated security recommendations based on threat landscape analysis, implement security incident response automation, and add security compliance reporting for enterprise users.

**REG-C:** Create comprehensive security testing including anomaly detection accuracy against known attack patterns, multi-factor authentication workflow reliability across different methods, security alert delivery with appropriate urgency levels, device management functionality with trust score validation, compliance verification with security standards and privacy regulations, and performance testing of security monitoring under realistic threat loads.

## USER STORY 11: DUPLICATE CONTACT HANDLING

### Cycle A - Duplicate Detection Engine

**RED-A:** Write failing tests in `libs/shared/data-access/src/__tests__/duplicates.test.ts` for duplicate detection using pgvector similarity search with HNSW indexing, fuzzy matching algorithms for names and companies with configurable thresholds, confidence scoring for matches with machine learning enhancement, merge conflict resolution with field-level comparison, and performance optimization for large contact databases.

**GREEN-A:** Implement duplicate detection service in `libs/shared/data-access/src/lib/duplicates.ts` with functions for finding similar contacts using vector embeddings and semantic similarity, calculating match confidence scores using multiple data points and algorithms, providing intelligent merge recommendations with conflict highlighting, implementing fuzzy matching for various contact fields, and creating duplicate detection optimization for real-time processing.

**BLUE-A:** Extract matching algorithms to `libs/shared/utils/src/lib/matching-utils.ts` with advanced similarity scoring using multiple data points and weighted algorithms, implement machine learning enhancement for improving match accuracy over time, create duplicate detection optimization for large datasets with efficient indexing, add intelligent conflict resolution with user preference learning, and implement duplicate prevention during contact creation.

**REG-A:** Add comprehensive duplicate detection regression tests covering edge cases including partial name matches with various formatting, different email formats and aliases, international name variations with Unicode handling, company name changes and acquisitions, contacts with minimal information, and performance testing with large-scale duplicate detection operations.

### Cycle B - Duplicate Resolution Interface

**RED-B:** Create failing tests in `libs/web/feature-contacts/src/__tests__/DuplicateResolver.test.ts` that verify duplicate conflict display with side-by-side comparison, merge option selection with field-level choices, intelligent merge suggestions with confidence indicators, merge preview functionality with change highlighting, post-merge validation with data integrity checks, and undo functionality for accidental merges.

**GREEN-B:** Build `libs/web/feature-contacts/src/lib/DuplicateResolver.svelte` with comprehensive side-by-side contact comparison interface, intelligent field-level merge selection with confidence scoring, merge preview with change highlighting, integration into contact creation and import workflows, batch duplicate resolution for import scenarios, and comprehensive audit trail for merge operations.

**BLUE-B:** Create reusable duplicate resolution components in `libs/shared/ui/src/lib/DuplicateComponents.svelte` with emotional design animations for smooth resolution workflows, implement smart merge suggestions based on data quality scoring, add comprehensive undo functionality with change tracking, create duplicate resolution analytics for process improvement, implement merge templates for common scenarios, and add collaborative duplicate resolution for team environments.

**REG-B:** Create Playwright tests for comprehensive duplicate resolution including complete merge workflows with various conflict scenarios, field selection validation with data integrity checking, merge preview accuracy with change highlighting, undo functionality with complete rollback verification, bulk duplicate resolution with progress tracking, and merge audit trail validation with complete change history.

### Cycle C - AI Duplicate Intelligence

**RED-C:** Write tests in `apps/api/functions/__tests__/smart-duplicates.test.ts` for Edge Function that uses OpenAI models to analyze contact similarities beyond basic field matching, understands context clues for identity confirmation, provides intelligent merge suggestions with business logic, analyzes professional relationships for duplicate validation, and implements continuous learning from user merge decisions.

**GREEN-C:** Implement `apps/api/functions/smart-duplicates/index.ts` that processes contact data through AI analysis for subtle duplicate pattern identification, analyzes professional relationships and network connections for identity confirmation, generates confidence-scored merge recommendations with business context, implements natural language processing for context understanding, creates intelligent merge conflict resolution with business logic, and provides learning feedback for algorithm improvement.

**BLUE-C:** Optimize duplicate AI with continuous learning algorithms that improve from user merge decisions, implement industry-specific duplicate detection patterns for different professional contexts, add relationship network analysis for duplicate validation using graph algorithms, create automated duplicate cleanup for high-confidence matches with safety checks, implement collaborative duplicate detection for team environments, and add duplicate prevention systems with real-time validation.

**REG-C:** Create comprehensive AI duplicate testing including accuracy validation against manually verified duplicate sets, false positive and negative rate analysis with statistical significance, learning improvement measurement over time with user feedback integration, processing performance evaluation for real-time duplicate detection, proper handling of edge cases like common names and frequent job changes, and privacy compliance verification for relationship analysis processing.

---

**Total: 132 prompts (11 stories × 12 prompts each) providing comprehensive guidance for building the complete Weople professional relationship management platform using modern technologies including SvelteKit, React Native, Supabase with pgvector, OpenAI integration, and comprehensive testing strategies.**
