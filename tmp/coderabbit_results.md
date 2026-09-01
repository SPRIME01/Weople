Starting CodeRabbit review in plain text mode...

Connecting to review service
Setting up
Analyzing
Reviewing

============================================================================
File: libs/shared/types/src/lib/entities/profile.types.ts
Line: 16 to 22
Type: potential_issue

[ ] Task:
In @libs/shared/types/src/lib/entities/profile.types.ts around lines 16 - 22, UserPreferences currently defines ai_enabled which duplicates Profile.ai_enabled causing ambiguity; decide to use Profile.ai_enabled as the single source of truth: remove ai_enabled from the UserPreferences interface in UserPreferences (the symbol UserPreferences in profile.types.ts), update any code that reads/writes preferences.ai_enabled to use Profile.ai_enabled instead, and add a short comment on Profile.ai_enabled documenting it is the authoritative flag; ensure no lingering references to UserPreferences.ai_enabled remain (or adapt them to read/write Profile.ai_enabled).



============================================================================
File: supabase/migrations/00000000000004_follow_ups.sql
Line: 108 to 110
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000004_follow_ups.sql around lines 108 - 110, The follow_ups table currently grants full CRUD to the authenticated role without Row Level Security, allowing users to access others' follow-ups; enable RLS on follow_ups (ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY) and add per-operation policies that restrict operations to auth.uid() — create SELECT policy (USING user_id = auth.uid()), INSERT policy (WITH CHECK user_id = auth.uid()), UPDATE policy (USING user_id = auth.uid() AND WITH CHECK user_id = auth.uid()), and DELETE policy (USING user_id = auth.uid()); keep the existing GRANT EXECUTE on function app.create_follow_up_from_interaction but ensure that any inserts via that function set user_id to auth.uid() or validate appropriately.



============================================================================
File: supabase/migrations/00000000000004_follow_ups.sql
Line: 52 to 68
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000004_follow_ups.sql around lines 52 - 68, The existing trigger function app.set_follow_up_completed_at() and trigger set_follow_up_completed_at only run BEFORE UPDATE OF completed, so INSERTs with completed = TRUE won't set completed_at; add a BEFORE INSERT trigger and handler (e.g., app.set_follow_up_completed_at_on_insert and trigger set_follow_up_completed_at_on_insert) that checks IF NEW.completed = TRUE AND NEW.completed_at IS NULL THEN sets NEW.completed_at = NOW(); and returns NEW to ensure imported or direct inserts get completed_at populated.



============================================================================
File: supabase/migrations/00000000000002_contacts.sql
Line: 70 to 79
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000002_contacts.sql around lines 70 - 79, The trigger function app.update_contact_last_interaction currently updates contacts regardless of soft-deletion; modify the UPDATE in app.update_contact_last_interaction so it only affects non-deleted rows (e.g., add a condition to the WHERE clause referencing contacts.deleted_at IS NULL or equivalent) so interactions against soft-deleted contacts are ignored; ensure the logic still returns NEW and works correctly when the contact is missing or deleted.



============================================================================
File: libs/shared/data-access/src/lib/ports/relational-database.port.ts
Line: 141 to 145
Type: refactor_suggestion

[ ] Task:
In @libs/shared/data-access/src/lib/ports/relational-database.port.ts around lines 141 - 145, The subscribe method currently returns Subscription synchronously; change the signature of subscribe(table: string, filters: FilterOptions, callback: (payload: T) => void): Subscription to return a Promise so async setup is supported (subscribe(...): Promise). Update the interface symbol subscribe and any related types (Subscription, FilterOptions) consumers and implementations to await the returned promise, and ensure implementations perform async initialization (e.g., websocket or trigger setup) and reject the promise on setup errors to enable proper error handling.



============================================================================
File: libs/shared/data-access/src/lib/errors/result.ts
Line: 112 to 129
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/errors/result.ts around lines 112 - 129, The JSDoc for flatMap is misleadingly claiming it "Chains asynchronous operations" while the function and its parameter fn are synchronous (fn returns Result, not a Promise); update the comment for the flatMap function to describe synchronous/result-chaining behavior, mention that fn is applied to the success value and must return a Result, and remove any references to asynchronous operations or Promises so the documentation matches the flatMap(result: Result, fn: (data: T) => Result) implementation.



