/**
 * Contact entity types
 *
 * Represents contacts in the CRM system.
 * Contacts are owned by users and can have tags, interactions, and opportunities.
 */

import { Tag } from './tag.types';

/**
 * Contact entity representing a person in the CRM
 */
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  metadata: Record<string, unknown>;
  vector_id?: string;
  health_score: number;
  last_interaction?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

/**
 * Input for creating a new contact
 */
export interface CreateContactInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating an existing contact
 */
export interface UpdateContactInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Contact with extended information for detail views
 */
export interface ContactWithDetails extends Contact {
  interaction_count?: number;
  last_interaction_type?: string;
  opportunity_count?: number;
  follow_up_count?: number;
}
