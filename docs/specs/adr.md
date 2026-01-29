# Architecture Decision Records (ADR) - Weople Platform

## Document Information

- **Project**: Weople - Professional Relationship Management Platform
- **Version**: 1.0.0
- **Last Updated**: 2026-01-29
- **Status**: Draft

---

## ADR-001: Nx Monorepo Architecture

### Status

Accepted

### Context

Weople requires a multi-platform application (web, mobile, API) with significant shared code between platforms. We need to balance code reusability with platform-specific optimizations.

### Decision

Adopt Nx as the monorepo management tool with the following structure:

- `apps/` - Application entry points (api, web, mobile)
- `libs/shared/` - Cross-platform shared libraries
- `libs/web/` - Web-specific feature libraries
- `libs/mobile/` - Mobile-specific feature libraries
- `libs/tools/` - Development and infrastructure tools

### Consequences

**Positive:**

- Clear code sharing boundaries
- Optimized build caching and task orchestration
- Standardized project structure
- Strong TypeScript support

**Negative:**

- Learning curve for Nx concepts
- Additional configuration complexity
- Tooling dependencies

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-003: Library Organization Strategy

---

## ADR-002: Technology Stack Selection

### Status

Accepted

### Context

The platform requires modern, performant technologies for web and mobile with strong TypeScript support and AI integration capabilities.

### Decision

**Web Frontend:**

- SvelteKit 5.x with Svelte 5 (runes-based reactivity)
- TailwindCSS 4.x for styling
- shadcn/ui as base component library
- Framer Motion for animations and emotional design
- Atomic design system methodology
- Vite for bundling

**Mobile Frontend:**

- React Native with Expo SDK 52
- React Native Elements for UI components
- Metro bundler

**Backend/API:**

- Supabase for Authentication and Database only
- PostgreSQL for relational data
- Edge Functions (Deno runtime) for business logic
- Row Level Security (RLS) for data protection
- Self-hosted S3-compatible object storage (not Supabase Storage)

**AI/ML:**

- LiteLLM Gateway for unified model access and cost control
- Local LLMs via Ollama/llama.cpp for development (offline-capable)
- Self-hosted open source models on Weople infrastructure (primary)
- OpenAI API as fallback only
- Open source embeddings (sentence-transformers) self-hosted
- Self-hosted vector database (Weaviate or Pinecone)

**Testing:**

- Vitest for unit tests (web/shared)
- Jest for React Native (mobile)
- Playwright for E2E testing (web)
- Maestro for mobile E2E

### Consequences

**Positive:**

- Modern, performant frameworks
- Strong type safety with TypeScript
- Excellent AI integration capabilities
- Scalable backend infrastructure

**Negative:**

- Multiple framework expertise required
- Complex dependency management across platforms

### Related Decisions

- ADR-001: Nx Monorepo Architecture
- ADR-005: Database Schema Design

---

## ADR-003: Library Organization Strategy

### Status

Accepted

### Context

With 11 user stories and multiple platforms, we need a clear library organization strategy to maintain modularity and prevent circular dependencies.

### Decision

Implement a layered architecture with strict dependency rules:

```
┌─────────────────────────────────────────┐
│           Feature Libraries             │
│  (feature-auth, feature-contacts, etc.) │
└─────────────────┬───────────────────────┘
                  │ depends on
┌─────────────────▼───────────────────────┐
│           Shared Libraries              │
│  ┌───────────┐ ┌───────────┐ ┌────────┐ │
│  │data-access│ │   types   │ │  utils │ │
│  └───────────┘ └───────────┘ └────────┘ │
│  ┌───────────┐ ┌───────────┐ ┌────────┐ │
│  │    ui     │ │  testing  │ │monitor │ │
│  └───────────┘ └───────────┘ └────────┘ │
└─────────────────────────────────────────┘
```

**Dependency Rules:**

1. Features can depend on shared libraries
2. Shared libraries cannot depend on features
3. `types` and `utils` have no internal dependencies
4. `data-access` depends on `types` and `utils`
5. `ui` depends on `types` and `utils`

