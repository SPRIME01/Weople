/**
 * Relational Database Port
 *
 * Port interface for relational database operations following the Adapter pattern.
 * Implementations: PostgreSQLAdapter, SQLiteAdapter, etc.
 *
 * @module @weople/shared/data-access
 * @see {@link docs/specs/sds.md} Section 3.2.6
 * @see {@link docs/specs/adr.md} ADR-012
 */

/**
 * Filter options for database queries
 */
export interface FilterOptions {
  /** Where clause conditions as key-value pairs */
  where?: Record<string, unknown>;
  /** Ordering configuration */
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  /** Maximum number of results to return */
  limit?: number;
  /** Number of results to skip (for pagination) */
  offset?: number;
}

/**
 * Transaction handle for database operations
 */
export interface Transaction {
  /**
   * Commit the transaction
   * @returns Promise that resolves when commit is complete
   */
  commit(): Promise<void>;

  /**
   * Rollback the transaction
   * @returns Promise that resolves when rollback is complete
   */
  rollback(): Promise<void>;
}

/**
 * Subscription handle for realtime updates
 */
export interface Subscription {
  /**
   * Unsubscribe from realtime updates
   */
  unsubscribe(): void;
}

/**
 * Relational Database Port interface
 *
 * Defines the contract for relational database operations.
 * All implementations must adhere to this interface for swappable backends.
 *
 * @example
 * ```typescript
 * const db: RelationalDatabasePort = new PostgreSQLAdapter(config);
 * await db.connect();
 * const user = await db.findOne<User>('users', '123');
 * ```
 */
export interface RelationalDatabasePort {
  /**
   * Establish connection to the database
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void>;

  /**
   * Close connection to the database
   * @returns Promise that resolves when disconnected
   */
  disconnect(): Promise<void>;

  /**
   * Find a single record by ID
   * @typeParam T - Type of the entity
   * @param table - Table name
   * @param id - Record ID
   * @returns Promise resolving to the entity or null if not found
   */
  findOne<T>(table: string, id: string): Promise<T | null>;

  /**
   * Find multiple records matching filter criteria
   * @typeParam T - Type of the entity
   * @param table - Table name
   * @param filters - Filter options for the query
   * @returns Promise resolving to array of matching entities
   */
  findMany<T>(table: string, filters: FilterOptions): Promise<T[]>;

  /**
   * Insert a new record
   * @typeParam T - Type of the entity
   * @param table - Table name
   * @param data - Partial entity data to insert
   * @returns Promise resolving to the created entity
   */
  insert<T>(table: string, data: Partial<T>): Promise<T>;

  /**
   * Update an existing record
   * @typeParam T - Type of the entity
   * @param table - Table name
   * @param id - Record ID
   * @param data - Partial entity data to update
   * @returns Promise resolving to the updated entity
   */
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a record
   * @param table - Table name
   * @param id - Record ID
   * @param soft - If true, perform soft delete (default: false)
   * @returns Promise that resolves when deletion is complete
   */
  delete(table: string, id: string, soft?: boolean): Promise<void>;

  /**
   * Execute operations within a transaction
   * @typeParam T - Return type of the transaction callback
   * @param callback - Function that receives a transaction handle
   * @returns Promise resolving to the result of the callback
   */
  transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;

  /**
   * Subscribe to realtime changes on a table
   * @typeParam T - Type of the change payload
   * @param table - Table name to subscribe to
   * @param filters - Filter options for the subscription
   * @param callback - Function called when changes occur
   * @returns Subscription handle for unsubscribing
   */
  subscribe<T>(
    table: string,
    filters: FilterOptions,
    callback: (payload: T) => void,
  ): Subscription;
}

/**
 * Database adapter configuration
 */
export interface DatabaseAdapterConfig {
  /** Database type identifier */
  type: 'postgresql' | 'sqlite' | 'mysql';
  /** Connection configuration */
  connection: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    url?: string;
  };
  /** Optional adapter-specific options */
  options?: {
    poolSize?: number;
    ssl?: boolean;
    timeout?: number;
  };
}

/**
 * Adapter options for database connections
 */
export interface AdapterOptions {
  /** Connection pool size */
  poolSize?: number;
  /** Enable SSL connection */
  ssl?: boolean;
  /** Query timeout in milliseconds */
  timeout?: number;
  /** Enable query logging */
  logging?: boolean;
}