============================================================================
File: libs/shared/data-access/src/lib/ports/vector-database.port.ts
Line: 92 to 196
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/ports/vector-database.port.ts around lines 92 - 196, The ScrollResult type is unused by VectorDatabasePort; either remove ScrollResult or add a scroll method to the port. Add a method signature to VectorDatabasePort: scroll(collection: string, limit?: number, offset?: string, filters?: VectorFilterOptions): Promise; and update all implementations of VectorDatabasePort (classes implementing connect/disconnect/createCollection/upsert/etc.) to implement scroll, or if you decide not to support scrolling, delete the ScrollResult interface and any related references (ensure VectorFilterOptions is still used where needed).



============================================================================
File: supabase/migrations/00000000000005_tags.sql
Line: 8 to 17
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000005_tags.sql around lines 8 - 17, Enable Row Level Security for the tags table and add a policy that restricts all operations to the owning user: run ALTER TABLE tags ENABLE ROW LEVEL SECURITY and create a policy (e.g., "Users can only access their own tags") ON tags FOR ALL using user_id = auth.uid() and with check user_id = auth.uid(); also add an index on user_id (e.g., idx_tags_user_id) to improve query performance when filtering by user_id. Ensure you reference the tags table and the user_id column when applying these changes.



============================================================================
File: supabase/migrations/00000000000005_tags.sql
Line: 41 to 42
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000005_tags.sql around lines 41 - 42, Update the misleading SQL comment: instead of saying "prevent circular references (parent must be same user)" change it to clearly state that the trigger only enforces that a tag's parent belongs to the same user (e.g., "Ensure parent tag belongs to same user; does NOT prevent multi-node circular references like A→B→C→A"). Reference the existing trigger/constraint text (the "trigger below" that validates parent ownership) so readers know this is an ownership check only and not full cycle detection; if desired, add a note suggesting cycle detection would be a separate, more expensive validation.



============================================================================
File: supabase/migrations/00000000000005_tags.sql
Line: 75 to 80
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000005_tags.sql around lines 75 - 80, Enable row level security on the contact_tags table and add a policy to restrict access to tag links to the owning user: ENABLE ROW LEVEL SECURITY on contact_tags and create a policy named like "Users can manage their own contact tags" ON contact_tags FOR ALL USING (EXISTS (SELECT 1 FROM contacts WHERE id = contact_id AND user_id = auth.uid())); also add an index for tag lookups by creating idx_contact_tags_tag_id on contact_tags(tag_id) so queries filtering by tag_id (e.g., get_contacts_by_tag) are efficient.



============================================================================
File: libs/shared/data-access/src/lib/errors/app-error.ts
Line: 24 to 33
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/errors/app-error.ts around lines 24 - 33, The toJSON method on AppError currently always serializes the stack trace which can leak internal paths; update the AppError.toJSON method to avoid exposing stack by default — either remove the stack property from the returned object or change the signature to toJSON(includeStack = false): Record and only attach stack when includeStack is true (for debug uses); update any callers that relied on the old behavior to pass true when they explicitly need the stack (e.g., logging paths) and keep the default production behavior stack-free.



============================================================================
File: supabase/migrations/00000000000004_follow_ups.sql
Line: 46 to 50
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000004_follow_ups.sql around lines 46 - 50, The CHECK constraint chk_completed_at_logic on table follow_ups is too permissive (it allows completed = TRUE with completed_at IS NULL); change the condition so that completed = TRUE requires completed_at IS NOT NULL (e.g., enforce (completed = FALSE AND completed_at IS NULL) OR (completed = TRUE AND completed_at IS NOT NULL)). After tightening the constraint, ensure the existing trigger/trigger function that currently only fires on UPDATE is extended to also handle INSERT (or add a new BEFORE INSERT trigger) so rows created with completed = TRUE get a non-null completed_at set by the trigger logic.



