-- Migration: Initial Schema Setup
-- Description: Enable required extensions and set up base schema
-- Created: 2026-01-30

-- Enable UUID extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for gen_random_uuid() (preferred method)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pgvector extension for vector operations (AI embeddings)
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable unaccent for case-insensitive search with accents
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create schema for application
CREATE SCHEMA IF NOT EXISTS app;

-- Add comment for documentation
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions including secure UUID generation';
COMMENT ON EXTENSION "vector" IS 'Vector similarity search for AI embeddings (pgvector)';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy text search';
COMMENT ON EXTENSION "unaccent" IS 'Remove accents from text for search';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.update_updated_at_column() IS 'Automatically updates the updated_at column on row modifications';

-- Create function to set created_at if not provided
CREATE OR REPLACE FUNCTION app.set_created_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at IS NULL THEN
        NEW.created_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.set_created_at() IS 'Sets created_at timestamp if not provided';

-- Create function for soft delete
CREATE OR REPLACE FUNCTION app.soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Instead of actually deleting, just set the deleted_at timestamp
    EXECUTE format('UPDATE %I.%I SET deleted_at = NOW() WHERE id = $1',
                   TG_TABLE_SCHEMA, TG_TABLE_NAME)
    USING OLD.id;
    RETURN NULL; -- Prevents actual delete
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.soft_delete_record() IS 'Implements soft delete by setting deleted_at instead of hard delete';

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT USAGE ON SCHEMA app TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION app.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION app.set_created_at() TO authenticated;
GRANT EXECUTE ON FUNCTION app.soft_delete_record() TO authenticated;
