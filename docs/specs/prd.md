# Product Requirements Document (PRD) - Weople Platform

## Document Information

- **Project**: Weople - Professional Relationship Management Platform
- **Version**: 1.0.0
- **Last Updated**: 2026-01-29
- **Status**: Draft

---

## 1. Executive Summary

### 1.1 Product Vision

Weople is a professional relationship management platform that helps users build, maintain, and leverage their professional network through intelligent contact management, interaction tracking, and AI-powered insights.

### 1.2 Target Users

- Business professionals seeking to maintain professional relationships
- Sales and business development representatives
- Entrepreneurs and founders managing investor/customer relationships
- Recruiters and talent acquisition professionals
- Anyone seeking to be more intentional about professional networking

### 1.3 Key Value Propositions

- **Relationship Health Scoring**: AI-powered analysis of relationship strength
- **Intelligent Follow-ups**: Automated reminders based on interaction patterns
- **Contact Enrichment**: AI-enhanced contact information from minimal input
- **Opportunity Detection**: Automatic identification of business opportunities
- **Cross-Platform Availability**: Web and mobile with offline support

---

## 2. Architecture Foundation

### 2.1 Architectural Decisions

This PRD is built upon the following Architecture Decision Records:

| ADR | Title | Relevance |
|-----|-------|-----------|
| ADR-001 | Nx Monorepo Architecture | Defines project structure and code organization |
| ADR-002 | Technology Stack Selection | Determines frameworks and tools |
| ADR-003 | Library Organization Strategy | Guides feature module boundaries |
| ADR-004 | Data Access Layer Design | Establishes data patterns |
| ADR-005 | Database Schema Design | Defines data model foundation |
| ADR-006 | AI Integration Architecture | Enables AI-powered features |
| ADR-007 | Authentication and Authorization | Secures user access |
| ADR-008 | Real-Time Synchronization | Enables multi-device sync |
| ADR-009 | Testing Strategy | Ensures quality delivery |
| ADR-010 | Offline-First Architecture | Supports mobile/offline use |

### 2.2 Technology Constraints

- **Frontend Web**: SvelteKit 5.x, TailwindCSS 4.x, DaisyUI
- **Frontend Mobile**: React Native with Expo SDK 52
- **Backend**: Supabase (PostgreSQL, Edge Functions, Realtime)
- **AI**: OpenAI API (o4-mini, o3, text-embedding-3-small)
- **Testing**: Vitest, Jest, Playwright, Maestro

---

## 3. User Stories and Requirements

### US-01: Sign Up

#### 3.1.1 User Story

As a new user, I want to create an account so that I can start managing my professional relationships.

#### 3.1.2 Acceptance Criteria

**AC-01.1: Email/Password Registration**

- User can register with email and password
- Password must meet security requirements (12+ chars, uppercase, lowercase, number, special char)
- Email must be valid format per RFC 5322
- Duplicate email detection with clear error message
- Automatic profile creation upon successful registration
- JWT tokens issued for session management

**AC-01.2: OAuth Registration**

- User can register with Google OAuth
- User can register with LinkedIn OAuth
- OAuth flow uses PKCE for security (per ADR-007)
- Profile data pre-filled from OAuth provider when available

**AC-01.3: Mobile Biometric Registration**

- Mobile users can enable biometric authentication (Face ID/Touch ID)
- Biometric setup occurs after initial registration
- Fallback to password authentication if biometric fails

**AC-01.4: Cross-Platform Consistency**

- Registration state synchronized across devices (per ADR-008)
- Same validation rules on all platforms

#### 3.1.3 Related ADRs

- ADR-007: Authentication and Authorization
- ADR-008: Real-Time Synchronization
- ADR-010: Offline-First Architecture

#### 3.1.4 UI/UX Requirements

- Clean, minimal registration form
- Real-time password strength indicator
- Emotional design: fadeInUp entrance animation, input focus transitions
- Accessible with ARIA labels and keyboard navigation
- Mobile-responsive layout