============================================================================
File: libs/shared/data-access/src/lib/ports/graph-database.port.ts
Line: 50 to 60
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/ports/graph-database.port.ts around lines 50 - 60, GraphContact currently includes an email field that may unnecessarily replicate PII into the graph store; review usage of GraphContact.email and either remove it or make its inclusion explicit/controlled (e.g., stop populating GraphContact.email at ingest, add a separate GraphContactPII type, or add a boolean flag like includePII to guard population) so the graph only contains email when required for graph operations; update any producer/consumer code that constructs or relies on GraphContact (schemas, functions that build contacts) to stop copying email unless verified necessary and document the decision.



============================================================================
File: supabase/migrations/00000000000003_interactions.sql
Line: 119 to 122
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000003_interactions.sql around lines 119 - 122, Enable Row Level Security on the interactions and interaction_types tables and add the proposed RLS policies so authenticated/anon roles cannot access other users' data: run ALTER TABLE interactions ENABLE ROW LEVEL SECURITY and create interactions_select_policy, interactions_insert_policy, interactions_update_policy, and interactions_delete_policy that restrict USING and WITH CHECK to user_id = auth.uid() for SELECT/INSERT/UPDATE/DELETE respectively (attach to role authenticated); also run ALTER TABLE interaction_types ENABLE ROW LEVEL SECURITY and create interaction_types_select_policy (FOR SELECT TO authenticated USING is_system = true OR user_id = auth.uid()) and interaction_types_anon_policy (FOR SELECT TO anon USING is_system = true) so system types remain public while user-defined types are scoped to their owners.



============================================================================
File: libs/shared/data-access/src/lib/ports/object-storage.port.ts
Line: 301 to 302
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/ports/object-storage.port.ts around lines 301 - 302, The JSDoc for the forcePathStyle property claims it's "required for Garage" but the property is optional (forcePathStyle?: boolean); fix the inconsistency by either making the property required (remove the ? from forcePathStyle) or clarifying the default in the comment (e.g., "Force path-style URLs (default: true, required for Garage)"). Update the declaration and JSDoc accordingly so the code and docs match for the forcePathStyle symbol.



============================================================================
File: supabase/migrations/00000000000007_indexes.sql
Line: 82 to 83
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000007_indexes.sql around lines 82 - 83, The partial index idx_followups_overdue currently uses a time-based predicate (due_date < NOW()) which is evaluated once at creation; remove the time-dependent portion so the index remains valid over time by changing the WHERE clause to only use the stable condition (e.g., WHERE completed = FALSE) on the follow_ups table and keep the indexed columns user_id and due_date so runtime queries can still apply WHERE due_date < NOW() dynamically; update the migration statement that creates idx_followups_overdue accordingly (reference: idx_followups_overdue, follow_ups, due_date, completed).



============================================================================
File: supabase/migrations/00000000000001_profiles.sql
Line: 59 to 67
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000001_profiles.sql around lines 59 - 67, The SECURITY DEFINER function app.handle_user_email_update lacks an explicit search_path; modify the function body to set an explicit search_path at runtime (e.g., call set_config('search_path','app,public', true) or EXECUTE 'SET LOCAL search_path = ...' at the start of app.handle_user_email_update) so the function runs with a controlled schema search_path under SECURITY DEFINER; ensure this change is added inside the function before any table references (e.g., before the IF/UPDATE logic) to mirror the fix applied to handle_new_user.



============================================================================
File: supabase/migrations/00000000000001_profiles.sql
Line: 74 to 76
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000001_profiles.sql around lines 74 - 76, Enable Row Level Security on the profiles table and add explicit RLS policies to restrict access: call ALTER TABLE profiles ENABLE ROW LEVEL SECURITY, then create policies (e.g., "allow_select_own_profile", "allow_insert_own_profile", "allow_update_own_profile", "allow_delete_own_profile") that only permit SELECT/INSERT/UPDATE/DELETE when auth.uid() = profiles.id (or other appropriate owner check) for the authenticated role, and ensure anon has only the minimal SELECT if needed (or no access) by using USING and WITH CHECK clauses to enforce ownership; remove or tighten the blanket GRANTs so RLS policies control row access.



============================================================================
File: supabase/migrations/00000000000007_indexes.sql
Line: 163 to 167
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000007_indexes.sql around lines 163 - 167, The partial index idx_contacts_needing_followup on table contacts uses NOW() - INTERVAL '30 days' which is evaluated at migration time; remove the time-based condition and create the partial index only on deleted_at IS NULL (keeping user_id and last_interaction in the index definition) so the 30-day filter is applied at query time using last_interaction comparisons instead of baking the timestamp into the index.