### Consequences

**Positive:**

- Clear separation of concerns
- Prevents circular dependencies
- Enables independent testing and deployment
- Facilitates code reuse

**Negative:**

- Requires discipline in maintaining boundaries
- May lead to library proliferation

### Related Decisions

- ADR-001: Nx Monorepo Architecture
- ADR-004: Data Access Layer Design

---

## ADR-004: Data Access Layer Design

### Status

Accepted

### Context

The application requires consistent data access patterns across web and mobile platforms with offline support and real-time synchronization.

### Decision

Implement a centralized data access layer in `libs/shared/data-access` with:

1. **Supabase Client Abstraction**
   - Environment-aware client configuration
   - Singleton pattern with platform-specific optimizations
   - Admin client for server-side operations

2. **Service Pattern**
   - `AuthService` - Authentication and session management
   - `ContactService` - CRUD operations for contacts
   - `InteractionService` - Interaction logging and retrieval
   - `FollowUpService` - Reminder and scheduling
   - `AnalyticsService` - Data aggregation and reporting

3. **Caching Strategy**
   - In-memory caching for active sessions
   - AsyncStorage (mobile) / localStorage (web) for offline support
   - Cache invalidation via Supabase Realtime events

4. **Error Handling**
   - Standardized error types
   - Retry logic with exponential backoff
   - Offline queue for failed operations

### Consequences

**Positive:**

- Consistent data access across platforms
- Centralized error handling and caching
- Easier testing with mockable services

**Negative:**

- Additional abstraction layer complexity
- Potential for over-generalization

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-005: Database Schema Design

---

## ADR-005: Database Schema Design

### Status

Accepted

### Context

The application requires a relational database with vector search capabilities for AI features and RLS for security.

### Decision

Use PostgreSQL with the following schema design principles:

1. **Core Tables**
   - `profiles` - User profile data (extends Supabase auth.users)
   - `contacts` - Contact information with vector embeddings
   - `interactions` - Interaction history with contacts
   - `follow_ups` - Reminder and follow-up scheduling
   - `tags` - Contact categorization
   - `contact_tags` - Many-to-many junction table
   - `opportunities` - Business opportunity tracking
   - `opportunity_contacts` - Contact-opportunity relationships

2. **Vector Storage**
   - Use pgvector extension for similarity search
   - Store embeddings as 1536-dimension vectors (text-embedding-3-small)
   - Create HNSW indexes for efficient similarity queries

3. **Security**
   - Row Level Security (RLS) on all user-data tables
   - Policies based on `auth.uid()` for user isolation
   - Service role key for admin operations only

4. **Indexing Strategy**
   - B-tree indexes on foreign keys and frequently filtered columns
   - GIN indexes on JSONB metadata fields
   - HNSW indexes on embedding columns

### Consequences

**Positive:**

- Powerful vector search for AI features
- Strong security with RLS
- Flexible JSONB for metadata

**Negative:**

- pgvector adds complexity to migrations
- Vector operations can be resource-intensive

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-006: AI Integration Architecture

---

## ADR-006: AI Integration Architecture

### Status

Accepted

### Context

AI features require careful integration to balance cost, performance, and user experience. We need to support multiple AI use cases while managing API costs.

### Decision

Implement a tiered AI integration strategy:

1. **Model Selection**
   - `o4-mini` - Cost-effective model for routine tasks (contact enrichment, sentiment analysis)
   - `o3` - Advanced reasoning for complex analysis (opportunity detection, insights generation)
   - `text-embedding-3-small` - Vector embeddings for similarity search

2. **Processing Architecture**
   - Edge Functions for async AI processing
   - Webhook-based callbacks for long-running operations
   - Client-side AI only for real-time, low-latency features

3. **Cost Optimization**
   - Intelligent caching of AI responses
   - Batching for bulk operations
   - User-configurable AI feature toggles
   - Usage tracking and budget alerts

