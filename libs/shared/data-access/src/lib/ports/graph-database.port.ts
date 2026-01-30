/**
 * Graph Database Port (Oxigraph)
 *
 * Port interface for graph database operations using RDF/SPARQL.
 * Implementation: OxigraphAdapter for network relationship analysis.
 *
 * @module @weople/shared/data-access
 * @see {@link docs/specs/sds.md} Section 3.2.6, Section 7
 * @see {@link docs/specs/adr.md} ADR-012, ADR-016
 */

/**
 * Result of a path finding operation
 */
export interface PathResult {
  /** Array of node IDs representing the path */
  path: string[];
  /** Length of the path in hops */
  length: number;
  /** Relationship strength along the path (0.0 - 1.0) */
  strength: number;
}

/**
 * Neighbor node information
 */
export interface Neighbor {
  /** Contact ID */
  id: string;
  /** Contact name */
  name: string;
  /** Type of relationship */
  relationship: string;
  /** Relationship strength (0.0 - 1.0) */
  strength: number;
}

/**
 * Community/cluster in the network graph
 */
export interface Community {
  /** Community identifier */
  id: string;
  /** Array of member contact IDs */
  members: string[];
  /** Number of members in the community */
  memberCount: number;
}

/**
 * Contact data for graph synchronization
 *
 * Note: PII (email, phone, etc.) is intentionally excluded from graph storage.
 * The graph database is used for relationship analysis only; sensitive data
 * remains in the primary database (Supabase).
 */
export interface GraphContact {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  job_title?: string;
}

/**
 * Relationship data for graph synchronization
 */
export interface GraphRelationship {
  from_contact_id: string;
  to_contact_id: string;
  type: 'knows' | 'worksWith' | 'introductionVia' | 'collaboratedOn';
  strength: number;
  metadata?: Record<string, unknown>;
}

/**
 * Graph Database Port interface
 *
 * Defines the contract for graph database operations using RDF triples
 * and SPARQL queries. Used for network analysis and relationship mapping.
 *
 * @example
 * ```typescript
 * const graph: GraphDatabasePort = new OxigraphAdapter(config);
 * await graph.connect();
 * const path = await graph.findPath('contact-1', 'contact-2', 3);
 * ```
 */
export interface GraphDatabasePort {
  /**
   * Establish connection to the graph database
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void>;

  /**
   * Close connection to the graph database
   * @returns Promise that resolves when disconnected
   */
  disconnect(): Promise<void>;

  /**
   * Add an RDF triple to the graph
   * @param subject - Subject URI
   * @param predicate - Predicate URI
   * @param object - Object URI or literal
   * @returns Promise that resolves when triple is added
   */
  addTriple(subject: string, predicate: string, object: string): Promise<void>;

  /**
   * Remove an RDF triple from the graph
   * @param subject - Subject URI
   * @param predicate - Predicate URI
   * @param object - Object URI or literal
   * @returns Promise that resolves when triple is removed
   */
  removeTriple(
    subject: string,
    predicate: string,
    object: string,
  ): Promise<void>;

  /**
   * Execute a SPARQL query
   *
   * **Security Warning:** Do not construct queries by concatenating or
   * interpolating untrusted input; sanitize or escape values first.
   * Consider implementing parameterized queries in the future.
   *
   * @typeParam T - Expected result type
   * @param sparqlQuery - SPARQL query string
   * @returns Promise resolving to query results
   */
  query<T>(sparqlQuery: string): Promise<T[]>;

  /**
   * Find the shortest path between two nodes
   * @param startNode - Starting node ID
   * @param endNode - Target node ID
   * @param maxDepth - Maximum path depth to search
   * @returns Promise resolving to path result or null if no path exists
   */
  findPath(
    startNode: string,
    endNode: string,
    maxDepth: number,
  ): Promise<PathResult | null>;

  /**
   * Get neighbors of a node
   * @param node - Node ID to get neighbors for
   * @param relationshipTypes - Optional filter by relationship types
   * @returns Promise resolving to array of neighbors
   */
  getNeighbors(node: string, relationshipTypes?: string[]): Promise<Neighbor[]>;

  /**
   * Calculate centrality score for a node
   * @param node - Node ID
   * @returns Promise resolving to centrality score (0.0 - 1.0)
   */
  calculateCentrality(node: string): Promise<number>;

  /**
   * Find communities/clusters in the network
   * @param userId - User ID to scope the search
   * @returns Promise resolving to array of communities
   */
  findCommunities(userId: string): Promise<Community[]>;

  /**
   * Sync a contact to the graph database
   * @param contact - Contact data to sync
   * @returns Promise that resolves when sync is complete
   */
  syncContact(contact: GraphContact): Promise<void>;

  /**
   * Sync a relationship to the graph database
   * @param relationship - Relationship data to sync
   * @returns Promise that resolves when sync is complete
   */
  syncRelationship(relationship: GraphRelationship): Promise<void>;
}

/**
 * Configuration for Oxigraph adapter
 */
export interface OxigraphConfig {
  /** Oxigraph endpoint URL */
  endpoint: string;
  /** Optional authentication token */
  authToken?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Default graph name */
  defaultGraph?: string;
}

/**
 * Introduction path result with intermediate contacts
 */
export interface IntroductionPath {
  /** Intermediate contact IDs for the introduction chain */
  intermediate: string[];
  /** Total relationship strength along the path */
  totalStrength: number;
  /** Number of hops in the path */
  pathLength: number;
}

/**
 * Network metrics for a contact
 */
export interface NetworkMetrics {
  /** Number of direct connections */
  directConnections: number;
  /** Total network size (including 2nd degree) */
  networkSize: number;
  /** Average relationship strength */
  avgRelationshipStrength: number;
}