============================================================================
File: libs/shared/data-access/src/lib/validation/opportunity.schema.ts
Line: 65
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/validation/opportunity.schema.ts at line 65, The updateOpportunitySchema currently uses createOpportunitySchema.partial(), which causes the currency default ('USD') to be applied on updates and can overwrite existing values; fix this by introducing a baseOpportunitySchema that defines fields (including currency as optional without .default), then define createOpportunitySchema = baseOpportunitySchema.extend({ currency: z.string().length(3).default('USD') }) and set updateOpportunitySchema = baseOpportunitySchema.partial() (or alternatively create a dedicated updateOpportunitySchema that omits any .default on currency), updating usages of createOpportunitySchema and updateOpportunitySchema accordingly.



============================================================================
File: libs/shared/data-access/src/lib/ports/graph-database.port.ts
Line: 117 to 123
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/ports/graph-database.port.ts around lines 117 - 123, The query(sparqlQuery: string): Promise method accepts raw SPARQL strings and may be vulnerable to SPARQL injection if any part of sparqlQuery is constructed from user input; update the JSDoc for query to include a clear warning not to interpolate user input directly (e.g., "Do not construct queries by concatenating or interpolating untrusted input; sanitize or escape values first") and add a short note suggesting implementation of a parameterized query alternative or prepared-statement API in the future to safely bind user-supplied values.



============================================================================
File: libs/shared/data-access/src/lib/ports/ai-gateway.port.ts
Line: 15 to 31
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/ports/ai-gateway.port.ts around lines 15 - 31, The CompletionMessage interface is missing the required tool_call_id for tool-role messages; update the CompletionMessage type to include an optional tool_call_id?: string (with a comment stating it is required when role === 'tool') alongside the existing fields so tool responses can be correlated with the original tool call; locate the interface declaration named CompletionMessage and add the tool_call_id property (ensuring its name exactly matches "tool_call_id") and keep existing toolCalls unchanged.



============================================================================
File: supabase/migrations/00000000000005_tags.sql
Line: 143 to 154
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000005_tags.sql around lines 143 - 154, The function app.get_contact_tag_count currently returns tag counts for any contact_id without verifying ownership; update app.get_contact_tag_count to validate that the calling user owns the contact before returning the count (similar to the check used in get_contacts_by_tag): either accept a caller UUID or read the current JWT user id (e.g., via current_setting/jwt claim) and join/contact lookup against the contacts table to ensure contacts.owner_id = caller_id, and if not owned return 0 or raise a permission error; modify the SELECT that populates v_count (and the function signature if needed) to include this ownership filter so only a contact owner can retrieve the tag count.



============================================================================
File: supabase/migrations/00000000000001_profiles.sql
Line: 37 to 50
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000001_profiles.sql around lines 37 - 50, The SECURITY DEFINER function app.handle_new_user lacks an explicit search_path; update the function body to set a safe search_path at the top (for example to the app schema plus public and pg_temp) using either SET LOCAL search_path or PERFORM set_config(...) so the function runs with a fixed schema resolution before any SQL executes; modify app.handle_new_user to set the search_path immediately on entry (preserving SECURITY DEFINER and existing INSERT/RETURN logic).



============================================================================
File: supabase/migrations/00000000000003_interactions.sql
Line: 74 to 78
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000003_interactions.sql around lines 74 - 78, The trigger update_contact_last_interaction_on_insert currently fires only AFTER INSERT on interactions so updates to interaction_date won't refresh contact.last_interaction; change the trigger declaration to fire AFTER INSERT OR UPDATE OF interaction_date (or add an equivalent UPDATE trigger) so that app.update_contact_last_interaction() is executed when interaction_date is changed, ensuring contact.last_interaction is updated on both new rows and relevant updates.



