# Weople — Copilot Instructions (AI Agent On‑Ramp)

## 0) What this is

Weople is a **professional relationship management platform** with web + mobile clients, a Supabase-backed data layer, and AI-powered insights. This repo is an **Nx monorepo** with shared libraries and platform-specific apps.

## 1) Must‑read context (in order)

1. `docs/specs/adr.md` — architectural decisions and non‑negotiable constraints.
2. `docs/specs/prd.md` — product goals, user stories, acceptance criteria.
3. `docs/specs/sds.md` — technical design mapped to PRD + ADRs.
4. `docs/plans/*` — phased implementation roadmap (see Phase 5 for advanced features).
5. `README.md` and `libs/shared/data-access/README.md` — repo usage and data-access examples.

If something conflicts, **ADRs win**. ADR‑011 supersedes ADR‑006 for AI routing. Flag any conflicts you find.

## 2) Intended state (from PRD/SDS/ADR)

- **Apps**: `apps/web` (SvelteKit 5 + Svelte 5 runes), `apps/mobile` (React Native + Expo SDK 52), `apps/api` for backend entrypoints.
- **Core features**: contact management, interaction tracking, follow‑ups, relationship health, AI enrichment, opportunities, analytics, network graph.
- **Phase 5 (docs/plans/05‑phase‑advanced‑features.md)**: opportunity pipeline, network graph (Oxigraph), contact import, duplicates/merge, dashboards/analytics.
- **Testing strategy**: Vitest (web/shared), Jest (mobile), Playwright (web E2E), Maestro (mobile E2E), **80%+ coverage** target (ADR‑009).

## 3) Architecture & boundaries (non‑negotiable)

- **Nx layout** (ADR‑001):
  - `apps/` entrypoints
  - `libs/shared/` cross‑platform
  - `libs/web/` web features
  - `libs/mobile/` mobile features
  - `libs/tools/` tooling
- **Layering rules** (ADR‑003):
  - Feature libs depend on shared libs only.
  - Shared libs **never** depend on feature libs.
  - `types`/`utils` are dependency‑free.
  - `data-access` depends on `types` + `utils` only.
  - `ui` depends on `types` + `utils` only.

## 4) Data, AI, and infra specifics

- **Supabase** for Auth + Postgres only (ADR‑002, ADR‑004): RLS everywhere, JWT auth, PKCE for OAuth.
- **Edge Functions** (Deno) for server logic; avoid putting business logic in clients.
- **Storage**: self‑hosted S3 (Garage) preferred; Cloudflare R2 as backup (ADR‑013). **Do not** use Supabase Storage.
- **AI routing** (ADR‑011): LiteLLM gateway with fallback chain **local → self‑hosted → OpenAI**. Cost controls: **$5/user/month** budget.
- **Embeddings/vector**: schema expects **1536‑dim** embeddings (ADR‑005), but ADR‑011 prefers **self‑hosted sentence‑transformers**. If you change embedding size, update DB schema + indexes and call it out.
- **Port/Adapter** (ADR‑012): all DB types must go through ports + adapters in `libs/shared/data-access`.
  - Relational: PostgreSQL (Supabase)
  - Graph: Oxigraph (ADR‑016)
  - Vector: Qdrant or Milvus
  - Object storage: Garage

## 5) Dev workflow & Nx expectations

- Prefer **Nx** for all tasks. Run through `bunx nx ...`.
- Use Nx MCP tools when analyzing workspace or project structure.
- Common commands:
  - `bunx nx graph`
  - `bunx nx show project <project> --web`
  - `bunx nx affected --target=lint,test,build`
- Use `.env.local`; never commit secrets. Supabase service keys stay out of git.

## 6) Implementation conventions

- **Data access**: use services in `libs/shared/data-access` (see README). Follow caching + retry patterns (ADR‑004).
- **Realtime**: Supabase Realtime subscriptions with optimistic UI + reconnection (ADR‑008).
- **Offline‑first**: queue writes and sync later; web uses localStorage/IndexedDB/OPFS, mobile uses AsyncStorage/SQLite (ADR‑010).
- **Observability**: OpenTelemetry + OpenObserve + self‑hosted Sentry (ADR‑014).

## 7) When making changes

- Keep ADRs aligned; if a change violates an ADR, **call it out explicitly**.
- Update README in the affected lib/app if behavior or APIs change.
- Add/adjust Nx targets when introducing new workflows (e2e, build, etc.).
- Preserve backward compatibility for shared libs, or add migration notes.

## Quick reference snippets

- Dependency graph: `bunx nx graph`
- Affected tests/builds: `bunx nx affected --target=test,build`
- Single project tests: `bunx nx test <project>`
- Show targets: `bunx nx show project <project> --web`
