# Weople

Weople is a synthetic, browser-local WebMCP demonstration of relationship intelligence: the site makes relationship context inspectable, ChatGPT can reason across narrowly exposed records, and the human retains final authority.

## Run locally

```bash
npm run serve
```

The site is intentionally dependency-free. Its demo mutations persist per browser under `weople.demo-state.v1`; **Reset demo** restores the canonical scenario.

## WebMCP implementation

`src/webmcp.js` feature-detects `document.modelContext.registerTool` and registers the six live site tools:

- `get_today_context`
- `get_person_context`
- `get_relationship_context`
- `create_intervention`
- `snooze_intervention`
- `update_relationship_policy`

All write tools call the same domain functions in `src/state.js` as the ordinary UI, so a WebMCP mutation immediately updates the view and browser-local state without a duplicate agent-only path.

## Verification

```bash
npm test
```
