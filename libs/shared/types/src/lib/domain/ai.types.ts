/**
 * AI-Related Types
 *
 * Types for AI enrichment, sentiment analysis, and other AI-powered features.
 */

/**
 * AI enrichment result for a single field
 */
export interface AIEnrichmentField {
  /** The suggested value */
  value: string;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Result of AI contact enrichment
 */
export interface AIEnrichmentResult {
  job_title?: AIEnrichmentField;
  company?: AIEnrichmentField;
  industry?: AIEnrichmentField;
  bio?: AIEnrichmentField;
  location?: AIEnrichmentField;
  website?: AIEnrichmentField;
}

/**
 * Sentiment label categories
 */
export type SentimentLabel =
  | 'very_negative'
  | 'negative'
  | 'neutral'
  | 'positive'
  | 'very_positive';

/**
 * Sentiment analysis result
 */
export interface SentimentResult {
  /** Numerical score (-1 to 1) */
  score: number;
  /** Categorical label */
  label: SentimentLabel;
  /** Key topics mentioned */
  topics: string[];
  /** Suggested action items extracted from text */
  action_items: string[];
}

/**
 * AI follow-up suggestion
 */
export interface AIFollowUpSuggestion {
  /** Suggested timing (e.g., '3 days', '1 week') */
  timing: string;
  /** Reason for the suggestion */
  reason: string;
  /** Suggested follow-up title */
  title?: string;
  /** Priority level */
  priority?: 'low' | 'medium' | 'high';
}

/**
 * AI insight/recommendation
 */
export interface AIInsight {
  /** Type of insight */
  type: 'relationship' | 'opportunity' | 'action' | 'risk';
  /** Insight title */
  title: string;
  /** Detailed description */
  description: string;
  /** Related contact IDs */
  contactIds?: string[];
  /** Confidence in this insight (0-1) */
  confidence: number;
  /** Suggested actions */
  recommendations?: string[];
}

/**
 * AI-generated insights for a user
 */
export interface AIInsightsResult {
  /** Generated insights */
  insights: AIInsight[];
  /** High-level recommendations */
  recommendations: string[];
  /** Contacts at risk of becoming inactive */
  at_risk_contacts: string[];
  /** Detected opportunities */
  opportunities: string[];
  /** Timeframe used for analysis */
  timeframe: 'week' | 'month' | 'quarter';
  /** When insights were generated */
  generatedAt: string;
}

/**
 * Embedding vector result
 */
export interface EmbeddingResult {
  /** The embedding vector */
  embedding: number[];
  /** Model used for embedding */
  model: string;
  /** Dimension of the vector */
  dimension: number;
}

/**
 * AI model configuration
 */
export interface AIModelConfig {
  /** Model identifier */
  model: string;
  /** Temperature for generation (0-2) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Top-p sampling parameter */
  topP?: number;
  /** Presence penalty */
  presencePenalty?: number;
  /** Frequency penalty */
  frequencyPenalty?: number;
}

/**
 * Privacy level for AI processing
 */
export type AIPrivacyLevel = 'strict' | 'balanced' | 'permissive';

/**
 * AI gateway request
 */
export interface AIGatewayRequest {
  /** Task type */
  task: 'enrichment' | 'sentiment' | 'embedding' | 'completion' | 'insights';
  /** Input data */
  input: Record<string, unknown>;
  /** Privacy level preference */
  privacyLevel: AIPrivacyLevel;
  /** Model configuration (optional) */
  config?: AIModelConfig;
}

/**
 * AI gateway response
 */
export interface AIGatewayResponse {
  success: boolean;
  result: unknown;
  model: string;
  cost: number;
  latency: number;
  cached: boolean;
}

/**
 * AI budget status
 */
export interface AIBudgetStatus {
  /** Budget limit in USD */
  limit: number;
  /** Amount used in current period */
  used: number;
  /** Remaining budget */
  remaining: number;
  /** Period (monthly) */
  period: string;
  /** Whether budget is exceeded */
  exceeded: boolean;
  /** Alert threshold reached (0-1) */
  alertThreshold: number;
}

/**
 * Duplicate detection result
 */
export interface DuplicateDetectionResult {
  /** Potential duplicate contact IDs with similarity scores */
  matches: Array<{
    contactId: string;
    similarity: number;
    reasons: string[];
  }>;
  /** Confidence that this is a duplicate (0-1) */
  confidence: number;
}
