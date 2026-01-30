-- Migration: Row Level Security Policies
-- Description: Enable RLS and create policies for all user-data tables
-- Dependencies: 00000000000007_indexes.sql
-- Created: 2026-01-30

-- ============================================
-- Enable RLS on all tables
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Interaction Types
ALTER TABLE interaction_types ENABLE ROW LEVEL SECURITY;

-- Interactions
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Follow-ups
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Contact Tags
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

-- Opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Opportunity Contacts
ALTER TABLE opportunity_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles Policies
-- ============================================

-- Users can view their own profile
CREATE POLICY profiles_select_own ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- System can insert profiles (via trigger)
CREATE POLICY profiles_insert_system ON profiles
    FOR INSERT
    WITH CHECK (true);  -- Handled by trigger security

-- ============================================
-- Contacts Policies
-- ============================================

-- Users can view their own active contacts
CREATE POLICY contacts_select_own ON contacts
    FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can insert their own contacts
CREATE POLICY contacts_insert_own ON contacts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own contacts
CREATE POLICY contacts_update_own ON contacts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete their own contacts (actual delete prevented by trigger)
CREATE POLICY contacts_delete_own ON contacts
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Interaction Types Policies
-- ============================================

-- Users can view system types AND their own custom types
CREATE POLICY interaction_types_select ON interaction_types
    FOR SELECT
    USING (is_system = TRUE OR auth.uid() = user_id);

-- Users can insert their own custom types
CREATE POLICY interaction_types_insert_own ON interaction_types
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Users can update their own custom types
CREATE POLICY interaction_types_update_own ON interaction_types
    FOR UPDATE
    USING (auth.uid() = user_id AND is_system = FALSE)
    WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Users can delete their own custom types
CREATE POLICY interaction_types_delete_own ON interaction_types
    FOR DELETE
    USING (auth.uid() = user_id AND is_system = FALSE);

-- ============================================
-- Interactions Policies
-- ============================================

-- Users can view their own interactions (with contact ownership verification)
CREATE POLICY interactions_select_own ON interactions
    FOR SELECT
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = interactions.contact_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can insert interactions for their contacts
CREATE POLICY interactions_insert_own ON interactions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can update their own interactions
CREATE POLICY interactions_update_own ON interactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own interactions
CREATE POLICY interactions_delete_own ON interactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Follow-ups Policies
-- ============================================

-- Users can view their own follow-ups
CREATE POLICY follow_ups_select_own ON follow_ups
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own follow-ups
CREATE POLICY follow_ups_insert_own ON follow_ups
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        (contact_id IS NULL OR EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_id
            AND c.user_id = auth.uid()
        ))
    );

-- Users can update their own follow-ups
CREATE POLICY follow_ups_update_own ON follow_ups
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own follow-ups
CREATE POLICY follow_ups_delete_own ON follow_ups
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Tags Policies
-- ============================================

-- Users can view their own tags
CREATE POLICY tags_select_own ON tags
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own tags
CREATE POLICY tags_insert_own ON tags
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own tags
CREATE POLICY tags_update_own ON tags
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tags
CREATE POLICY tags_delete_own ON tags
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Contact Tags Policies
-- ============================================

-- Users can view contact-tag relationships for their data
CREATE POLICY contact_tags_select_own ON contact_tags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_tags.contact_id
            AND c.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM tags t
            WHERE t.id = contact_tags.tag_id
            AND t.user_id = auth.uid()
        )
    );

-- Users can insert contact-tag relationships for their data
CREATE POLICY contact_tags_insert_own ON contact_tags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_id
            AND c.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM tags t
            WHERE t.id = tag_id
            AND t.user_id = auth.uid()
        )
    );

-- Users can update contact-tag relationships for their data
CREATE POLICY contact_tags_update_own ON contact_tags
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_tags.contact_id
            AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_id
            AND c.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM tags t
            WHERE t.id = tag_id
            AND t.user_id = auth.uid()
        )
    );

-- Users can delete contact-tag relationships for their data
CREATE POLICY contact_tags_delete_own ON contact_tags
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_tags.contact_id
            AND c.user_id = auth.uid()
        )
    );

-- ============================================
-- Opportunities Policies
-- ============================================

-- Users can view their own opportunities
CREATE POLICY opportunities_select_own ON opportunities
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own opportunities
CREATE POLICY opportunities_insert_own ON opportunities
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own opportunities
CREATE POLICY opportunities_update_own ON opportunities
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own opportunities
CREATE POLICY opportunities_delete_own ON opportunities
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Opportunity Contacts Policies
-- ============================================

-- Users can view opportunity-contact relationships for their data
CREATE POLICY opportunity_contacts_select_own ON opportunity_contacts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM opportunities o
            WHERE o.id = opportunity_contacts.opportunity_id
            AND o.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = opportunity_contacts.contact_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can insert opportunity-contact relationships for their data
CREATE POLICY opportunity_contacts_insert_own ON opportunity_contacts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM opportunities o
            WHERE o.id = opportunity_id
            AND o.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can update opportunity-contact relationships for their data
CREATE POLICY opportunity_contacts_update_own ON opportunity_contacts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM opportunities o
            WHERE o.id = opportunity_contacts.opportunity_id
            AND o.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM opportunities o
            WHERE o.id = opportunity_id
            AND o.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM contacts c
            WHERE c.id = contact_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can delete opportunity-contact relationships for their data
CREATE POLICY opportunity_contacts_delete_own ON opportunity_contacts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM opportunities o
            WHERE o.id = opportunity_contacts.opportunity_id
            AND o.user_id = auth.uid()
        )
    );

-- ============================================
-- Service Role Policies (for Edge Functions)
-- ============================================

-- Create a function to check if the current user is a service role
CREATE OR REPLACE FUNCTION app.is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the current role is service_role
    -- This works in Supabase Edge Functions with service_role key
    RETURN (
        auth.jwt() ->> 'role' = 'service_role' OR
        current_user = 'supabase_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Service role can access all contacts
CREATE POLICY contacts_service_all ON contacts
    FOR ALL
    USING (app.is_service_role())
    WITH CHECK (app.is_service_role());

-- Service role can access all interactions
CREATE POLICY interactions_service_all ON interactions
    FOR ALL
    USING (app.is_service_role())
    WITH CHECK (app.is_service_role());

-- Service role can access all follow_ups
CREATE POLICY follow_ups_service_all ON follow_ups
    FOR ALL
    USING (app.is_service_role())
    WITH CHECK (app.is_service_role());

-- Service role can access all opportunities
CREATE POLICY opportunities_service_all ON opportunities
    FOR ALL
    USING (app.is_service_role())
    WITH CHECK (app.is_service_role());

-- ============================================
-- Policy Documentation
-- ============================================

COMMENT ON TABLE profiles IS 'RLS: Users can only access their own profile';
COMMENT ON TABLE contacts IS 'RLS: Users can only access their own contacts (soft delete supported)';
COMMENT ON TABLE interaction_types IS 'RLS: System types visible to all, custom types user-only';
COMMENT ON TABLE interactions IS 'RLS: Users can only access interactions for their contacts';
COMMENT ON TABLE follow_ups IS 'RLS: Users can only access their own follow-ups';
COMMENT ON TABLE tags IS 'RLS: Users can only access their own tags';
COMMENT ON TABLE contact_tags IS 'RLS: Users can only access tags for their contacts';
COMMENT ON TABLE opportunities IS 'RLS: Users can only access their own opportunities';
COMMENT ON TABLE opportunity_contacts IS 'RLS: Users can only access opportunities for their contacts';

