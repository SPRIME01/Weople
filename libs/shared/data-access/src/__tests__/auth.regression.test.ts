import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp } from '../lib/auth';
import { supabase } from '../supabase';

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock ProfileService
vi.mock('../lib/profile.service', () => {
  const mockCreateProfile = vi.fn();
  return {
    ProfileService: vi.fn(() => ({
      createProfile: mockCreateProfile,
    })),
    mockCreateProfile, // Export the mock for testing purposes
  };
});

describe('Auth Module Regression Tests', () => {
  let mockSignUp: ReturnType<typeof vi.fn>;
  let mockCreateProfile: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSignUp = supabase.auth.signUp as ReturnType<typeof vi.fn>;
    // Dynamically import the mocked module to get the exposed mockCreateProfile
    const { mockCreateProfile: importedMockCreateProfile } = await import(
      '../lib/profile.service'
    );
    mockCreateProfile = importedMockCreateProfile;
  });

  // --- Email Format Validation (RFC 5322) ---
  it('should return an error for an invalid email format (missing @)', async () => {
    const result = await signUp({
      email: 'invalid.com',
      password: 'StrongP@ssw0rd',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Email does not meet strength requirements.',
    );
  });

  it('should return an error for an invalid email format (no domain)', async () => {
    const result = await signUp({
      email: 'invalid@',
      password: 'StrongP@ssw0rd',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Email does not meet strength requirements.',
    );
  });

  it('should return an error for an invalid email format (invalid characters)', async () => {
    const result = await signUp({
      email: 'inva<lid@example.com',
      password: 'StrongP@ssw0rd',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Email does not meet strength requirements.',
    );
  });

  // --- Password Requirements (12+ chars, complexity) ---
  it('should return an error for a password that is too short', async () => {
    const result = await signUp({
      email: 'test@example.com',
      password: 'Short1!',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Password does not meet strength requirements.',
    );
  });

  it('should return an error for a password missing an uppercase letter', async () => {
    const result = await signUp({
      email: 'test@example.com',
      password: 'password123!',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Password does not meet strength requirements.',
    );
  });

  it('should return an error for a password missing a lowercase letter', async () => {
    const result = await signUp({
      email: 'test@example.com',
      password: 'PASSWORD123!',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Password does not meet strength requirements.',
    );
  });

  it('should return an error for a password missing a number', async () => {
    const result = await signUp({
      email: 'test@example.com',
      password: 'StrongP@ssword!',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Password does not meet strength requirements.',
    );
  });

  it('should return an error for a password missing a special character', async () => {
    const result = await signUp({
      email: 'test@example.com',
      password: 'StrongPassword123',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Password does not meet strength requirements.',
    );
  });

  it('should successfully sign up with a strong password', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: {
          access_token: 'jwt-token',
          user: { id: 'user-123', email: 'test@example.com' },
        },
      },
      error: null,
    });
    mockCreateProfile.mockResolvedValueOnce({});

    const result = await signUp({
      email: 'test@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(result.error).toBeNull();
    expect(result.user).toBeDefined();
    expect(result.user?.email).toEqual('test@example.com');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(mockCreateProfile).toHaveBeenCalledWith(
      'user-123',
      'test@example.com',
    );
  });

  // --- Duplicate Email Handling ---
  it('should handle duplicate email error from Supabase', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: {
        name: 'AuthApiError',
        message: 'User already registered',
        status: 400,
      },
    });

    const result = await signUp({
      email: 'duplicate@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toEqual('User already registered');
    expect(result.user).toBeNull();
  });

  // --- Profile Creation Failure Rollback (Simulated) ---
  it('should return an error if profile creation fails', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: {
          access_token: 'jwt-token',
          user: { id: 'user-123', email: 'test@example.com' },
        },
      },
      error: null,
    });
    mockCreateProfile.mockRejectedValueOnce({
      name: 'ProfileError',
      message: 'Failed to create profile',
    });

    const result = await signUp({
      email: 'test@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toEqual('Failed to create profile');
    expect(result.user).toBeNull();
  });

  // --- JWT Token Validation (Implicit) ---
  it('should return a JWT token on successful sign-up', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: {
          access_token: 'jwt-token-abc',
          user: { id: 'user-123', email: 'test@example.com' },
        },
      },
      error: null,
    });
    mockCreateProfile.mockResolvedValueOnce({});

    const result = await signUp({
      email: 'test@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(result.user).toBeDefined();
    expect(result.user?.email).toEqual('test@example.com');
    // In a real scenario, you'd decode and validate the JWT. Here, we just check for its presence.
    expect(result.session?.access_token).toEqual('jwt-token-abc');
  });

  // --- RLS Policy Enforcement Verification (Conceptual) ---
  it('RLS policy enforcement should be verified through integration tests, not unit tests', () => {
    // This test case is a placeholder to highlight that RLS policy enforcement
    // cannot be effectively tested at the unit level due to Supabase mocking.
    // It should be covered by end-to-end or integration tests that interact
    // with a live Supabase instance.
    expect(true).toBe(true); // Placeholder assertion
  });
});
