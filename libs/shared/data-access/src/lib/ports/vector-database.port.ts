/**
 * Vector Database Port
 *
 * Port interface for vector database operations (semantic search).
 * Implementation: QdrantAdapter for vector storage and similarity search.
 *
 * @module @weople/shared/data-access
 * @see {@link docs/specs/sds.md} Section 3.2.6, Section 6.4
 * @see {@link docs/specs/adr.md} ADR-012
 */

/**
 * Search result from vector similarity search
 */
export interface SearchResult {
  /** Vector/record ID */
  id: string;
  /** Similarity score (0.0 - 1.0, higher is better) */
  score: number;
  /** Associated metadata */
  metadata: Record<string, unknown>;
  /** Optional vector data (if requested) */
  vector?: number[];
}

/**
 * Filter options for vector search
 */
export interface VectorFilterOptions {
  /** Must match conditions */
  must?: Array<{
    key: string;
    match: { value: string | number | boolean };
  }>;
  /** Should match conditions (at least one) */
  should?: Array<{
    key: string;
    match: { value: string | number | boolean };
  }>;
  /** Must not match conditions */
  mustNot?: Array<{
    key: string;
    match: { value: string | number | boolean };
  }>;
}

/**
 * Vector record for upsert operations
 */
export interface VectorRecord {
  /** Record ID */
  id: string;
  /** Vector embedding */
  vector: number[];
  /** Associated metadata */
  metadata: Record<string, unknown>;
}

/**
 * Collection configuration
 */
export interface CollectionConfig {
  /** Vector dimension size */
  dimension: number;
  /** Distance metric: Cosine, Euclidean, or Dot */
  distance?: 'Cosine' | 'Euclidean' | 'Dot';
  /** HNSW index configuration */
  hnswConfig?: {
    /** Maximum number of edges per node */
    m?: number;
    /** Size of the dynamic candidate list */
    efConstruct?: number;
    /** Search time candidate list size */
    ef?: number;
  };
}

/**
 * Vector Database Port interface
 *
 * Defines the contract for vector database operations.
 * Used for semantic similarity search and embeddings storage.
 *
 * @example
 * ```typescript
 * const vectorDB: VectorDatabasePort = new QdrantAdapter(config);
 * await vectorDB.connect();
 * await vectorDB.createCollection('contacts', 384);
 * await vectorDB.upsert('contacts', 'contact-1', embedding, { name: 'John' });
 * ```
 */
export interface VectorDatabasePort {
  /**
   * Establish connection to the vector database
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void>;

  /**
   * Close connection to the vector database
   * @returns Promise that resolves when disconnected
   */
  disconnect(): Promise<void>;

  /**
   * Create a new collection
   * @param name - Collection name
   * @param config - Collection configuration
   * @returns Promise that resolves when collection is created
   */
  createCollection(name: string, config: CollectionConfig): Promise<void>;

  /**
   * Create a new collection with simplified parameters
   * @param name - Collection name
   * @param dimension - Vector dimension
   * @returns Promise that resolves when collection is created
   */
  createCollection(name: string, dimension: number): Promise<void>;

  /**
   * Delete a collection
   * @param name - Collection name
   * @returns Promise that resolves when collection is deleted
   */
  deleteCollection(name: string): Promise<void>;

  /**
   * Upsert (insert or update) a vector record
   * @param collection - Collection name
   * @param id - Record ID
   * @param vector - Vector embedding
   * @param metadata - Associated metadata
   * @returns Promise that resolves when upsert is complete
   */
  upsert(
    collection: string,
    id: string,
    vector: number[],
    metadata: Record<string, unknown>,
  ): Promise<void>;

  /**
   * Batch upsert multiple vector records
   * @param collection - Collection name
   * @param records - Array of vector records
   * @returns Promise that resolves when batch upsert is complete
   */
  upsertBatch(collection: string, records: VectorRecord[]): Promise<void>;

  /**
   * Search for similar vectors
   * @param collection - Collection name
   * @param vector - Query vector
   * @param filters - Optional filter conditions
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise resolving to array of search results
   */
  search(
    collection: string,
    vector: number[],
    filters?: VectorFilterOptions,
    limit?: number,
  ): Promise<SearchResult[]>;

  /**
   * Delete a vector by ID
   * @param collection - Collection name
   * @param id - Record ID to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteVector(collection: string, id: string): Promise<void>;

  /**
   * Delete vectors matching filter criteria
   * @param collection - Collection name
   * @param filters - Filter conditions for deletion
   * @returns Promise that resolves when deletion is complete
   */
  deleteVectors(
    collection: string,
    filters: VectorFilterOptions,
  ): Promise<void>;

  /**
   * Get a vector by ID
   * @param collection - Collection name
   * @param id - Record ID
   * @returns Promise resolving to the vector record or null
   */
  getVector(collection: string, id: string): Promise<VectorRecord | null>;

  /**
   * Check if a collection exists
   * @param name - Collection name
   * @returns Promise resolving to boolean
   */
  collectionExists(name: string): Promise<boolean>;

  /**
   * Scroll through vector records with pagination
   * @param collection - Collection name
   * @param limit - Maximum number of results per page
   * @param offset - Pagination offset from previous result
   * @param filters - Optional filter conditions
   * @returns Promise resolving to scroll result with records and next offset
   */
  scroll(
    collection: string,
    limit?: number,
    offset?: string,
    filters?: VectorFilterOptions,
  ): Promise<ScrollResult>;
}

/**
 * Configuration for Qdrant adapter
 */
export interface QdrantConfig {
  /** Qdrant server URL */
  url: string;
  /** API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable HTTPS */
  https?: boolean;
}

/**
 * Scroll/filter result for batch retrieval
 */
export interface ScrollResult {
  /** Vector records */
  records: VectorRecord[];
  /** Next page offset (undefined if no more results) */
  nextOffset?: string;
}