============================================================================
File: supabase/migrations/00000000000005_tags.sql
Line: 120 to 140
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000005_tags.sql around lines 120 - 140, The function app.get_contacts_by_tag currently returns contacts for any tag ID without verifying ownership; update it to validate that the tag identified by p_tag_id is owned by the calling user (use auth.uid() or your project's JWT subject helper) before returning contacts. Concretely, in app.get_contacts_by_tag add a check that the tag's owner_id (or equivalent owner column on tags) equals the current user UID (auth.uid()) — either by joining tags t ON t.id = p_tag_id and adding WHERE t.owner_id = auth.uid(), or by querying the tag owner first and RAISE EXCEPTION / RETURN EMPTY if it does not match — leaving the rest of the contact selection (join on contact_tags ct and contacts c) intact. Ensure you reference p_tag_id and the tags table / owner column in your change.



============================================================================
File: supabase/migrations/00000000000008_rls_policies.sql
Line: 367 to 377
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000008_rls_policies.sql around lines 367 - 377, The migration defines the function app.is_service_role but never ensures the app schema exists, which will cause the migration to fail if the schema is missing; add a statement to create the schema if it does not exist (e.g., run CREATE SCHEMA IF NOT EXISTS app) before the app.is_service_role() function definition so the SECURITY DEFINER function can be created into the app schema.



============================================================================
File: supabase/migrations/00000000000003_interactions.sql
Line: 88 to 93
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000003_interactions.sql around lines 88 - 93, The COALESCE references contacts.created_at but the SELECT only queries interactions, causing a runtime error; update the days_since_interaction calculation to obtain the contact's created_at via a join or subquery instead of referencing contacts directly. Specifically, change the SELECT that computes days_since_interaction (using EXTRACT... INTO days_since_interaction FROM interactions WHERE contact_id = NEW.contact_id AND user_id = NEW.user_id) so it either joins the contacts table on contacts.id = NEW.contact_id or uses a scalar subquery like (SELECT created_at FROM contacts WHERE id = NEW.contact_id) as the COALESCE fallback; ensure you keep NEW.contact_id and NEW.user_id as filters and preserve the INTO days_since_interaction target.



============================================================================
File: libs/shared/data-access/src/lib/ports/relational-database.port.ts
Line: 125 to 131
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/ports/relational-database.port.ts around lines 125 - 131, The transaction callback currently only receives a Transaction with commit()/rollback(), preventing query execution inside the transaction; update the API so the callback receives a scoped DB handle that can execute queries within the transaction context (e.g. have the Transaction interface extend or be combined with the database operations interface used elsewhere, or define a TransactionContext type exposing query/insert/update methods) and change the signature of transaction(callback: ...) to accept that enriched Transaction/TransactionContext so implementations of transaction and callers can run queries through the provided transactional handle.



============================================================================
File: supabase/migrations/00000000000001_profiles.sql
Line: 30 to 31
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000001_profiles.sql around lines 30 - 31, The explicit index "idx_profiles_email" on profiles(email) is redundant because the existing UNIQUE constraint on the email column already creates an index; remove the CREATE INDEX idx_profiles_email ON profiles(email); statement (or comment it out) so only the UNIQUE constraint remains, eliminating duplicate index creation and avoiding extra storage/write overhead.



============================================================================
File: libs/shared/data-access/src/lib/ports/ai-gateway.port.ts
Line: 344 to 351
Type: potential_issue

[ ] Task:
In @libs/shared/data-access/src/lib/ports/ai-gateway.port.ts around lines 344 - 351, The CompletionChunk interface lacks fields required for streaming function-calls; update the CompletionChunk type (in libs/shared/data-access/src/lib/ports/ai-gateway.port.ts) to include a nullable finishReason (string | null) to indicate why the stream ended (e.g., 'tool_calls') and a toolCalls field to carry partial/accumulated tool call data across chunks (e.g., an array or partial representation of ToolCall objects), keeping usage?: TokenUsage on the final chunk; ensure names match existing types (ToolCall, TokenUsage) so callers can append/inspect partial tool call data during streaming.



============================================================================
File: libs/shared/types/src/lib/domain/health.types.ts
Line: 64 to 74
Type: potential_issue

[ ] Task:
In @libs/shared/types/src/lib/domain/health.types.ts around lines 64 - 74, The property name HealthThresholds.atRisk and the HealthCategory value 'at_risk' are inconsistent; pick one convention and make both match (either change HealthThresholds.atRisk -> at_risk or change HealthCategory 'at_risk' -> 'atRisk'), then update the HealthCategory type and HealthThresholds interface accordingly and search/replace all usages (e.g., any mapping logic, enums, serializers/deserializers, tests) to use the chosen symbol consistently (reference: HealthThresholds.atRisk and HealthCategory).



============================================================================
File: supabase/migrations/00000000000003_interactions.sql
Line: 17
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000003_interactions.sql at line 17, The UNIQUE(user_id, name) constraint allows duplicate system-type names because NULL user_id values are not considered equal; update the schema for the interaction_types table by adding a partial unique index that enforces uniqueness of name when user_id IS NULL (i.e., for system types) while keeping the existing UNIQUE(user_id, name) for user-scoped types; locate the UNIQUE(user_id, name) constraint in the migration and add a corresponding partial unique index for rows with user_id IS NULL so system interaction type names cannot be duplicated.



============================================================================
File: supabase/migrations/00000000000008_rls_policies.sql
Line: 167 to 176
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000008_rls_policies.sql around lines 167 - 176, The follow_ups_update_own policy only checks auth.uid() = user_id in WITH CHECK, letting users set contact_id to contacts they don't own; update the policy (follow_ups_update_own) to add a contact ownership guard in the WITH CHECK clause by ensuring either contact_id is NULL or contact_id belongs to the calling user (e.g., contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid()) or equivalent EXISTS check), while keeping the existing auth.uid() = user_id check and preserving USING (auth.uid() = user_id).



============================================================================
File: supabase/migrations/00000000000008_rls_policies.sql
Line: 53 to 55
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000008_rls_policies.sql around lines 53 - 55, The INSERT policy profiles_insert_system on table profiles currently uses WITH CHECK (true) which permits arbitrary ids; update the policy to enforce the inserted row's id equals the authenticated user by changing the WITH CHECK clause to WITH CHECK (id = auth.uid()), so that any insert must have id matching auth.uid() (you can still keep the trigger for additional safety).



============================================================================
File: supabase/migrations/00000000000006_opportunities.sql
Line: 70 to 78
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000006_opportunities.sql around lines 70 - 78, The opportunity_contacts junction table lacks row-level security and an index for reverse lookups: enable RLS on opportunity_contacts and add a btree index on contact_id (e.g., CREATE INDEX ON opportunity_contacts(contact_id)) to speed queries for opportunities by contact; then add RLS policies (SELECT, INSERT, UPDATE, DELETE) for opportunity_contacts mirroring the logic used for opportunities (granting access to the same roles/conditions used there) so that authorized users can read/write junction rows while others are denied.



============================================================================
File: supabase/migrations/00000000000008_rls_policies.sql
Line: 136 to 144
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000008_rls_policies.sql around lines 136 - 144, The UPDATE and DELETE policies interactions_update_own and interactions_delete_own currently only check auth.uid() = user_id; update them to also verify contact ownership the same way SELECT/INSERT do by adding the contact ownership expression (e.g., EXISTS(SELECT 1 FROM contacts WHERE id = contact_id AND user_id = auth.uid()) or equivalent reference used in interactions_select_own/interactions_insert_own) into their USING clauses and add the contact ownership check into the WITH CHECK clause for UPDATE so users cannot change contact_id to one they don't own; keep the existing auth.uid() = user_id checks as well.



============================================================================
File: supabase/migrations/00000000000006_opportunities.sql
Line: 8 to 23
Type: potential_issue

[ ] Task:
In @supabase/migrations/00000000000006_opportunities.sql around lines 8 - 23, The opportunities table lacks Row Level Security and an index on user_id; enable RLS on the opportunities table, create permissive policies for SELECT/INSERT/UPDATE/DELETE that restrict access to rows where auth.uid() = user_id (use explicit policy names like opportunities_select_policy, opportunities_insert_policy, opportunities_update_policy, opportunities_delete_policy), and add an index on user_id (e.g., CREATE INDEX ON opportunities(user_id)) to ensure RLS checks are efficient; ensure INSERT policy allows setting user_id from auth.uid() and UPDATE/DELETE policies only permit changes when auth.uid() = user_id.



Review completed ✔
