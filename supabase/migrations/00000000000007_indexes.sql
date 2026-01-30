-- Migration: Performance Indexes
-- Description: Create indexes for frequently queried columns
-- Dependencies: 00000000000006_opportunities.sql
-- Created: 2026-01-30

-- ============================================
-- Contacts Indexes
-- ============================================

-- Index for user lookups on active contacts (excludes soft-deleted)
CREATE INDEX idx_contacts_user_id ON contacts(user_id) WHERE deleted_at IS NULL;

-- Index for email lookups
CREATE INDEX idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;

-- Composite index for user + email unique constraint enforcement and lookups
CREATE INDEX idx_contacts_user_email ON contacts(user_id, email) WHERE deleted_at IS NULL;

-- Index for health score filtering/sorting
CREATE INDEX idx_contacts_health ON contacts(user_id, health_score) WHERE deleted_at IS NULL;

-- Composite index for user + health score for dashboard queries
CREATE INDEX idx_contacts_user_health_desc ON contacts(user_id, health_score DESC) WHERE deleted_at IS NULL;

-- Index for deleted contacts (for soft delete queries)
CREATE INDEX idx_contacts_deleted ON contacts(user_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- Index for last_interaction sorting
CREATE INDEX idx_contacts_last_interaction ON contacts(user_id, last_interaction DESC NULLS LAST) WHERE deleted_at IS NULL;

-- Index for company filtering
CREATE INDEX idx_contacts_company ON contacts(company) WHERE deleted_at IS NULL;

-- Full-text search index on name using trigrams
CREATE INDEX idx_contacts_name_trgm ON contacts USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL;

-- Full-text search index on bio using trigrams
CREATE INDEX idx_contacts_bio_trgm ON contacts USING gin(bio gin_trgm_ops) WHERE deleted_at IS NULL;

-- Index for vector_id lookups (when syncing with vector DB)
CREATE INDEX idx_contacts_vector_id ON contacts(vector_id) WHERE vector_id IS NOT NULL AND deleted_at IS NULL;

-- ============================================
-- Interactions Indexes
-- ============================================

-- Index for contact lookups
CREATE INDEX idx_interactions_contact ON interactions(contact_id);

-- Composite index for user + date sorting (most recent first)
CREATE INDEX idx_interactions_user_date ON interactions(user_id, interaction_date DESC);

-- Index for type lookups
CREATE INDEX idx_interactions_type ON interactions(type_id);

-- Composite index for contact + date (contact timeline)
CREATE INDEX idx_interactions_contact_date ON interactions(contact_id, interaction_date DESC);

-- Index for sentiment score filtering
CREATE INDEX idx_interactions_sentiment ON interactions(user_id, sentiment_score) WHERE sentiment_score IS NOT NULL;

-- ============================================
-- Interaction Types Indexes
-- ============================================

-- Index for user lookups (for custom types)
CREATE INDEX idx_interaction_types_user ON interaction_types(user_id) WHERE is_system = FALSE;

-- Index for system type lookups
CREATE INDEX idx_interaction_types_system ON interaction_types(is_system) WHERE is_system = TRUE;

-- ============================================
-- Follow-ups Indexes
-- ============================================

-- Composite index for user + due date (upcoming follow-ups)
CREATE INDEX idx_followups_user_date ON follow_ups(user_id, due_date);

-- Composite index for user + completed status
CREATE INDEX idx_followups_user_completed ON follow_ups(user_id, completed);

-- Index for overdue follow-ups
CREATE INDEX idx_followups_overdue ON follow_ups(user_id, due_date) WHERE completed = FALSE AND due_date < NOW();

-- Index for AI-suggested follow-ups
CREATE INDEX idx_followups_ai_suggested ON follow_ups(user_id) WHERE ai_suggested = TRUE AND completed = FALSE;

-- Composite index for contact + due date
CREATE INDEX idx_followups_contact_date ON follow_ups(contact_id, due_date) WHERE contact_id IS NOT NULL;

-- ============================================
-- Tags Indexes
-- ============================================

-- Index for user tag lookups
CREATE INDEX idx_tags_user ON tags(user_id);

-- Index for parent-child tag relationships
CREATE INDEX idx_tags_parent ON tags(parent_id) WHERE parent_id IS NOT NULL;

-- Index for hierarchical tag queries
CREATE INDEX idx_tags_user_parent ON tags(user_id, parent_id);

-- ============================================
-- Contact Tags Indexes
-- ============================================

-- Index for tag lookups (reverse direction)
CREATE INDEX idx_contact_tags_tag ON contact_tags(tag_id);

-- Composite index for contact tag queries
CREATE INDEX idx_contact_tags_contact_created ON contact_tags(contact_id, created_at);

-- ============================================
-- Opportunities Indexes
-- ============================================

-- Index for user lookups
CREATE INDEX idx_opportunities_user ON opportunities(user_id);

-- Index for stage filtering
CREATE INDEX idx_opportunities_stage ON opportunities(stage);

-- Composite index for user + stage (pipeline views)
CREATE INDEX idx_opportunities_user_stage ON opportunities(user_id, stage);

-- Index for expected close date (forecasting)
CREATE INDEX idx_opportunities_expected_close ON opportunities(expected_close) WHERE stage NOT IN ('closed_won', 'closed_lost');

-- Index for AI-detected opportunities
CREATE INDEX idx_opportunities_ai_detected ON opportunities(user_id) WHERE ai_detected = TRUE;

-- Composite index for value sorting
CREATE INDEX idx_opportunities_user_value ON opportunities(user_id, value DESC NULLS LAST);

-- ============================================
-- Opportunity Contacts Indexes
-- ============================================

-- Index for contact lookups (reverse direction)
CREATE INDEX idx_opportunity_contacts_contact ON opportunity_contacts(contact_id);

-- Index for role filtering
CREATE INDEX idx_opportunity_contacts_role ON opportunity_contacts(role);

-- ============================================
-- Profiles Indexes
-- ============================================

-- Index on email for lookups
CREATE INDEX idx_profiles_email ON profiles(email);

-- Index on role for admin queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- Additional Performance Optimizations
-- ============================================

-- Partial index for contacts with low health score (at-risk contacts)
CREATE INDEX idx_contacts_at_risk ON contacts(user_id, health_score) WHERE health_score < 30 AND deleted_at IS NULL;

-- Partial index for contacts needing follow-up (no interaction in 30 days)
CREATE INDEX idx_contacts_needing_followup ON contacts(user_id, last_interaction)
WHERE (last_interaction < NOW() - INTERVAL '30 days' OR last_interaction IS NULL)
AND deleted_at IS NULL;

-- Comments for documentation
COMMENT ON INDEX idx_contacts_user_id IS 'Fast lookup of active contacts by user';
COMMENT ON INDEX idx_contacts_user_health_desc IS 'Dashboard health score sorting';
COMMENT ON INDEX idx_interactions_user_date IS 'Recent interactions query optimization';
COMMENT ON INDEX idx_followups_overdue IS 'Overdue follow-ups query optimization';
COMMENT ON INDEX idx_opportunities_user_stage IS 'Pipeline view optimization';