4. **Privacy and Security**
   - Data anonymization before AI processing where possible
   - Configurable privacy levels for sensitive content
   - No PII storage in AI provider logs

### Consequences

**Positive:**

- Cost-effective AI implementation
- Scalable processing architecture
- User privacy protection

**Negative:**

- Complex caching and queue management
- Dependency on third-party AI providers

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-005: Database Schema Design

---

## ADR-007: Authentication and Authorization

### Status

Accepted

### Context

The platform requires secure, cross-platform authentication with support for social login, biometric authentication, and session management.

### Decision

Use Supabase Auth with the following architecture:

1. **Authentication Methods**
   - Email/password with strong validation
   - OAuth providers (Google, LinkedIn)
   - Biometric authentication (mobile via Expo LocalAuthentication)
   - JWT-based session management

2. **Authorization Model**
   - Role-based access control (RBAC) via `profiles.role`
   - Row Level Security for data isolation
   - Custom claims in JWT for permissions

3. **Security Measures**
   - PKCE flow for OAuth
   - Automatic token refresh
   - Session timeout and idle detection
   - Rate limiting on auth endpoints
   - Password strength requirements (12+ chars, complexity)

4. **Cross-Platform Consistency**
   - Shared auth service in `libs/shared/data-access`
   - Platform-specific UI components
   - Synchronized session state

### Consequences

**Positive:**

- Secure, proven authentication system
- Built-in OAuth and JWT support
- Cross-platform consistency

**Negative:**

- Dependency on Supabase Auth service
- Limited customization of auth flows

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-004: Data Access Layer Design

---

## ADR-008: Real-Time Synchronization

### Status

Accepted

### Context

Users expect real-time updates across devices when contacts, interactions, or follow-ups are modified.

### Decision

Use Supabase Realtime for real-time synchronization:

1. **Channel Strategy**
   - User-specific channels for personal data
   - Contact-specific channels for shared contact updates
   - System channels for global announcements

2. **Event Types**
   - `INSERT` - New records created
   - `UPDATE` - Record modifications
   - `DELETE` - Record removals
   - Custom events for AI processing completion

3. **Client Implementation**
   - Realtime subscriptions in data access services
   - Automatic reconnection with exponential backoff
   - Optimistic UI updates with rollback on error

4. **Performance Considerations**
   - Rate limiting: 10 events/second per client
   - Selective column listening to reduce payload
   - Debounced batch updates for high-frequency changes

### Consequences

**Positive:**

- Seamless multi-device synchronization
- Low-latency updates
- Built-in Supabase integration

**Negative:**

- Connection management complexity
- Potential for race conditions

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-004: Data Access Layer Design

---

## ADR-009: Testing Strategy

### Status

Accepted

### Context

The platform requires comprehensive testing across multiple platforms and layers.

### Decision

Implement a multi-layered testing strategy:

1. **Unit Testing**
   - Vitest for web and shared libraries
   - Jest for React Native mobile
   - Coverage threshold: 80% minimum

2. **Component Testing**
   - Testing Library for Svelte components
   - Testing Library React Native for mobile
   - Mock service worker for API mocking

3. **E2E Testing**
   - Playwright for web (cross-browser)
   - Maestro for mobile (iOS and Android)
   - Critical user journey coverage

4. **Test Organization**
   - Co-located tests: `*.spec.ts` alongside source files
   - Shared test utilities in `libs/shared/testing`
   - Platform-specific test configurations

5. **TDD Workflow**
   - RED: Write failing test
   - GREEN: Implement minimal passing code
   - BLUE: Refactor with quality improvements
   - REG: Add regression tests for edge cases

### Consequences

**Positive:**

- Comprehensive test coverage
- Platform-appropriate testing tools
- Clear testing workflows

**Negative:**

- Significant test maintenance overhead
- Multiple testing frameworks to learn

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-003: Library Organization Strategy

---

## ADR-010: Offline-First Architecture

### Status

Accepted

### Context

Mobile users require offline access to contacts and interactions, with synchronization when connectivity returns. The architecture must support both self-hosted and cloud-hosted deployments.