---

### US-02: Login

#### 3.2.1 User Story

As a returning user, I want to securely log in so that I can access my relationship data.

#### 3.2.2 Acceptance Criteria

**AC-02.1: Email/Password Login**

- User can log in with registered email and password
- Proper error messages for invalid credentials
- Rate limiting after 5 failed attempts (per ADR-007)
- Session persistence with "Remember Me" option
- Automatic token refresh before expiration

**AC-02.2: Biometric Login (Mobile)**

- Primary login method is biometric when available and enabled
- Graceful fallback to password
- Secure keychain/keystore integration

**AC-02.3: OAuth Login**

- One-click login with previously connected OAuth providers
- Deep linking for mobile OAuth callbacks
- Session synchronization across login methods

**AC-02.4: Security Features**

- Idle session timeout after 30 minutes
- Ability to view and revoke active sessions
- Email notifications for new device logins

#### 3.2.3 Related ADRs

- ADR-007: Authentication and Authorization
- ADR-008: Real-Time Synchronization
- ADR-010: Offline-First Architecture

#### 3.2.4 UI/UX Requirements

- Quick access to login form
- Password visibility toggle
- Biometric prompt with clear instructions
- Loading states for async operations

---

### US-03: Add Contact

#### 3.3.1 User Story

As a user, I want to add new contacts so that I can build my relationship database.

#### 3.3.2 Acceptance Criteria

**AC-03.1: Manual Contact Creation**

- Required fields: name
- Optional fields: email, phone, company, job title, notes, tags
- Email format validation
- Phone number format normalization (libphonenumber)
- Duplicate detection via email matching
- Real-time duplicate warning with merge suggestion

**AC-03.2: AI Contact Enrichment**

- Upon saving, contact data processed by AI (per ADR-006)
- AI suggests: job title, company, industry, bio
- Confidence scores displayed for AI suggestions
- User can accept/reject individual AI suggestions
- Vector embeddings generated for similarity search

**AC-03.3: Contact Display**

- Contact list with search and filter
- Sort by name, company, last interaction date, relationship health
- Contact cards show: name, company, avatar, health score
- Quick actions: edit, delete, log interaction

**AC-03.4: Data Validation**

- Name cannot be empty
- Email must be unique per user (case-insensitive)
- Phone number valid for selected country
- Maximum field lengths enforced

#### 3.3.3 Related ADRs

- ADR-004: Data Access Layer Design
- ADR-005: Database Schema Design
- ADR-006: AI Integration Architecture
- ADR-008: Real-Time Synchronization

#### 3.3.4 UI/UX Requirements

- Modal-based contact form
- Inline validation with clear error messages
- AI suggestions presented as dismissible chips
- Smooth animations for list updates
- Empty state with call-to-action

---

### US-04: Log Interaction

#### 3.4.1 User Story

As a user, I want to log interactions with my contacts so that I can track relationship history and health.

#### 3.4.2 Acceptance Criteria

**AC-04.1: Interaction Logging**

- Interaction types: email, call, meeting, note, social media, other
- Required: contact reference, type, date
- Optional: notes, sentiment (auto-detected), tags, duration, location
- Rich text support for notes
- File attachments (optional)

**AC-04.2: AI Sentiment Analysis**

- Automatic sentiment extraction from notes (per ADR-006)
- Sentiment score: -1 to +1
- Sentiment categories: very negative, negative, neutral, positive, very positive
- Sentiment displayed with color-coded indicators

**AC-04.3: Relationship Health Updates**

- Health score recalculated after each interaction (0-100)
- Factors: interaction frequency, sentiment, reciprocity, time since last contact
- Health trend: improving, stable, declining
- Visual health indicator on contact card

**AC-04.4: Timeline Display**

- Chronological interaction history per contact
- Filter by interaction type and date range
- Infinite scroll for large histories
- Group by date (today, yesterday, this week, etc.)

