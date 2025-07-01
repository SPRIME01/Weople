import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp } from '../lib/auth';
import { supabase } from '../supabase';
import { ProfileService } from '../lib/profile.service';

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

describe('signUp', () => {
  let mockSignUp: ReturnType<typeof vi.fn>;
  let mockCreateProfile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp = supabase.auth.signUp as ReturnType<typeof vi.fn>;
    // Access the mocked createProfile directly from the mocked module
    mockCreateProfile = vi.mocked(new ProfileService()).createProfile;
  });

  it('should call Supabase auth.signUp with email and password', async () => {
    const email = 'test@example.com';
    const password = 'StrongP@ssw0rd123';

    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'user-id', email: email }, session: null },
      error: null,
    });

    await signUp({ email, password });
    expect(mockSignUp).toHaveBeenCalledWith({ email, password });
  });

  it('should create a profile record in the profiles table', async () => {
    const email = 'test@example.com';
    const password = 'StrongP@ssw0rd123';

    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'user-id', email: email }, session: null },
      error: null,
    });

    await signUp({ email, password });

    expect(mockCreateProfile).toHaveBeenCalledWith('user-id', email);
  });

  it('should return an AuthResult object on successful sign-up', async () => {
    const email = 'test@example.com';
    const password = 'StrongP@ssw0rd123';

    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: 'user-id', email: email },
        session: {
          access_token: 'jwt-token',
          user: { id: 'user-id', email: email },
        },
      },
      error: null,
    });
    mockCreateProfile.mockResolvedValueOnce({}); // Mock successful profile creation

    const result = await signUp({ email, password });

    expect(result.user?.id).toEqual('user-id');
    expect(result.user?.email).toEqual(email);
    expect(result.error).toBeNull();
  });

  it('should return an error for duplicate emails', async () => {
    const email = 'duplicate@example.com';
    const password = 'StrongP@ssw0rd123';

    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: {
        name: 'AuthApiError',
        message: 'User already registered',
        status: 400,
      },
    });

    const result = await signUp({ email, password });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('User already registered');
    expect(result.user).toBeNull();
  });

  it('should return an error for invalid passwords (handled by auth.ts)', async () => {
    const email = 'test@example.com';
    const password = 'short';

    const result = await signUp({ email, password });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      'Password does not meet strength requirements.',
    );
    expect(result.user).toBeNull();
  });
});