### Decision

Implement offline-first architecture with the following components:

1. **Local Storage**
   - AsyncStorage for React Native
   - localStorage/IndexedDB for web
   - SQLite for structured local data (via OPFS on web)
   - Operation queue for pending mutations

2. **Synchronization Strategy**
   - Optimistic updates with local state
   - Operation queue for offline mutations
   - Background sync when connectivity returns
   - Conflict resolution with server-wins or last-write-wins
   - Configurable sync intervals

3. **Data Availability**
   - Full contact list cached locally
   - Recent interactions cached (last 90 days)
   - User settings and preferences
   - Offline indicator in UI

4. **Background Processing**
   - Expo BackgroundFetch for mobile
   - Service Workers for web (PWA)
   - Periodic sync scheduling

5. **Deployment Modes**
   - Local-only mode (no cloud sync)
   - Cloud-sync mode (Supabase backend)
   - Toggle between modes in settings

### Consequences

**Positive:**

- Resilient to network failures
- Improved perceived performance
- Better mobile user experience
- Supports self-hosting requirements

**Negative:**

- Complex state management
- Conflict resolution challenges
- Increased storage requirements

### Related Decisions

- ADR-004: Data Access Layer Design
- ADR-002: Technology Stack Selection

---

## ADR-011: AI/LLM Gateway Architecture

### Status

Accepted

### Context

AI features require cost control, privacy protection, and flexibility to use multiple providers. We need to support local development without cloud dependencies and self-hosted models in production.

### Decision

Implement a multi-tier AI architecture using LiteLLM as the gateway:

1. **LiteLLM Gateway**
   - Unified API for all LLM providers
   - Cost tracking and budget enforcement ($5/user/month limit)
   - Request routing based on model availability
   - Fallback chain: local → self-hosted → OpenAI
   - Privacy level enforcement (strict, balanced, permissive)

2. **Local Development Tier**
   - Ollama for local LLM hosting
   - llama.cpp for lightweight inference
   - z.ai and similar local providers
   - Complete offline capability

3. **Self-Hosted Production Tier**
   - Open source models on Weople infrastructure
   - vLLM or TGI for model serving
   - Sentence-transformers for embeddings
   - Weaviate or Pinecone for vector search

4. **Cloud Fallback Tier**
   - OpenAI API for emergencies only
   - Rate limiting and cost controls
   - Anonymization before sending

5. **Model Selection Strategy**
   - Contact enrichment: local small model or self-hosted
   - Sentiment analysis: local small model
   - Complex reasoning: self-hosted large model
   - Embeddings: sentence-transformers (local/self-hosted)

### Consequences

**Positive:**

- Significant cost reduction
- Privacy-preserving AI processing
- No vendor lock-in
- Works offline in development
- Scalable self-hosted architecture

**Negative:**

- Complex infrastructure requirements
- Model management overhead
- Higher initial setup cost

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-006: AI Integration Architecture (superseded)

---

## ADR-012: Database Port/Adapter Architecture

### Status

Accepted

### Context

The system requires multiple database types (relational, graph, vector, object storage). To ensure flexibility and avoid vendor lock-in, we need a unified abstraction layer.

### Decision

Implement Port and Adapter pattern for all database interactions:

1. **Pattern Structure**
   - **Ports**: TypeScript interfaces defining database operations
   - **Adapters**: Concrete implementations for specific databases
   - **Factory**: Creates appropriate adapter based on configuration

2. **Database Types**
   - **Relational**: PostgreSQL (via Supabase) - Primary data store
   - **Graph**: Oxigraph - RDF graph with SPARQL queries
   - **Vector**: Qdrant or Milvus - Vector similarity search
   - **Object Storage**: Garage - S3-compatible file storage

3. **Adapter Requirements**
   - Each adapter implements common interface
   - Configuration-driven adapter selection
   - Easy to add new database backends
   - Migration tools between adapters