#### 3.4.3 Related ADRs

- ADR-004: Data Access Layer Design
- ADR-005: Database Schema Design
- ADR-006: AI Integration Architecture
- ADR-008: Real-Time Synchronization

#### 3.4.4 UI/UX Requirements

- Floating action button for quick logging
- Modal form with type selector
- Timeline with vertical connector line
- Sentiment indicators as colored dots/backgrounds
- Swipe actions on mobile (edit, delete)

---

### US-05: Follow-up Reminders

#### 3.5.1 User Story

As a user, I want to set follow-up reminders so that I can maintain relationships proactively.

#### 3.5.2 Acceptance Criteria

**AC-05.1: Manual Follow-up Creation**

- Link follow-up to specific contact
- Set due date and time
- Set priority: low, medium, high, critical
- Add notes about follow-up purpose
- Mark as complete/incomplete

**AC-05.2: AI-Generated Follow-ups**

- AI suggests follow-ups based on interaction patterns (per ADR-006)
- Suggested timing based on historical response rates
- Context-aware suggestions (e.g., "Follow up on proposal")
- User can accept, modify, or dismiss AI suggestions

**AC-05.3: Reminder Notifications**

- Push notifications on mobile
- Browser notifications on web (with permission)
- Email reminders for critical follow-ups
- Snooze functionality (15 min, 1 hour, 1 day, custom)

**AC-05.4: Follow-up Dashboard**

- Overdue follow-ups highlighted prominently
- Grouped by: overdue, today, upcoming, completed
- Filter by priority and contact
- Quick complete action
- Reschedule functionality

**AC-05.5: Smart Scheduling**

- Conflict detection with existing follow-ups
- Optimal timing suggestions based on contact's time zone
- Recurring follow-up support (daily, weekly, monthly, custom)

#### 3.5.3 Related ADRs

- ADR-006: AI Integration Architecture
- ADR-008: Real-Time Synchronization
- ADR-010: Offline-First Architecture

#### 3.5.4 UI/UX Requirements

- Badge count on follow-up navigation item
- Overdue items in red with warning icon
- Calendar integration view
- Swipe to complete on mobile
- Celebration animation on completion

---

### US-06: Contact Import

#### 3.6.1 User Story

As a user, I want to import contacts from external sources so that I can quickly populate my network.

#### 3.6.2 Acceptance Criteria

**AC-06.1: OAuth Import Sources**

- Google Contacts import
- LinkedIn connections import
- CSV file upload (vCard format)

**AC-06.2: Import Workflow**

- Step 1: Select import source and authorize
- Step 2: Preview contacts before import
- Step 3: Resolve duplicates
- Step 4: Import with progress tracking
- Step 5: Review import summary

**AC-06.3: Duplicate Resolution**

- Automatic duplicate detection via email/name matching
- Confidence score for potential duplicates
- Side-by-side comparison interface
- Options: merge, skip, import as new
- Bulk resolution for high-confidence matches

**AC-06.4: AI Import Enhancement**

- AI enriches imported contacts (per ADR-006)
- Data validation and correction
- Automatic tagging based on source and data patterns
- Professional relevance scoring

**AC-06.5: Import Limits**

- Free tier: 100 contacts per import, 3 imports/day
- Premium: Unlimited imports
- Progress saved for interrupted imports

#### 3.6.3 Related ADRs

- ADR-004: Data Access Layer Design
- ADR-006: AI Integration Architecture
- ADR-007: Authentication and Authorization

#### 3.6.4 UI/UX Requirements

- Clear source selection with provider logos
- Progress bar with contact count
- Duplicate resolution modal with merge preview
- Import history log
- Undo import functionality (within 24 hours)

---

### US-07: Tagging

#### 3.7.1 User Story

As a user, I want to tag my contacts so that I can organize and filter my network effectively.

#### 3.7.2 Acceptance Criteria

