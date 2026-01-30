/**
 * Health Scoring Types
 *
 * Types for contact health scoring algorithm and metrics.
 * Health scores represent the strength of a professional relationship.
 */

/**
 * Health trend direction
 */
export type HealthTrend = 'improving' | 'stable' | 'declining';

/**
 * Health score range (0-100)
 */
export type HealthScore = number;

/**
 * Health factor contributing to overall score
 */
export interface HealthFactor {
  /** Name of the factor (e.g., 'recency', 'frequency', 'responsiveness') */
  name: string;
  /** Weight of this factor in the overall calculation (0-1) */
  weight: number;
  /** This factor's contribution to the score (-1 to 1, scaled by weight) */
  contribution: number;
  /** Raw score for this factor (0-100) */
  rawScore: number;
}

/**
 * Complete health metrics for a contact
 */
export interface HealthMetrics {
  /** Overall health score (0-100) */
  score: HealthScore;
  /** Trend direction based on recent activity */
  trend: HealthTrend;
  /** Individual factors contributing to the score */
  factors: HealthFactor[];
  /** Days since last interaction */
  daysSinceLastInteraction?: number;
  /** Number of interactions in last 90 days */
  recentInteractions?: number;
  /** Average response time in days (if applicable) */
  avgResponseTime?: number;
  /** Last calculated timestamp */
  calculatedAt: string;
}

/**
 * Health score history entry
 */
export interface HealthScoreHistory {
  date: string;
  score: HealthScore;
  trend: HealthTrend;
}

/**
 * Health score thresholds for categorization
 */
export interface HealthThresholds {
  excellent: number; // default 80
  good: number; // default 60
  atRisk: number; // default 40
  critical: number; // default 20
}

/**
 * Health score category derived from score
 */
export type HealthCategory =
  | 'excellent'
  | 'good'
  | 'at_risk'
  | 'critical'
  | 'inactive';

/**
 * Configuration for health score calculation
 */
export interface HealthCalculationConfig {
  /** Weights for different factors (must sum to 1) */
  weights: {
    recency: number;
    frequency: number;
    responsiveness: number;
    engagement: number;
  };
  /** Days before a relationship starts declining */
  decayDays: number;
  /** Days before a relationship is considered inactive */
  inactiveDays: number;
}

/**
 * Input for calculating health score
 */
export interface HealthCalculationInput {
  contactId: string;
  interactions: Array<{
    date: string;
    type: string;
    sentiment?: number;
  }>;
  followUps: Array<{
    completed: boolean;
    dueDate: string;
  }>;
  opportunities: Array<{
    stage: string;
    value?: number;
  }>;
}
