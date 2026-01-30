-- Migration: Tags Tables
-- Description: Tags and contact_tags junction table
-- Dependencies: 00000000000004_follow_ups.sql
-- Created: 2026-01-30

-- tags table
-- User-defined tags for categorizing contacts
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    parent_id UUID REFERENCES tags(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Add table comments
COMMENT ON TABLE tags IS 'User-defined tags for contact categorization';
COMMENT ON COLUMN tags.id IS 'Unique tag identifier';
COMMENT ON COLUMN tags.user_id IS 'Owner of the tag';
COMMENT ON COLUMN tags.name IS 'Tag name (unique per user)';
COMMENT ON COLUMN tags.color IS 'Hex color code for UI display';
COMMENT ON COLUMN tags.parent_id IS 'Parent tag for hierarchical tags';
COMMENT ON COLUMN tags.description IS 'Tag description';
COMMENT ON COLUMN tags.created_at IS 'Creation timestamp';

-- Add constraint to ensure name is not empty
ALTER TABLE tags ADD CONSTRAINT chk_tag_name_not_empty
    CHECK (name <> '');

-- Add constraint to ensure color is valid hex format
ALTER TABLE tags ADD CONSTRAINT chk_tag_color_format
    CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Add constraint to prevent self-referencing parent
ALTER TABLE tags ADD CONSTRAINT chk_tag_no_self_parent
    CHECK (parent_id IS NULL OR parent_id <> id);

-- Add constraint to prevent circular references (parent must be same user)
-- This is handled by the trigger below

-- Trigger to ensure parent tag belongs to same user
CREATE OR REPLACE FUNCTION app.check_tag_parent_ownership()
RETURNS TRIGGER AS $$
DECLARE
    parent_user_id UUID;
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        SELECT user_id INTO parent_user_id
        FROM tags
        WHERE id = NEW.parent_id;

        IF parent_user_id IS NULL THEN
            RAISE EXCEPTION 'Parent tag does not exist';
        END IF;

        IF parent_user_id <> NEW.user_id THEN
            RAISE EXCEPTION 'Parent tag must belong to the same user';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_tag_parent_ownership
    BEFORE INSERT OR UPDATE OF parent_id ON tags
    FOR EACH ROW
    EXECUTE FUNCTION app.check_tag_parent_ownership();

-- contact_tags junction table
-- Many-to-many relationship between contacts and tags
CREATE TABLE contact_tags (
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (contact_id, tag_id)
);

-- Add table comments
COMMENT ON TABLE contact_tags IS 'Junction table for contact-tag relationships';
COMMENT ON COLUMN contact_tags.contact_id IS 'Reference to contact';
COMMENT ON COLUMN contact_tags.tag_id IS 'Reference to tag';
COMMENT ON COLUMN contact_tags.created_at IS 'When the tag was applied';

-- Trigger to ensure tag belongs to same user as contact
CREATE OR REPLACE FUNCTION app.check_contact_tag_ownership()
RETURNS TRIGGER AS $$
DECLARE
    contact_user_id UUID;
    tag_user_id UUID;
BEGIN
    -- Get the user_id of the contact
    SELECT user_id INTO contact_user_id
    FROM contacts
    WHERE id = NEW.contact_id;

    -- Get the user_id of the tag
    SELECT user_id INTO tag_user_id
    FROM tags
    WHERE id = NEW.tag_id;

    -- Ensure they match
    IF contact_user_id <> tag_user_id THEN
        RAISE EXCEPTION 'Contact and tag must belong to the same user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_contact_tag_ownership
    BEFORE INSERT OR UPDATE ON contact_tags
    FOR EACH ROW
    EXECUTE FUNCTION app.check_contact_tag_ownership();

-- Function to get contacts by tag
CREATE OR REPLACE FUNCTION app.get_contacts_by_tag(p_tag_id UUID)
RETURNS TABLE (
    contact_id UUID,
    contact_name TEXT,
    contact_email TEXT,
    health_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.email,
        c.health_score
    FROM contacts c
    INNER JOIN contact_tags ct ON c.id = ct.contact_id
    WHERE ct.tag_id = p_tag_id
    AND c.deleted_at IS NULL
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get tag count for a contact
CREATE OR REPLACE FUNCTION app.get_contact_tag_count(p_contact_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM contact_tags
    WHERE contact_id = p_contact_id;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_tags TO authenticated;
GRANT EXECUTE ON FUNCTION app.get_contacts_by_tag(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION app.get_contact_tag_count(UUID) TO authenticated;