**AC-07.1: Tag Management**

- Create tags with name and optional color
- Edit tag name and color
- Delete tags (with contact count warning)
- Tag hierarchy support (parent/child tags)
- Tag description for context

**AC-07.2: Tag Application**

- Add/remove tags on contact form
- Bulk tag operations (select multiple contacts)
- Tag suggestions based on contact data
- Quick tags (frequently used tags)

**AC-07.3: Tag-Based Filtering**

- Filter contacts by single or multiple tags
- Boolean logic: AND, OR, NOT
- Saved filter presets
- Tag cloud visualization

**AC-07.4: AI Tag Suggestions**

- AI suggests tags based on: company, job title, industry, interactions (per ADR-006)
- Learning from user tagging patterns
- Industry-specific tag recommendations
- Confidence scores for suggestions

#### 3.7.3 Related ADRs

- ADR-005: Database Schema Design
- ADR-006: AI Integration Architecture
- ADR-008: Real-Time Synchronization

#### 3.7.4 UI/UX Requirements

- Tag input with autocomplete
- Color-coded tag pills
- Drag-and-drop tag organization
- Tag filter sidebar
- Tag analytics (usage counts)

---

### US-08: Opportunities

#### 3.8.1 User Story

As a user, I want to track business opportunities with my contacts so that I can manage my sales pipeline.

#### 3.8.2 Acceptance Criteria

**AC-08.1: Opportunity Management**

- Create opportunities with: title, value, currency, stage, probability
- Link multiple contacts to opportunity (with roles: decision maker, influencer, etc.)
- Stage pipeline: Prospecting → Qualification → Proposal → Negotiation → Closed Won/Lost
- Expected close date tracking
- Actual close date and outcome recording

**AC-08.2: Opportunity Views**

- Pipeline view (kanban board)
- List view with sorting and filtering
- Calendar view by expected close date
- Contact-centric opportunity list

**AC-08.3: Opportunity Analytics**

- Pipeline value by stage
- Win/loss rate
- Average deal size
- Sales cycle duration
- Conversion rate by stage

**AC-08.4: AI Opportunity Detection**

- AI identifies potential opportunities from interactions (per ADR-006)
- Suggests contacts to engage for opportunity advancement
- Relationship path analysis for warm introductions
- Opportunity likelihood scoring

#### 3.8.3 Related ADRs

- ADR-005: Database Schema Design
- ADR-006: AI Integration Architecture
- ADR-008: Real-Time Synchronization

#### 3.8.4 UI/UX Requirements

- Drag-and-drop kanban board
- Stage change confirmation with required fields
- Value formatting with currency symbol
- Opportunity card with linked contacts
- Win/loss celebration animations

---

### US-09: Dashboard Overview

#### 3.9.1 User Story

As a user, I want to view a dashboard of my network health and activity so that I can understand my networking performance.

#### 3.9.2 Acceptance Criteria

**AC-09.1: Dashboard Widgets**

- Network size (total contacts, new this month)
- Relationship health distribution (healthy, at-risk, neglected)
- Recent activity (interactions this week/month)
- Upcoming follow-ups (today, this week)
- Active opportunities (count, value)
- Tag distribution chart

**AC-09.2: Interactive Charts**

- Network growth over time (line chart)
- Interaction frequency (bar chart)
- Relationship health trends
- Click-through to filtered contact lists

**AC-09.3: Dashboard Customization**

- Drag-and-drop widget arrangement
- Show/hide widgets
- Multiple dashboard layouts
- Mobile-optimized layout

**AC-09.4: AI-Generated Insights**

- Natural language insights about networking patterns (per ADR-006)
- Personalized recommendations for network growth
- At-risk relationship alerts
- Goal tracking and progress

**AC-09.5: Real-Time Updates**

- Dashboard updates automatically with new data (per ADR-008)
- Last updated timestamp
- Pull-to-refresh on mobile

#### 3.9.3 Related ADRs

