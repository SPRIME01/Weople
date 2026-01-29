let createSupabaseClient: any;
let detectEnvironment: any;
let getSupabaseConfig: any;

describe('Supabase Configuration', () => {
  beforeEach(async () => {
    // Save originals and mock environment variables before importing the module
    const g = globalThis as unknown as {
      __original__WebAssembly?: unknown;
      __original__Request?: unknown;
      __original__Response?: unknown;
      WebAssembly?: unknown;
      Request?: unknown;
      Response?: unknown;
    };
    g.__original__WebAssembly = g.WebAssembly;
    g.__original__Request = g.Request;
    g.__original__Response = g.Response;
    delete g.WebAssembly;
    delete g.Request;
    delete g.Response;

    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    process.env['NODE_ENV'] = 'test';

    const mod = await import('.');
    createSupabaseClient = mod.createSupabaseClient;
    detectEnvironment = mod.detectEnvironment;
    getSupabaseConfig = mod.getSupabaseConfig;
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env['SUPABASE_URL'];
    delete process.env['SUPABASE_ANON_KEY'];
    delete process.env['NODE_ENV'];

    // Restore globals if they were set
    const g = globalThis as any;
    if (typeof g.__original__WebAssembly !== 'undefined')
      g.WebAssembly = g.__original__WebAssembly;
    if (typeof g.__original__Request !== 'undefined')
      g.Request = g.__original__Request;
    if (typeof g.__original__Response !== 'undefined')
      g.Response = g.__original__Response;
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env['SUPABASE_URL'];
    delete process.env['SUPABASE_ANON_KEY'];
    delete process.env['NODE_ENV'];

    // Clear module cache to ensure fresh import in next test
    Object.keys(require.cache || {}).forEach((key) => {
      if (key.includes('/libs/shared/data-access/src/lib/supabase')) {
        delete require.cache[key];
      }
    });
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
