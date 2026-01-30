/**
 * Follow-up entity types
 *
 * Represents follow-up tasks and reminders for contacts.
 * Can be user-created or AI-suggested.
 */

import { Contact } from './contact.types';

/**
 * Priority levels for follow-ups
 */
export type FollowUpPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Base follow-up entity properties
 */
export interface FollowUpBase {
  id: string;
  contact_id?: string;
  user_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: FollowUpPriority;
  completed: boolean;
  completed_at?: string;
  ai_suggested: boolean;
  created_at: string;
}

/**
 * Follow-up entity representing a task or reminder
 */
export interface FollowUp extends FollowUpBase {
  contact?: Contact;
}

/**
 * Input for creating a new follow-up
 */
export interface CreateFollowUpInput {
  contact_id?: string;
  title: string;
  description?: string;
  due_date: string;
  priority: FollowUpPriority;
  ai_suggested?: boolean;
}

/**
 * Input for updating an existing follow-up
 */
export interface UpdateFollowUpInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: FollowUpPriority;
  completed?: boolean;
  completed_at?: string;
}

/**
 * Follow-up with contact information for list views
 */
export interface FollowUpWithContact extends FollowUpBase {
  contact?: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
}