- ADR-004: Data Access Layer Design
- ADR-006: AI Integration Architecture
- ADR-008: Real-Time Synchronization

#### 3.9.4 UI/UX Requirements

- Clean, information-dense layout
- Responsive grid system
- Animated counters for statistics
- Color-coded health indicators
- Empty states with guidance

---

### US-10: Account Management

#### 3.10.1 User Story

As a user, I want to manage my account settings so that I can control my data and preferences.

#### 3.10.2 Acceptance Criteria

**AC-10.1: Profile Management**

- Update name, email, avatar
- Email change requires verification
- Avatar upload with crop/resize
- Profile visibility settings

**AC-10.2: Security Settings**

- Change password with current password confirmation
- Password strength requirements
- Two-factor authentication setup
- Active session management (view, revoke)
- Login history view

**AC-10.3: Notification Preferences**

- Email notification toggles
- Push notification settings (mobile)
- Follow-up reminder preferences
- Weekly digest option
- Marketing communications preference

**AC-10.4: Data Management**

- Export all data (GDPR compliance)
- Data export format: JSON, CSV
- Account deletion with confirmation
- Data retention information

**AC-10.5: Privacy Controls**

- AI processing consent toggle
- Data sharing preferences
- Third-party integration permissions
- Cookie preferences (web)

#### 3.10.3 Related ADRs

- ADR-007: Authentication and Authorization
- ADR-010: Offline-First Architecture

#### 3.10.4 UI/UX Requirements

- Settings organized by category
- Confirmation dialogs for destructive actions
- Success notifications for saved changes
- Clear explanations of privacy implications

---

### US-11: Duplicate Contact Handling

#### 3.11.1 User Story

As a user, I want to detect and merge duplicate contacts so that my contact database remains clean and accurate.

#### 3.11.2 Acceptance Criteria

**AC-11.1: Duplicate Detection**

- Automatic duplicate detection on contact creation/import
- Detection criteria: email, phone, name+company similarity
- Confidence scoring for potential duplicates
- HNSW vector similarity for fuzzy matching (per ADR-005)

**AC-11.2: Duplicate Review Interface**

- List of potential duplicates with confidence scores
- Side-by-side comparison view
- Field-level comparison highlighting
- Option to mark as "not duplicate"

**AC-11.3: Merge Functionality**

- Select which fields to keep from each contact
- Automatic merge of: interactions, tags, opportunities
- Conflict resolution for conflicting field values
- Merge preview before confirmation
- Undo merge capability (within 24 hours)

**AC-11.4: AI-Enhanced Duplicate Detection**

- Context-aware duplicate analysis (per ADR-006)
- Professional network analysis for identity confirmation
- Learning from user merge decisions
- Suggested merge strategies

**AC-11.5: Bulk Operations**

- Auto-merge high-confidence duplicates (configurable threshold)
- Bulk selection for manual review
- Export duplicate report

#### 3.11.3 Related ADRs

- ADR-005: Database Schema Design
- ADR-006: AI Integration Architecture

#### 3.11.4 UI/UX Requirements

- Duplicate badge on contacts
- Merge wizard with step-by-step guidance
- Visual diff for field comparison
- Undo notification with countdown

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| Page Load Time | < 2s | Initial load on 3G connection |
| Time to Interactive | < 3s | Web application |
| API Response Time | < 200ms | 95th percentile |
| Contact List Scroll | 60fps | Virtualized for large lists |
| Search Response | < 100ms | Local search, < 500ms server |
| AI Processing | < 5s | Contact enrichment, async |

### 4.2 Scalability Requirements

- Support 10,000 contacts per user
- Support 100,000 interactions per user
- Concurrent users: 10,000 (initial)
- Handle import of 1,000 contacts at once

### 4.3 Security Requirements

- All data encrypted at rest (AES-256)
- All data encrypted in transit (TLS 1.3)
- Row Level Security on all user data (per ADR-007)
- Password hashing with bcrypt (12 rounds)
- Rate limiting on all public endpoints
- XSS and CSRF protection
- Content Security Policy implementation

