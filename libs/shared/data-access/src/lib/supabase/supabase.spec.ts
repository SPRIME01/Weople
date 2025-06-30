import {
  createSupabaseClient,
  detectEnvironment,
  getSupabaseConfig,
} from './supabase';

describe('Supabase Configuration', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    process.env['NODE_ENV'] = 'test';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env['SUPABASE_URL'];
    delete process.env['SUPABASE_ANON_KEY'];
    delete process.env['NODE_ENV'];
  });

  describe('detectEnvironment', () => {
    it('should detect test environment', () => {
      const env = detectEnvironment();
      expect(env.isDevelopment).toBe(false);
      expect(env.isProduction).toBe(false);
      expect(env.isEdgeFunction).toBe(false);
      expect(env.platform).toBe('web');
    });
  });

  describe('getSupabaseConfig', () => {
    it('should get configuration from environment variables', () => {
      const config = getSupabaseConfig();
      expect(config.url).toBe('https://test.supabase.co');
      expect(config.anonKey).toBe('test-anon-key');
    });

    it('should throw error when missing required config', () => {
      delete process.env['SUPABASE_URL'];
      expect(() => getSupabaseConfig()).toThrow(
        'Missing Supabase configuration',
      );
    });
  });

  describe('createSupabaseClient', () => {
    it('should create client with valid configuration', () => {
      expect(() => createSupabaseClient()).not.toThrow();
    });
  });
});
