/**
 * AI Gateway Port
 *
 * Port interface for AI/LLM operations via LiteLLM gateway.
 * Implementation: LiteLLMAdapter for multi-provider AI routing.
 *
 * @module @weople/shared/data-access
 * @see {@link docs/specs/sds.md} Section 3.2.6, Section 6
 * @see {@link docs/specs/adr.md} ADR-011, ADR-012
 */

/**
 * Message in a completion request
 */
export interface CompletionMessage {
  /** Message role: system, user, assistant, or tool */
  role: 'system' | 'user' | 'assistant' | 'tool';
  /** Message content */
  content: string;
  /** Optional name for the message sender */
  name?: string;
  /** Tool call ID (required when role === 'tool') */
  tool_call_id?: string;
  /** Tool calls (for assistant messages) */
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * Completion request parameters
 */
export interface CompletionRequest {
  /** Model identifier (e.g., 'gpt-4o-mini', 'ollama/llama3.2') */
  model: string;
  /** Array of messages for the conversation */
  messages: CompletionMessage[];
  /** Sampling temperature (0.0 - 2.0) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Top-p sampling parameter */
  topP?: number;
  /** Stop sequences */
  stop?: string[];
  /** Whether to stream the response */
  stream?: boolean;
  /** JSON schema for structured output */
  responseFormat?: {
    type: 'json_object' | 'json_schema';
    schema?: Record<string, unknown>;
  };
  /** Tool definitions for function calling */
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters: Record<string, unknown>;
    };
  }>;
  /** Force the model to use a specific tool */
  toolChoice?:
    | 'none'
    | 'auto'
    | { type: 'function'; function: { name: string } };
}

/**
 * Token usage information
 */
export interface TokenUsage {
  /** Tokens in the prompt */
  promptTokens: number;
  /** Tokens in the completion */
  completionTokens: number;
  /** Total tokens used */
  totalTokens: number;
}

/**
 * Completion response
 */
export interface CompletionResponse {
  /** Generated content */
  content: string;
  /** Model used for generation */
  model: string;
  /** Token usage statistics */
  usage: TokenUsage;
  /** Cost in USD */
  cost: number;
  /** Finish reason: stop, length, content_filter, or tool_calls */
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  /** Tool calls requested by the model */
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * Embedding request parameters
 */
export interface EmbeddingRequest {
  /** Model identifier (e.g., 'text-embedding-3-small') */
  model: string;
  /** Input text to embed */
  input: string;
  /** Optional user identifier for tracking */
  user?: string;
}

/**
 * Batch embedding request parameters
 */
export interface BatchEmbeddingRequest {
  /** Model identifier */
  model: string;
  /** Array of input texts to embed */
  inputs: string[];
  /** Optional user identifier for tracking */
  user?: string;
}

/**
 * Embedding response
 */
export interface EmbeddingResponse {
  /** Embedding vector */
  embedding: number[];
  /** Model used for embedding */
  model: string;
  /** Token usage statistics */
  usage: TokenUsage;
  /** Cost in USD */
  cost: number;
}

/**
 * Batch embedding response
 */
export interface BatchEmbeddingResponse {
  /** Array of embedding vectors */
  embeddings: Array<{
    index: number;
    embedding: number[];
  }>;
  /** Model used for embedding */
  model: string;
  /** Token usage statistics */
  usage: TokenUsage;
  /** Cost in USD */
  cost: number;
}

/**
 * Budget status information
 */
export interface BudgetStatus {
  /** Amount used in current period (USD) */
  used: number;
  /** Budget limit (USD) */
  limit: number;
  /** Remaining budget (USD) */
  remaining: number;
  /** Percentage used (0.0 - 1.0) */
  percentUsed: number;
  /** Whether the budget has been exceeded */
  exceeded: boolean;
  /** Reset date for the budget period */
  resetDate?: Date;
}

/**
 * Model information
 */
export interface ModelInfo {
  /** Model identifier */
  id: string;
  /** Display name */
  name: string;
  /** Provider (openai, ollama, etc.) */
  provider: string;
  /** Maximum context length */
  maxTokens: number;
  /** Whether the model supports function calling */
  supportsTools: boolean;
  /** Whether the model supports JSON mode */
  supportsJson: boolean;
  /** Cost per 1K input tokens (USD) */
  inputCostPer1K: number;
  /** Cost per 1K output tokens (USD) */
  outputCostPer1K: number;
}

/**
 * Health status of the AI gateway
 */
export interface HealthStatus {
  /** Whether the gateway is healthy */
  healthy: boolean;
  /** Status of individual providers */
  providers: Array<{
    name: string;
    healthy: boolean;
    latency: number;
    message?: string;
  }>;
  /** Timestamp of the health check */
  checkedAt: Date;
}

/**
 * AI Gateway Port interface
 *
 * Defines the contract for AI/LLM operations through the LiteLLM gateway.
 * Supports multiple providers with fallback and cost tracking.
 *
 * @example
 * ```typescript
 * const ai: AIGatewayPort = new LiteLLMAdapter(config);
 * await ai.configure({ privacyLevel: 'balanced' });
 * const response = await ai.completion({
 *   model: 'enrichment-model',
 *   messages: [{ role: 'user', content: 'Analyze this contact...' }]
 * });
 * ```
 */
export interface AIGatewayPort {
  /**
   * Configure the AI gateway
   * @param config - Configuration object
   * @returns Promise that resolves when configuration is complete
   */
  configure(config: AIGatewayConfig): Promise<void>;

