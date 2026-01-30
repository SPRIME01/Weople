/**
 * Interaction entity types
 *
 * Represents interactions between users and contacts.
 * Includes notes, sentiment analysis, and metadata.
 */

/**
 * Interaction type entity representing categories of interactions
 * Can be system-defined or user-defined
 */
export interface InteractionType {
  id: string;
  user_id?: string;
  name: string;
  icon: string;
  color: string;
  is_system: boolean;
  created_at: string;
}

/**
 * Interaction entity representing a single interaction event
 */
export interface Interaction {
  id: string;
  contact_id: string;
  user_id: string;
  type_id: string;
  interaction_date: string;
  notes?: string;
  sentiment_score?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  type?: InteractionType;
}

/**
 * Input for creating a new interaction
 */
export interface CreateInteractionInput {
  contact_id: string;
  type_id: string;
  interaction_date: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating an existing interaction
 */
export interface UpdateInteractionInput {
  type_id?: string;
  interaction_date?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interaction with contact information for list views
 */
export interface InteractionWithContact extends Interaction {
  contact?: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
}
