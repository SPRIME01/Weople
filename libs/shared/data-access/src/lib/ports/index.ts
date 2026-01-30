/**
 * Ports (Adapter Pattern)
 *
 * Port interfaces for the Adapter pattern as defined in ADR-012.
 * These interfaces define contracts for external service integrations,
 * allowing for swappable implementations and improved testability.
 *
 * @module @weople/shared/data-access
 * @see {@link docs/specs/sds.md} Section 3.2.6
 * @see {@link docs/specs/adr.md} ADR-012
 *
 * @example
 * ```typescript
 * import {
 *   RelationalDatabasePort,
 *   GraphDatabasePort,
 *   VectorDatabasePort,
 *   ObjectStoragePort,
 *   AIGatewayPort
 * } from '@weople/shared/data-access';
 * ```
 */

// Relational Database Port
export type {
  AdapterOptions,
  DatabaseAdapterConfig,
  FilterOptions,
  RelationalDatabasePort,
  Subscription,
  Transaction,
} from './relational-database.port';

// Graph Database Port
export type {
  Community,
  GraphContact,
  GraphDatabasePort,
  GraphRelationship,
  IntroductionPath,
  Neighbor,
  NetworkMetrics,
  OxigraphConfig,
  PathResult,
} from './graph-database.port';

// Vector Database Port
export type {
  CollectionConfig,
  QdrantConfig,
  ScrollResult,
  SearchResult,
  VectorDatabasePort,
  VectorFilterOptions,
  VectorRecord,
} from './vector-database.port';

// Object Storage Port
export type {
  BucketOptions,
  GarageConfig,
  ListObjectsResponse,
  ListOptions,
  ObjectInfo,
  ObjectMetadata,
  ObjectStoragePort,
  S3Config,
  UploadResult,
} from './object-storage.port';

// AI Gateway Port
export type {
  AIGatewayConfig,
  AIGatewayPort,
  BatchEmbeddingRequest,
  BatchEmbeddingResponse,
  BudgetStatus,
  CompletionChunk,
  CompletionMessage,
  CompletionRequest,
  CompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  HealthStatus,
  LiteLLMConfig,
  ModelInfo,
  ModelRoutingConfig,
  TokenUsage,
} from './ai-gateway.port';
