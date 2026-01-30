-- Migration: Interactions Tables
-- Description: Interaction types and interactions tables
-- Dependencies: 00000000000002_contacts.sql
-- Created: 2026-01-30

-- interaction_types table
-- Hybrid system + user-defined interaction types
CREATE TABLE interaction_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- NULL user_id for system types, set for user-defined
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'message-circle',
    color TEXT DEFAULT '#3b82f6',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Add table comments
COMMENT ON TABLE interaction_types IS 'Interaction types (system + user-defined)';
COMMENT ON COLUMN interaction_types.id IS 'Unique type identifier';
COMMENT ON COLUMN interaction_types.user_id IS 'Owner (NULL for system types)';
COMMENT ON COLUMN interaction_types.name IS 'Type name (e.g., email, call, meeting)';
COMMENT ON COLUMN interaction_types.icon IS 'Lucide icon name';
COMMENT ON COLUMN interaction_types.color IS 'Hex color code';
COMMENT ON COLUMN interaction_types.is_system IS 'True for system types, false for custom';
COMMENT ON COLUMN interaction_types.created_at IS 'Creation timestamp';

-- Add constraint to ensure color is valid hex format
ALTER TABLE interaction_types ADD CONSTRAINT chk_color_format
    CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- Add constraint to ensure icon is not empty
ALTER TABLE interaction_types ADD CONSTRAINT chk_icon_not_empty
    CHECK (icon <> '');

-- Insert system interaction types
-- These are available to all users
INSERT INTO interaction_types (name, icon, color, is_system, user_id) VALUES
    ('email', 'mail', '#3b82f6', true, NULL),
    ('call', 'phone', '#22c55e', true, NULL),
    ('meeting', 'calendar', '#f59e0b', true, NULL),
    ('note', 'file-text', '#6b7280', true, NULL),
    ('social', 'share-2', '#8b5cf6', true, NULL),
    ('other', 'more-horizontal', '#9ca3af', true, NULL);

-- interactions table
-- Logs interactions between user and contacts
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES interaction_types(id),
    interaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    sentiment_score FLOAT CHECK (sentiment_score BETWEEN -1 AND 1),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comments
COMMENT ON TABLE interactions IS 'Interaction logs between users and contacts';
COMMENT ON COLUMN interactions.id IS 'Unique interaction identifier';
COMMENT ON COLUMN interactions.contact_id IS 'Reference to contacted person';
COMMENT ON COLUMN interactions.user_id IS 'User who logged the interaction';
COMMENT ON COLUMN interactions.type_id IS 'Type of interaction';
COMMENT ON COLUMN interactions.interaction_date IS 'When the interaction occurred';
COMMENT ON COLUMN interactions.notes IS 'Notes about the interaction';
COMMENT ON COLUMN interactions.sentiment_score IS 'AI-analyzed sentiment (-1 to 1)';
COMMENT ON COLUMN interactions.metadata IS 'JSONB metadata for extensibility';
COMMENT ON COLUMN interactions.created_at IS 'Record creation timestamp';

-- Trigger to update contact's last_interaction when interaction is created
CREATE TRIGGER update_contact_last_interaction_on_insert
    AFTER INSERT ON interactions
    FOR EACH ROW
    EXECUTE FUNCTION app.update_contact_last_interaction();

-- Trigger to update contact's health_score based on interaction recency
-- This is a simplified version - actual health calculation may be more complex
CREATE OR REPLACE FUNCTION app.update_contact_health_score()
RETURNS TRIGGER AS $$
DECLARE
    days_since_interaction INTEGER;
    new_health INTEGER;
BEGIN
    -- Calculate days since last interaction
    SELECT EXTRACT(DAY FROM (NOW() - COALESCE(MAX(interaction_date), contacts.created_at)))::INTEGER
    INTO days_since_interaction
    FROM interactions
    WHERE contact_id = NEW.contact_id
    AND user_id = NEW.user_id;

    -- Simple health decay calculation (can be refined)
    -- Base health of 100, loses 5 points per week of inactivity after 2 weeks
    SELECT CASE
        WHEN days_since_interaction <= 14 THEN 100
        WHEN days_since_interaction <= 30 THEN 85
        WHEN days_since_interaction <= 60 THEN 70
        WHEN days_since_interaction <= 90 THEN 50
        WHEN days_since_interaction <= 180 THEN 30
        ELSE 10
    END INTO new_health;

    UPDATE contacts
    SET health_score = new_health
    WHERE id = NEW.contact_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_health_on_interaction
    AFTER INSERT OR UPDATE OF interaction_date ON interactions
    FOR EACH ROW
    EXECUTE FUNCTION app.update_contact_health_score();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON interactions TO authenticated;
GRANT SELECT ON interaction_types TO authenticated;
GRANT SELECT ON interaction_types TO anon;
