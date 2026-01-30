/**
 * Object Storage Port
 *
 * Port interface for object storage operations (S3-compatible).
 * Implementation: GarageAdapter for self-hosted S3-compatible storage.
 *
 * @module @weople/shared/data-access
 * @see {@link docs/specs/sds.md} Section 3.2.6
 * @see {@link docs/specs/adr.md} ADR-012, ADR-013
 */

/**
 * Result of an upload operation
 */
export interface UploadResult {
  /** Object key in the bucket */
  key: string;
  /** Public or presigned URL to access the object */
  url: string;
  /** ETag for the uploaded object */
  etag: string;
  /** Object version ID (if versioning is enabled) */
  versionId?: string;
}

/**
 * Metadata for stored objects
 */
export interface ObjectMetadata {
  /** MIME content type */
  contentType?: string;
  /** Content length in bytes */
  contentLength?: number;
  /** Content encoding (e.g., 'gzip') */
  contentEncoding?: string;
  /** Custom metadata key-value pairs */
  customMetadata?: Record<string, string>;
  /** Cache-Control header */
  cacheControl?: string;
  /** Content-Disposition header */
  contentDisposition?: string;
}

/**
 * Information about a stored object
 */
export interface ObjectInfo {
  /** Object key */
  key: string;
  /** Size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: Date;
  /** ETag */
  etag: string;
  /** Content type */
  contentType?: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
}

/**
 * List objects response
 */
export interface ListObjectsResponse {
  /** Array of object information */
  objects: ObjectInfo[];
  /** Continuation token for pagination */
  continuationToken?: string;
  /** Whether more results are available */
  isTruncated: boolean;
}

/**
 * Object Storage Port interface
 *
 * Defines the contract for S3-compatible object storage operations.
 * Used for file uploads, downloads, and asset management.
 *
 * @example
 * ```typescript
 * const storage: ObjectStoragePort = new GarageAdapter(config);
 * await storage.connect();
 * const result = await storage.upload('avatars', 'user-1.png', buffer, { contentType: 'image/png' });
 * ```
 */
export interface ObjectStoragePort {
  /**
   * Establish connection to the storage service
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void>;

  /**
   * Close connection to the storage service
   * @returns Promise that resolves when disconnected
   */
  disconnect(): Promise<void>;

  /**
   * Create a new bucket
   * @param name - Bucket name
   * @returns Promise that resolves when bucket is created
   */
  createBucket(name: string): Promise<void>;

  /**
   * Create a new bucket with region and options
   * @param name - Bucket name
   * @param options - Bucket creation options
   * @returns Promise that resolves when bucket is created
   */
  createBucket(name: string, options: BucketOptions): Promise<void>;

  /**
   * Delete a bucket (must be empty)
   * @param name - Bucket name
   * @returns Promise that resolves when bucket is deleted
   */
  deleteBucket(name: string): Promise<void>;

  /**
   * Upload an object to a bucket
   * @param bucket - Bucket name
   * @param key - Object key
   * @param data - Object data as Buffer or ReadableStream
   * @param metadata - Optional object metadata
   * @returns Promise resolving to upload result
   */
  upload(
    bucket: string,
    key: string,
    data: Buffer | ReadableStream<Uint8Array>,
    metadata?: ObjectMetadata,
  ): Promise<UploadResult>;

  /**
   * Download an object from a bucket
   * @param bucket - Bucket name
   * @param key - Object key
   * @returns Promise resolving to object data as Buffer
   */
  download(bucket: string, key: string): Promise<Buffer>;

  /**
   * Download an object as a stream
   * @param bucket - Bucket name
   * @param key - Object key
   * @returns Promise resolving to readable stream
   */
  downloadStream(
    bucket: string,
    key: string,
  ): Promise<ReadableStream<Uint8Array>>;

  /**
   * Delete an object from a bucket
   * @param bucket - Bucket name
   * @param key - Object key
   * @returns Promise that resolves when deletion is complete
   */
  delete(bucket: string, key: string): Promise<void>;

