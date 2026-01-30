/**
 * Tag entity types
 *
 * Represents tags for categorizing contacts.
 * Tags can be hierarchical (parent-child relationships).
 */

/**
 * Tag entity representing a contact category label
 */
export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  parent_id?: string;
  description?: string;
  created_at: string;
  contact_count?: number;
}

/**
 * Input for creating a new tag
 */
export interface CreateTagInput {
  name: string;
  color?: string;
  parent_id?: string;
  description?: string;
}

/**
 * Input for updating an existing tag
 */
export interface UpdateTagInput {
  name?: string;
  color?: string;
  parent_id?: string;
  description?: string;
}

/**
 * Tag with its parent information for display
 */
export interface TagWithParent extends Tag {
  parent?: {
    id: string;
    name: string;
    color: string;
  };
}

/**
 * Junction table entry for contact-tag relationship
 */
export interface ContactTag {
  contact_id: string;
  tag_id: string;
  created_at: string;
}
