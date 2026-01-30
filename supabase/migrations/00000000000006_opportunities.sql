-- Migration: Opportunities Tables
-- Description: Opportunities and opportunity_contacts junction table
-- Dependencies: 00000000000005_tags.sql
-- Created: 2026-01-30

-- opportunities table
-- Tracks sales/business opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(15,2),
    currency TEXT DEFAULT 'USD',
    stage TEXT DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    probability INTEGER CHECK (probability BETWEEN 0 AND 100),
    expected_close TIMESTAMPTZ,
    actual_close TIMESTAMPTZ,
    outcome TEXT,
    ai_detected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comments
COMMENT ON TABLE opportunities IS 'Sales and business opportunities pipeline';
COMMENT ON COLUMN opportunities.id IS 'Unique opportunity identifier';
COMMENT ON COLUMN opportunities.user_id IS 'Owner of the opportunity';
COMMENT ON COLUMN opportunities.title IS 'Opportunity title/name';
COMMENT ON COLUMN opportunities.description IS 'Detailed description';
COMMENT ON COLUMN opportunities.value IS 'Estimated deal value';
COMMENT ON COLUMN opportunities.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN opportunities.stage IS 'Pipeline stage';
COMMENT ON COLUMN opportunities.probability IS 'Win probability percentage (0-100)';
COMMENT ON COLUMN opportunities.expected_close IS 'Expected close date';
COMMENT ON COLUMN opportunities.actual_close IS 'Actual close date';
COMMENT ON COLUMN opportunities.outcome IS 'Outcome description for closed deals';
COMMENT ON COLUMN opportunities.ai_detected IS 'True if detected by AI analysis';
COMMENT ON COLUMN opportunities.created_at IS 'Creation timestamp';
COMMENT ON COLUMN opportunities.updated_at IS 'Last update timestamp';

-- Add constraint to ensure title is not empty
ALTER TABLE opportunities ADD CONSTRAINT chk_opportunity_title_not_empty
    CHECK (title <> '');

-- Add constraint to ensure currency is valid ISO 4217 format (3 uppercase letters)
ALTER TABLE opportunities ADD CONSTRAINT chk_currency_format
    CHECK (currency ~ '^[A-Z]{3}$');

-- Add constraint to ensure probability is set when stage is closed
ALTER TABLE opportunities ADD CONSTRAINT chk_probability_for_closed
    CHECK (
        stage NOT IN ('closed_won', 'closed_lost') OR
        probability IS NOT NULL
    );

-- Add constraint to ensure actual_close is set when stage is closed
ALTER TABLE opportunities ADD CONSTRAINT chk_actual_close_for_closed
    CHECK (
        stage NOT IN ('closed_won', 'closed_lost') OR
        actual_close IS NOT NULL
    );

-- Trigger to automatically update updated_at
CREATE TRIGGER set_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

-- opportunity_contacts junction table
-- Many-to-many relationship between opportunities and contacts with roles
CREATE TABLE opportunity_contacts (
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'influencer' CHECK (role IN ('decision_maker', 'influencer', 'user', 'champion', 'blocker')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (opportunity_id, contact_id)
);

-- Add table comments
COMMENT ON TABLE opportunity_contacts IS 'Junction table linking opportunities to contacts with roles';
COMMENT ON COLUMN opportunity_contacts.opportunity_id IS 'Reference to opportunity';
COMMENT ON COLUMN opportunity_contacts.contact_id IS 'Reference to contact';
COMMENT ON COLUMN opportunity_contacts.role IS 'Contact role in the opportunity';
COMMENT ON COLUMN opportunity_contacts.created_at IS 'When the contact was linked';

-- Trigger to ensure contact and opportunity belong to same user
CREATE OR REPLACE FUNCTION app.check_opportunity_contact_ownership()
RETURNS TRIGGER AS $$
DECLARE
    opportunity_user_id UUID;
    contact_user_id UUID;
BEGIN
    -- Get the user_id of the opportunity
    SELECT user_id INTO opportunity_user_id
    FROM opportunities
    WHERE id = NEW.opportunity_id;

    -- Get the user_id of the contact
    SELECT user_id INTO contact_user_id
    FROM contacts
    WHERE id = NEW.contact_id;

    -- Ensure they match
    IF opportunity_user_id <> contact_user_id THEN
        RAISE EXCEPTION 'Opportunity and contact must belong to the same user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_opportunity_contact_ownership
    BEFORE INSERT OR UPDATE ON opportunity_contacts
    FOR EACH ROW
    EXECUTE FUNCTION app.check_opportunity_contact_ownership();

-- Function to calculate pipeline value by stage
CREATE OR REPLACE FUNCTION app.get_pipeline_summary(p_user_id UUID)
RETURNS TABLE (
    stage TEXT,
    count BIGINT,
    total_value DECIMAL,
    avg_probability DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.stage,
        COUNT(*)::BIGINT,
        COALESCE(SUM(o.value * COALESCE(o.probability, 0) / 100), 0)::DECIMAL as total_value,
        COALESCE(AVG(o.probability), 0)::DECIMAL as avg_probability
    FROM opportunities o
    WHERE o.user_id = p_user_id
    AND o.stage NOT IN ('closed_won', 'closed_lost')
    GROUP BY o.stage
    ORDER BY
        CASE o.stage
            WHEN 'prospecting' THEN 1
            WHEN 'qualification' THEN 2
            WHEN 'proposal' THEN 3
            WHEN 'negotiation' THEN 4
            ELSE 5
        END;
END;
$$ LANGUAGE plpgsql;

-- Function to get opportunity win rate
CREATE OR REPLACE FUNCTION app.get_win_rate(p_user_id UUID)
RETURNS TABLE (
    total_closed BIGINT,
    won_count BIGINT,
    lost_count BIGINT,
    win_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_closed,
        COUNT(*) FILTER (WHERE stage = 'closed_won')::BIGINT as won_count,
        COUNT(*) FILTER (WHERE stage = 'closed_lost')::BIGINT as lost_count,
        CASE
            WHEN COUNT(*) > 0
            THEN (COUNT(*) FILTER (WHERE stage = 'closed_won')::DECIMAL / COUNT(*)::DECIMAL * 100)
            ELSE 0
        END as win_rate
    FROM opportunities
    WHERE user_id = p_user_id
    AND stage IN ('closed_won', 'closed_lost');
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON opportunity_contacts TO authenticated;
GRANT EXECUTE ON FUNCTION app.get_pipeline_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION app.get_win_rate(UUID) TO authenticated;