  /**
   * Delete multiple objects
   * @param bucket - Bucket name
   * @param keys - Array of object keys to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteMany(bucket: string, keys: string[]): Promise<void>;

  /**
   * Get a presigned URL for uploading
   * @param bucket - Bucket name
   * @param key - Object key
   * @param expiresIn - URL expiration time in seconds
   * @returns Promise resolving to presigned URL string
   */
  getPresignedUploadUrl(
    bucket: string,
    key: string,
    expiresIn: number,
  ): Promise<string>;

  /**
   * Get a presigned URL for uploading with content type restriction
   * @param bucket - Bucket name
   * @param key - Object key
   * @param expiresIn - URL expiration time in seconds
   * @param contentType - Allowed content type
   * @returns Promise resolving to presigned URL string
   */
  getPresignedUploadUrl(
    bucket: string,
    key: string,
    expiresIn: number,
    contentType: string,
  ): Promise<string>;

  /**
   * Get a presigned URL for downloading
   * @param bucket - Bucket name
   * @param key - Object key
   * @param expiresIn - URL expiration time in seconds
   * @returns Promise resolving to presigned URL string
   */
  getPresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresIn: number,
  ): Promise<string>;

  /**
   * List objects in a bucket
   * @param bucket - Bucket name
   * @param prefix - Optional key prefix filter
   * @returns Promise resolving to array of object info
   */
  list(bucket: string, prefix?: string): Promise<ObjectInfo[]>;

  /**
   * List objects with pagination
   * @param bucket - Bucket name
   * @param options - List options including prefix, limit, and continuation token
   * @returns Promise resolving to list response
   */
  list(bucket: string, options: ListOptions): Promise<ListObjectsResponse>;

  /**
   * Check if an object exists
   * @param bucket - Bucket name
   * @param key - Object key
   * @returns Promise resolving to boolean
   */
  exists(bucket: string, key: string): Promise<boolean>;

  /**
   * Get object metadata without downloading
   * @param bucket - Bucket name
   * @param key - Object key
   * @returns Promise resolving to object info or null
   */
  head(bucket: string, key: string): Promise<ObjectInfo | null>;

  /**
   * Copy an object within or between buckets
   * @param sourceBucket - Source bucket name
   * @param sourceKey - Source object key
   * @param destBucket - Destination bucket name
   * @param destKey - Destination object key
   * @returns Promise resolving to upload result
   */
  copy(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
  ): Promise<UploadResult>;
}

/**
 * Bucket creation options
 */
export interface BucketOptions {
  /** Bucket region */
  region?: string;
  /** Enable versioning */
  versioning?: boolean;
  /** Public access block configuration */
  publicAccessBlock?: {
    blockPublicAcls?: boolean;
    ignorePublicAcls?: boolean;
    blockPublicPolicy?: boolean;
    restrictPublicBuckets?: boolean;
  };
  /** CORS configuration */
  cors?: Array<{
    allowedHeaders?: string[];
    allowedMethods?: string[];
    allowedOrigins?: string[];
    exposeHeaders?: string[];
    maxAgeSeconds?: number;
  }>;
}

/**
 * List objects options
 */
export interface ListOptions {
  /** Key prefix filter */
  prefix?: string;
  /** Maximum number of results */
  limit?: number;
  /** Continuation token for pagination */
  continuationToken?: string;
  /** Delimiter for hierarchical listing */
  delimiter?: string;
}

/**
 * Configuration for Garage adapter
 */
export interface GarageConfig {
  /** Garage endpoint URL */
  endpoint: string;
  /** Access key ID */
  accessKey: string;
  /** Secret access key */
  secretKey: string;
  /** Region (default: 'garage') */
  region?: string;
  /** Force path-style URLs (default: true, required for Garage) */
  forcePathStyle?: boolean;
}

/**
 * Configuration for generic S3 adapter
 */
export interface S3Config {
  /** S3 endpoint URL */
  endpoint?: string;
  /** Access key ID */
  accessKey: string;
  /** Secret access key */
  secretKey: string;
  /** Region */
  region: string;
  /** Force path-style URLs */
  forcePathStyle?: boolean;
}