4. **Oxigraph Graph Database**
   - SPARQL 1.1 query support
   - RDF triple store for relationship modeling
   - Used for: contact relationships, network analysis, opportunity paths
   - Self-hosted with Rust-based performance

### Consequences

**Positive:**

- Swappable database backends
- No vendor lock-in
- Easy testing with mock adapters
- Can optimize per-deployment

**Negative:**

- Additional abstraction complexity
- Need to maintain multiple adapter implementations

### Related Decisions

- ADR-005: Database Schema Design (amended)
- ADR-011: AI/LLM Gateway Architecture
- ADR-013: Storage Architecture

---

## ADR-016: Graph Database with Oxigraph

### Status

Accepted

### Context

Professional relationship management requires understanding connections between contacts, companies, and opportunities. A graph database provides efficient relationship traversal and network analysis.

### Decision

Use Oxigraph as the graph database with SPARQL query support:

1. **Oxigraph Features**
   - Native RDF triple store
   - Full SPARQL 1.1 support
   - Rust-based performance
   - Self-hosted
   - ACID transactions

2. **Data Model (RDF)**

   ```turtle
   @prefix weople: <http://weople.io/schema#> .
   @prefix foaf: <http://xmlns.com/foaf/0.1/> .

   weople:contact_123 a weople:Contact ;
       foaf:name "John Doe" ;
       weople:worksAt weople:company_456 ;
       weople:knows weople:contact_789 .
   ```

3. **Use Cases**
   - Network path finding (introduction chains)
   - Company relationship mapping
   - Opportunity influence analysis
   - Duplicate detection via relationship context

4. **Integration**
   - Adapter pattern for SPARQL queries
   - Sync with PostgreSQL on contact updates
   - Materialized views for common queries

### Consequences

**Positive:**

- Powerful relationship queries via SPARQL
- Standards-based (RDF, SPARQL)
- Self-hosted and open source
- Efficient graph traversals

**Negative:**

- RDF/SPARQL learning curve
- Sync complexity with relational data
- Additional infrastructure component

### Related Decisions

- ADR-012: Database Port/Adapter Architecture
- ADR-005: Database Schema Design

---

## ADR-013: Storage Architecture

### Status

Accepted

### Context

File storage is needed for avatars, attachments, and exports. Supabase Storage is not an option per requirements.

### Decision

Use self-hosted S3-compatible object storage:

1. **Primary: Garage**
   - S3-compatible API
   - Self-hosted on Weople infrastructure
   - Distributed, lightweight design
   - Native replication support
   - Buckets per user or shared

2. **Backup/Alternative: Cloudflare R2**
   - S3-compatible
   - Zero egress fees
   - CDN integration

3. **Integration**
   - Presigned URLs for uploads/downloads
   - Direct browser-to-storage uploads
   - Metadata stored in PostgreSQL

4. **Security**
   - Private buckets default
   - Time-limited presigned URLs
   - Content-type validation
   - Size limits enforced

### Consequences

**Positive:**

- Full data ownership
- No vendor lock-in
- Cost control
- S3-compatible ecosystem
- Lightweight and efficient (Garage)

**Negative:**

- Infrastructure management overhead
- Backup and disaster recovery responsibility

### Related Decisions

- ADR-002: Technology Stack Selection
- ADR-007: Authentication and Authorization

---

## ADR-014: Monitoring and Observability

### Status

Accepted

### Context

Production monitoring requires open source, non-proprietary tools that can be self-hosted.

### Decision

Implement open source observability stack:

1. **Logging: OpenObserve**
   - Self-hosted log aggregation
   - Structured logging (JSON)
   - Full-text search
   - Alerting capabilities

2. **Error Tracking: Sentry (Open Source)**
   - Self-hosted Sentry instance
   - Error aggregation and alerting
   - Performance monitoring
   - Source map support

3. **Tracing: OpenTelemetry**
   - Distributed tracing
   - Vendor-neutral instrumentation
   - Jaeger or Zipkin for visualization