### 4.4 Accessibility Requirements

- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- Color contrast ratio 4.5:1 minimum
- Focus indicators visible
- Alt text for all images

### 4.5 Compatibility Requirements

| Platform | Versions |
|----------|----------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| iOS | 15+ |
| Android | 10+ |

---

## 5. Data Model Summary

### 5.1 Core Entities

- **Profile**: User profile extending auth.users
- **Contact**: Professional contact with embeddings
- **Interaction**: Logged interaction with sentiment
- **FollowUp**: Scheduled reminder
- **Tag**: Contact categorization
- **Opportunity**: Business opportunity

### 5.2 Key Relationships

- Profile 1:N Contacts
- Contact 1:N Interactions
- Contact 1:N FollowUps
- Contact N:M Tags (via contact_tags)
- Contact N:M Opportunities (via opportunity_contacts)

---

## 6. AI Feature Requirements

### 6.1 AI Model Usage

| Feature | Model | Purpose |
|---------|-------|---------|
| Contact Enrichment | o4-mini | Job title, company suggestions |
| Sentiment Analysis | o4-mini | Interaction sentiment scoring |
| Follow-up Suggestions | o4-mini | Optimal timing and content |
| Opportunity Detection | o3 | Complex relationship analysis |
| Insights Generation | o3 | Natural language insights |
| Duplicate Detection | o3 | Context-aware matching |
| Embeddings | text-embedding-3-small | Vector similarity search |

### 6.2 AI Processing Constraints

- Maximum 500 requests/minute per user
- Cached results for identical inputs (24hr TTL)
- User can disable AI features (privacy)
- Cost tracking and budget alerts
- Processing status indicators in UI

---

## 7. Traceability Matrix

### User Story to ADR Mapping

| User Story | Related ADRs |
|------------|--------------|
| US-01: Sign Up | ADR-007, ADR-008, ADR-010 |
| US-02: Login | ADR-007, ADR-008, ADR-010 |
| US-03: Add Contact | ADR-004, ADR-005, ADR-006, ADR-008 |
| US-04: Log Interaction | ADR-004, ADR-005, ADR-006, ADR-008 |
| US-05: Follow-up Reminders | ADR-006, ADR-008, ADR-010 |
| US-06: Contact Import | ADR-004, ADR-006, ADR-007 |
| US-07: Tagging | ADR-005, ADR-006, ADR-008 |
| US-08: Opportunities | ADR-005, ADR-006, ADR-008 |
| US-09: Dashboard Overview | ADR-004, ADR-006, ADR-008 |
| US-10: Account Management | ADR-007, ADR-010 |
| US-11: Duplicate Handling | ADR-005, ADR-006 |

---

## 8. Release Criteria

### 8.1 MVP Requirements

- US-01, US-02: Authentication complete
- US-03, US-04: Core CRM functionality
- US-05: Basic follow-up reminders
- US-09: Basic dashboard
- US-10: Account management

### 8.2 v1.0 Requirements

- All user stories complete
- AI features integrated
- Mobile apps published
- 80% test coverage
- Security audit passed
- Performance benchmarks met

---

## 9. Glossary

- **AI**: Artificial Intelligence
- **API**: Application Programming Interface
- **CRM**: Customer Relationship Management
- **CSV**: Comma-Separated Values
- **E2E**: End-to-End
- **GDPR**: General Data Protection Regulation
- **HNSW**: Hierarchical Navigable Small World
- **JWT**: JSON Web Token
- **OAuth**: Open Authorization
- **PKCE**: Proof Key for Code Exchange
- **PWA**: Progressive Web App
- **RLS**: Row Level Security
- **TTL**: Time To Live
- **UI**: User Interface
- **UX**: User Experience
- **WCAG**: Web Content Accessibility Guidelines
