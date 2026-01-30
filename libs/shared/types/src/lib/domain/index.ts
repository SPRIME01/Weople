/**
 * Domain Types
 *
 * Specialized types for domain-specific logic and operations.
 */

// Health scoring
export type {
  HealthCalculationConfig,
  HealthCalculationInput,
  HealthCategory,
  HealthFactor,
  HealthMetrics,
  HealthScore,
  HealthScoreHistory,
  HealthThresholds,
  HealthTrend,
} from './health.types';

// AI-related
export type {
  AIBudgetStatus,
  AIEnrichmentField,
  AIEnrichmentResult,
  AIFollowUpSuggestion,
  AIGatewayRequest,
  AIGatewayResponse,
  AIInsight,
  AIInsightsResult,
  AIModelConfig,
  AIPrivacyLevel,
  DuplicateDetectionResult,
  EmbeddingResult,
  SentimentLabel,
  SentimentResult,
} from './ai.types';
