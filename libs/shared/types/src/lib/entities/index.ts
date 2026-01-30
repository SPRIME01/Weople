/**
 * Entity Types
 *
 * Core data entities for the Weople CRM.
 */

// Profile
export type {
  Profile,
  CreateProfileInput,
  UpdateProfileInput,
  UserRole,
  UserPreferences,
} from './profile.types';

// Contact
export type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactWithDetails,
} from './contact.types';

// Interaction
export type {
  Interaction,
  InteractionType,
  CreateInteractionInput,
  UpdateInteractionInput,
  InteractionWithContact,
} from './interaction.types';

// Follow-up
export type {
  FollowUp,
  FollowUpBase,
  FollowUpPriority,
  CreateFollowUpInput,
  UpdateFollowUpInput,
  FollowUpWithContact,
} from './followup.types';

// Tag
export type {
  Tag,
  CreateTagInput,
  UpdateTagInput,
  TagWithParent,
  ContactTag,
} from './tag.types';

// Opportunity
export type {
  Opportunity,
  OpportunityBase,
  OpportunityStage,
  OpportunityContact,
  OpportunityContactRole,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  AddOpportunityContactInput,
  UpdateOpportunityContactInput,
  OpportunityWithContacts,
} from './opportunity.types';
