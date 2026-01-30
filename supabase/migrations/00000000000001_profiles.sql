-- Migration: Profiles Table
-- Description: User profiles table extending auth.users
-- Dependencies: 00000000000000_initial_schema.sql
-- Created: 2026-01-30

-- profiles table
-- Extends auth.users with additional user profile information
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    preferences JSONB DEFAULT '{}',
    ai_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comments
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.id IS 'References auth.users.id (cascade delete)';
COMMENT ON COLUMN profiles.email IS 'User email address (unique, required)';
COMMENT ON COLUMN profiles.full_name IS 'User display name';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN profiles.role IS 'User role: user or admin';
COMMENT ON COLUMN profiles.preferences IS 'JSONB user preferences/settings';
COMMENT ON COLUMN profiles.ai_enabled IS 'Whether AI features are enabled for this user';
COMMENT ON COLUMN profiles.created_at IS 'Profile creation timestamp';

-- Create index on email for faster lookups
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create index on role for admin queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Trigger to sync email from auth.users on insert
CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.created_at, NOW())
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION app.handle_new_user();

-- Trigger to update email in profiles when auth.users email changes
CREATE OR REPLACE FUNCTION app.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.email IS DISTINCT FROM NEW.email THEN
        UPDATE profiles SET email = NEW.email WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION app.handle_user_email_update();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Insert profiles for existing users (if migrating existing data)
-- This is safe to run even on empty auth.users table
INSERT INTO profiles (id, email, full_name, avatar_url, created_at)
SELECT
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'avatar_url' as avatar_url,
    COALESCE(created_at, NOW()) as created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