4. **Log Management: Logfire (Non-Proprietary)**
   - Structured logging
   - Query and analysis
   - Integration with OpenTelemetry

5. **Metrics**
   - Prometheus for metrics collection
   - Grafana for dashboards
   - Custom business metrics

### Consequences

**Positive:**

- Full observability ownership
- No vendor lock-in
- Cost effective at scale
- Customizable

**Negative:**

- Infrastructure management
- Integration complexity

### Related Decisions

- ADR-002: Technology Stack Selection

---

## ADR-015: Supabase Deployment Strategy

### Status

Accepted

### Context

Multiple environments (local, staging, production) require consistent Supabase configuration and migration management.

### Decision

Use Supabase CLI for local development and Git-based workflow:

1. **Local Development**
   - Supabase CLI for local Supabase instance
   - Docker-compose managed services
   - Hot reload for Edge Functions

2. **Environments**
   - Development: Local CLI
   - Staging: Separate Supabase project
   - Production: Separate Supabase project

3. **Migration Workflow**
   - Database migrations in `supabase/migrations/`
   - Edge Functions in `supabase/functions/`
   - TypeScript with Deno runtime
   - Version controlled alongside application code

4. **Configuration**
   - Environment-specific `.env` files
   - SOPS + Age for secrets encryption
   - GitHub Actions for CI/CD

5. **Self-Hosting Path**
   - Design for eventual Supabase self-hosting
   - No Supabase-specific vendor features
   - Portable SQL migrations

### Consequences

**Positive:**

- Consistent local development
- Git-based deployment workflow
- Easy environment replication
- Path to self-hosting

**Negative:**

- Supabase CLI learning curve
- Docker resource requirements

### Related Decisions

- ADR-001: Nx Monorepo Architecture
- ADR-002: Technology Stack Selection

---

## Traceability Matrix

| ADR ID | Title | Related PRDs | Related SDS Sections |
|--------|-------|--------------|---------------------|
| ADR-001 | Nx Monorepo Architecture | PRD-ALL | SDS-001, SDS-002 |
| ADR-002 | Technology Stack Selection | PRD-ALL | SDS-001, SDS-003 |
| ADR-003 | Library Organization Strategy | PRD-ALL | SDS-002, SDS-004 |
| ADR-004 | Data Access Layer Design | PRD-ALL | SDS-005, SDS-006 |
| ADR-005 | Database Schema Design | PRD-US01-11 | SDS-005, SDS-007 |
| ADR-006 | AI Integration Architecture | PRD-US03, US04, US05, US06, US07, US08, US09, US11 | SDS-008 |
| ADR-007 | Authentication and Authorization | PRD-US01, US02, US10 | SDS-006, SDS-009 |
| ADR-008 | Real-Time Synchronization | PRD-US03, US04, US05 | SDS-006, SDS-010 |
| ADR-009 | Testing Strategy | PRD-ALL | SDS-011 |
| ADR-010 | Offline-First Architecture | PRD-US02, US03, US04, US05 | SDS-006, SDS-012 |
| ADR-011 | AI/LLM Gateway Architecture | PRD-US03, US04, US05, US06, US07, US08, US09, US11 | SDS-008 |
| ADR-012 | Database Port/Adapter Architecture | PRD-ALL | SDS-005, SDS-015 |
| ADR-013 | Storage Architecture | PRD-US03, US10 | SDS-006 |
| ADR-014 | Monitoring and Observability | PRD-ALL | SDS-013 |
| ADR-015 | Supabase Deployment Strategy | PRD-ALL | SDS-014 |
| ADR-016 | Graph Database with Oxigraph | PRD-US08, US11 | SDS-005, SDS-016 |

---

## Glossary

- **ADR**: Architecture Decision Record
- **RLS**: Row Level Security
- **JWT**: JSON Web Token
- **PKCE**: Proof Key for Code Exchange
- **HNSW**: Hierarchical Navigable Small World (indexing algorithm)
- **E2E**: End-to-End (testing)
- **TDD**: Test-Driven Development
- **PWA**: Progressive Web App
