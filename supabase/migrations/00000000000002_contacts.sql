-- Migration: Contacts Table
-- Description: Contacts table with vector reference support and soft delete
-- Dependencies: 00000000000001_profiles.sql
-- Created: 2026-01-30

-- contacts table
-- Stores contact information for each user with soft delete support
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    bio TEXT,
    metadata JSONB DEFAULT '{}',
    -- Vector reference (actual vectors stored in Qdrant/Pinecone)
    vector_id TEXT,
    -- Health score for relationship health (0-100)
    health_score INTEGER DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
    last_interaction TIMESTAMPTZ,
    -- Soft delete support
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint per user per email (only for non-null emails)
    UNIQUE(user_id, email)
);

-- Add table comments
COMMENT ON TABLE contacts IS 'Contact information for users with soft delete support';
COMMENT ON COLUMN contacts.id IS 'Unique contact identifier';
COMMENT ON COLUMN contacts.user_id IS 'Owner of the contact (references auth.users)';
COMMENT ON COLUMN contacts.name IS 'Contact full name (required)';
COMMENT ON COLUMN contacts.email IS 'Contact email address';
COMMENT ON COLUMN contacts.phone IS 'Contact phone number';
COMMENT ON COLUMN contacts.company IS 'Contact company/organization';
COMMENT ON COLUMN contacts.job_title IS 'Contact job title/position';
COMMENT ON COLUMN contacts.bio IS 'Contact biography/notes';
COMMENT ON COLUMN contacts.metadata IS 'JSONB metadata for extensibility';
COMMENT ON COLUMN contacts.vector_id IS 'Reference to vector embedding in external vector database';
COMMENT ON COLUMN contacts.health_score IS 'Relationship health score (0-100, default 50)';
COMMENT ON COLUMN contacts.last_interaction IS 'Timestamp of last interaction';
COMMENT ON COLUMN contacts.deleted_at IS 'Soft delete timestamp (NULL = active)';
COMMENT ON COLUMN contacts.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN contacts.updated_at IS 'Last update timestamp';

-- Add constraint to ensure email is not empty string if provided
ALTER TABLE contacts ADD CONSTRAINT chk_email_not_empty
    CHECK (email IS NULL OR email <> '');

-- Add constraint to ensure name is not empty
ALTER TABLE contacts ADD CONSTRAINT chk_name_not_empty
    CHECK (name <> '');

-- Add constraint for phone format (basic E.164 validation)
ALTER TABLE contacts ADD CONSTRAINT chk_phone_format
    CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');

-- Trigger to automatically update updated_at
CREATE TRIGGER set_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

-- Trigger to update last_interaction when an interaction is logged
-- This is handled by the interactions table trigger (see interactions migration)

-- Function to update contact's last_interaction
CREATE OR REPLACE FUNCTION app.update_contact_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE contacts
    SET last_interaction = NEW.interaction_date
    WHERE id = NEW.contact_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