  /**
   * Generate a text completion
   * @param request - Completion request parameters
   * @returns Promise resolving to completion response
   */
  completion(request: CompletionRequest): Promise<CompletionResponse>;

  /**
   * Generate a streaming completion
   * @param request - Completion request parameters (with stream: true)
   * @returns Async iterable of completion chunks
   */
  completionStream(request: CompletionRequest): AsyncIterable<CompletionChunk>;

  /**
   * Generate an embedding for text
   * @param request - Embedding request parameters
   * @returns Promise resolving to embedding response
   */
  embedding(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  /**
   * Generate embeddings for multiple texts
   * @param request - Batch embedding request parameters
   * @returns Promise resolving to batch embedding response
   */
  embeddingBatch(
    request: BatchEmbeddingRequest,
  ): Promise<BatchEmbeddingResponse>;

  /**
   * Get current budget status
   * @returns Promise resolving to budget status
   */
  getBudgetStatus(): Promise<BudgetStatus>;

  /**
   * Check if a request would exceed the budget
   * @param estimatedCost - Estimated cost of the request (USD)
   * @returns Promise resolving to boolean
   */
  wouldExceedBudget(estimatedCost: number): Promise<boolean>;

  /**
   * Perform a health check on the gateway and providers
   * @returns Promise resolving to health status
   */
  healthCheck(): Promise<HealthStatus>;

  /**
   * Get list of available models
   * @returns Promise resolving to array of model information
   */
  listModels(): Promise<ModelInfo[]>;

  /**
   * Track a custom cost (for logging/analytics)
   * @param cost - Cost amount in USD
   * @param metadata - Additional metadata about the cost
   * @returns Promise that resolves when tracking is complete
   */
  trackCost(cost: number, metadata?: Record<string, unknown>): Promise<void>;
}

/**
 * Configuration for the AI gateway
 */
export interface AIGatewayConfig {
  /** Privacy level determining model selection */
  privacyLevel?: 'strict' | 'balanced' | 'permissive';
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Monthly budget in USD per user */
  budgetPerUser?: number;
  /** Model routing configuration */
  models?: {
    enrichment?: ModelRoutingConfig;
    sentiment?: ModelRoutingConfig;
    reasoning?: ModelRoutingConfig;
    embeddings?: ModelRoutingConfig;
  };
  /** LiteLLM proxy endpoint URL */
  endpoint?: string;
  /** API key for the gateway */
  apiKey?: string;
}

/**
 * Model routing configuration
 */
export interface ModelRoutingConfig {
  /** Primary model to use */
  primary: string;
  /** Fallback models in order of preference */
  fallback?: string[];
  /** Cloud fallback for local/self-hosted models */
  cloud?: string;
}

/**
 * Streaming completion chunk
 */
export interface CompletionChunk {
  /** Chunk content (may be partial) */
  content: string;
  /** Whether this is the final chunk */
  done: boolean;
  /** Usage statistics (only present in final chunk) */
  usage?: TokenUsage;
  /** Finish reason indicating why the stream ended (e.g., 'tool_calls') */
  finishReason: string | null;
  /** Partial/accumulated tool call data across chunks */
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * LiteLLM-specific configuration
 */
export interface LiteLLMConfig {
  /** LiteLLM proxy endpoint URL */
  endpoint: string;
  /** API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}
