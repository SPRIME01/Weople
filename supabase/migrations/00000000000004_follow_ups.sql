-- Migration: Follow-ups Table
-- Description: Follow-ups and reminders table
-- Dependencies: 00000000000003_interactions.sql
-- Created: 2026-01-30

-- follow_ups table
-- Tracks follow-up tasks and reminders for contacts
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    ai_suggested BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comments
COMMENT ON TABLE follow_ups IS 'Follow-up tasks and reminders';
COMMENT ON COLUMN follow_ups.id IS 'Unique follow-up identifier';
COMMENT ON COLUMN follow_ups.contact_id IS 'Associated contact (NULL if general task)';
COMMENT ON COLUMN follow_ups.user_id IS 'Owner of the follow-up';
COMMENT ON COLUMN follow_ups.title IS 'Follow-up title (required)';
COMMENT ON COLUMN follow_ups.description IS 'Detailed description';
COMMENT ON COLUMN follow_ups.due_date IS 'When the follow-up is due';
COMMENT ON COLUMN follow_ups.priority IS 'Priority level: low, medium, high, critical';
COMMENT ON COLUMN follow_ups.completed IS 'Whether the follow-up is completed';
COMMENT ON COLUMN follow_ups.completed_at IS 'When the follow-up was completed';
COMMENT ON COLUMN follow_ups.ai_suggested IS 'True if suggested by AI';
COMMENT ON COLUMN follow_ups.created_at IS 'Creation timestamp';

-- Add constraint to ensure title is not empty
ALTER TABLE follow_ups ADD CONSTRAINT chk_title_not_empty
    CHECK (title <> '');

-- Add constraint to ensure due_date is in the future (for new records)
-- Note: This is optional and may be too restrictive for imports
-- ALTER TABLE follow_ups ADD CONSTRAINT chk_due_date_future
--     CHECK (due_date >= NOW());

-- Add constraint to ensure completed_at is set when completed is true
ALTER TABLE follow_ups ADD CONSTRAINT chk_completed_at_logic
    CHECK (
        (completed = FALSE AND completed_at IS NULL) OR
        (completed = TRUE)
    );

-- Trigger to automatically set completed_at when completed is set to true
CREATE OR REPLACE FUNCTION app.set_follow_up_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = NOW();
    ELSIF NEW.completed = FALSE AND OLD.completed = TRUE THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_follow_up_completed_at
    BEFORE UPDATE OF completed ON follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION app.set_follow_up_completed_at();

-- Function to create follow-up from interaction analysis
CREATE OR REPLACE FUNCTION app.create_follow_up_from_interaction(
    p_contact_id UUID,
    p_user_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_due_date TIMESTAMPTZ,
    p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    v_follow_up_id UUID;
BEGIN
    INSERT INTO follow_ups (
        contact_id,
        user_id,
        title,
        description,
        due_date,
        priority,
        ai_suggested,
        created_at
    ) VALUES (
        p_contact_id,
        p_user_id,
        p_title,
        p_description,
        p_due_date,
        p_priority,
        TRUE,
        NOW()
    )
    RETURNING id INTO v_follow_up_id;

    RETURN v_follow_up_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON follow_ups TO authenticated;
GRANT EXECUTE ON FUNCTION app.create_follow_up_from_interaction(UUID, UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT) TO authenticated;
