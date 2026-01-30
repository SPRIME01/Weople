/**
 * Opportunity entity types
 *
 * Represents business opportunities/pipeline deals.
 * Opportunities can involve multiple contacts with different roles.
 */

import { Contact } from './contact.types';

/**
 * Opportunity stage in the sales pipeline
 */
export type OpportunityStage =
  | 'prospecting'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

/**
 * Role of a contact in an opportunity
 */
export type OpportunityContactRole =
  | 'decision_maker'
  | 'influencer'
  | 'user'
  | 'champion'
  | 'blocker';

/**
 * Base opportunity entity properties
 */
export interface OpportunityBase {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  value?: number;
  currency: string;
  stage: OpportunityStage;
  probability?: number;
  expected_close?: string;
  actual_close?: string;
  outcome?: string;
  ai_detected: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Junction entity linking contacts to opportunities with roles
 */
export interface OpportunityContact {
  opportunity_id: string;
  contact_id: string;
  role: OpportunityContactRole;
  created_at: string;
  contact?: Contact;
}

/**
 * Opportunity entity representing a business deal
 */
export interface Opportunity extends OpportunityBase {
  contacts?: OpportunityContact[];
}

/**
 * Input for creating a new opportunity
 */
export interface CreateOpportunityInput {
  title: string;
  description?: string;
  value?: number;
  currency?: string;
  stage: OpportunityStage;
  probability?: number;
  expected_close?: string;
  contact_ids?: string[];
}

/**
 * Input for updating an existing opportunity
 */
export interface UpdateOpportunityInput {
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  stage?: OpportunityStage;
  probability?: number;
  expected_close?: string;
  actual_close?: string;
  outcome?: string;
}

/**
 * Input for adding a contact to an opportunity
 */
export interface AddOpportunityContactInput {
  contact_id: string;
  role: OpportunityContactRole;
}

/**
 * Input for updating a contact's role in an opportunity
 */
export interface UpdateOpportunityContactInput {
  role: OpportunityContactRole;
}

/**
 * Opportunity with aggregated contact information
 */
export interface OpportunityWithContacts extends OpportunityBase {
  contacts: Array<{
    id: string;
    name: string;
    email?: string;
    company?: string;
    role: OpportunityContactRole;
  }>;
}
