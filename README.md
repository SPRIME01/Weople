# Weople

Weople is a relationship-intelligence system for a specific failure mode: people intend to follow through, reconnect, or act on an opportunity, but the relevant person or commitment falls out of working memory before they act on it.

This is a WebMCP Challenge submission. It shows a small, complete version of that idea.

## Live demo

[Open Weople](https://weople-webmcp.jholmes07.chatgpt.site) — for WebMCP testing, open it in ChatGPT's built-in browser.

The human sees their relationship data through the Weople interface. ChatGPT sees the same structured data through WebMCP. The agent can notice connections across people, commitments, timing, and evidence that the human hasn't connected yet. The human retains authority over any action that affects another person.

## Why WebMCP

Without WebMCP, ChatGPT would have to infer relationship state from whatever text is visible on the page, or drive the UI directly. Instead, Weople exposes a small set of tools that represent the application's actual state and the actions it allows.

| Layer | Responsibility |
| --- | --- |
| Weople (site) | Holds the structured data: people, timing, evidence, commitments, interventions, authority policy |
| ChatGPT | Reasons over that data and surfaces connections |
| Human | Decides what matters, corrects timing, sets authority limits, approves any action that touches another person |

The site and the agent read and write the same application state. A WebMCP write changes the actual Weople workspace, not a simulated response.

## Demo

Uses synthetic people and records only. Start by selecting **Reset demo**.

The initial Today view includes:

- Maya Chen has a working session tomorrow.
- Northstar Labs announced a new facility.
- Weople has recorded a hypothesis: the expansion may create scaling or hiring pressure.
- The user previously promised Maya an introduction to someone with relevant scaling experience.
- Carlos Rivera recently helped another organization solve a similar scaling problem.

Weople does not precompute or display the Maya-Carlos connection up front.

### 1. Ask ChatGPT

With Weople open in ChatGPT's WebMCP-capable browser, ask:

> What am I missing today?

ChatGPT reads Weople's structured context through WebMCP and has to connect five separate things itself: Maya's meeting tomorrow, Northstar's expansion, the scaling-pressure hypothesis, Carlos's relevant experience, and the open introduction promise. Northstar's expansion is a recorded fact. The hiring pressure is a labeled inference. Carlos's experience is recorded evidence. The introduction is unresolved history. ChatGPT does the synthesis.

When ChatGPT calls `create_intervention`, the result appears immediately in the live Today view.

### 2. Correct timing and authority

Then tell ChatGPT:

> Snooze this until tomorrow morning, and for Maya, never prepare or send an introduction unless I explicitly approve it.

ChatGPT uses WebMCP to snooze the intervention and to create a Maya-specific introduction policy. Both changes show up in the same live Weople interface.

Snooze means "not now," not "bad recommendation." Approving one suggestion doesn't grant the agent standing authority over similar ones later.

## WebMCP tools

Weople registers six tools through `document.modelContext.registerTool`.

### Read-only

**`get_today_context`**
Structured context that may matter today or soon: upcoming interactions, unresolved commitments, recent observations, labeled hypotheses, active and snoozed interventions, related people, and timing. Does not return a precomputed instruction like "introduce Maya to Carlos" — the agent has to reason toward that itself.

**`get_person_context`**
Context for one person, with facts, hypotheses, unresolved commitments, upcoming interactions, related people, and current interventions kept separate.

**`get_relationship_context`**
Relationship history and connected context for a focal person and, optionally, a second related person. Keeps facts, hypotheses, commitments, and interactions distinct.

### Writes

**`create_intervention`**
Creates a user-facing intervention from the agent's conclusion. Visible immediately in Today, cites the Weople evidence it's based on, keeps facts and inferences separate, records which agent created it, and persists in browser-local demo state.

**`snooze_intervention`**
Removes an intervention from active attention until a specified time. A timing correction, not negative feedback. Visible immediately and persists across reloads.

**`update_relationship_policy`**
Updates an action-authority policy after an explicit user instruction. Policies can be global or specific to one person. Personalized communication and introductions still require human approval regardless of policy.

## Fact vs. inference

Weople keeps what's known separate from what's inferred, in both the UI and the WebMCP context.

Fact: Northstar Labs announced a new Durham facility.
Inference: The expansion may create operational scaling and hiring pressure.

An inference doesn't become a fact just because an agent used it in reasoning. Evidence and provenance stay inspectable from the intervention.

## Authority model

Weople separates preparing an action from taking it.

| Action | Authority |
| --- | --- |
| Personalized human-facing communication | Requires human approval |
| Introductions | Requires human approval |
| Low-risk personal workspace actions | Bounded autonomy allowed |

Trust in one situation doesn't extend the agent's authority to the next one. The user stays responsible for anything that touches another person.

## Architecture

Dependency-free static JavaScript app:

- Synthetic seed data, deterministic
- Browser-local persistence via `localStorage`
- Deterministic **Reset demo** action
- Demo dates generated relative to the current day
- Shared state/domain mutation functions
- WebMCP registration via `document.modelContext.registerTool`
- Static build deployed through ChatGPT Sites

```text
src/
├── app.js       Human-facing application and rendering
├── data.js      Canonical synthetic relationship state
├── state.js     Shared domain queries and mutations
└── webmcp.js    WebMCP tool definitions and registration

tests/
├── domain.test.js
└── webmcp.test.js
```
