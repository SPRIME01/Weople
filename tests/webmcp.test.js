import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { registerWeopleSiteTools } from "../src/webmcp.js";

const expectedTools = [
  "get_today_context",
  "get_person_context",
  "get_relationship_context",
  "create_intervention",
  "snooze_intervention",
  "update_relationship_policy",
];

function canonicalIntervention() {
  return {
    person_id: "maya-chen",
    type: "introduction_opportunity",
    title: "Before tomorrow’s meeting with Maya",
    why_now: "Maya’s meeting is tomorrow, Northstar has announced expansion, and the introduction promise remains unresolved.",
    suggested_action: "Offer an introduction to Carlos if Maya confirms that scaling support would help.",
    evidence_refs: ["maya-expansion-announcement", "maya-scaling-hypothesis", "maya-introduction-promise", "carlos-scaling-experience"],
    relevant_person_ids: ["carlos-rivera"],
    sensitivity: "Considerate",
    hypothesis_ref: "maya-scaling-hypothesis",
    timing: "Before tomorrow’s meeting",
  };
}

async function registerWithState() {
  const registered = new Map();
  globalThis.document = { modelContext: { registerTool: async (tool) => registered.set(tool.name, tool) } };
  let state = createInitialState();
  await registerWeopleSiteTools({
    getState: () => state,
    mutate: (transform) => {
      const result = transform(state);
      state = result.state;
      return result;
    },
    onStatus: () => {},
  });
  return { registered, get state() { return state; } };
}

test("registers the exact six top-level tools, three read-only, with provenance-constrained schemas", async () => {
  const registered = [];
  globalThis.document = { modelContext: { registerTool: async (tool) => registered.push(tool) } };
  const statuses = [];
  await registerWeopleSiteTools({ getState: createInitialState, mutate: () => assert.fail("read test must not mutate"), onStatus: (status) => statuses.push(status) });
  assert.deepEqual(registered.map((tool) => tool.name), expectedTools);
  assert.equal(registered.filter((tool) => tool.annotations?.readOnlyHint).length, 3);
  const createSchema = registered.find((tool) => tool.name === "create_intervention").inputSchema.properties;
  assert.ok(createSchema.hypothesis_ref);
  assert.equal(createSchema.hypothesis, undefined);
  assert.equal(createSchema.confidence, undefined);
  assert.match(statuses.at(-1).message, /All Weople site tools are registered/);
});

test("canonical WebMCP writes mutate one shared live state with a Maya-specific policy override", async () => {
  const session = await registerWithState();
  const created = await session.registered.get("create_intervention").execute(canonicalIntervention());
  assert.equal(created.ok, true);
  assert.equal(created.persisted, true);
  assert.equal(session.state.interventions[0].status, "active");
  assert.equal(created.intervention.hypothesis_ref, "maya-scaling-hypothesis");
  assert.equal(created.intervention.confidence, "Moderate");

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const snoozed = await session.registered.get("snooze_intervention").execute({ intervention_id: created.intervention.id, snoozed_until: tomorrow });
  assert.equal(snoozed.ok, true);
  assert.equal(session.state.interventions[0].status, "snoozed");

  const policy = await session.registered.get("update_relationship_policy").execute({
    target: "maya-chen",
    policy_change: {
      rule: "introductions",
      label: "Introductions",
      value: "Never prepare or send an introduction for Maya unless I explicitly approve it.",
      authority: "Human approval required",
    },
  });
  assert.equal(policy.ok, true);
  assert.equal(policy.effective_policy.scope, "person");
  assert.equal(session.state.policies.personOverrides["maya-chen"].introductions.value, "Never prepare or send an introduction for Maya unless I explicitly approve it.");
  assert.equal(session.state.policies.global.introductions.value, "Require approval before any introduction is sent.");

  const today = await session.registered.get("get_today_context").execute({});
  assert.equal(today.context.active_interventions.length, 0);
  assert.equal(today.context.snoozed_interventions.length, 1);
});

test("WebMCP rejects attempts to weaken protected authority", async () => {
  const session = await registerWithState();
  const before = structuredClone(session.state.policies);
  const failed = await session.registered.get("update_relationship_policy").execute({
    target: "maya-chen",
    policy_change: {
      rule: "introductions",
      label: "Introductions",
      value: "Allow introductions automatically.",
      authority: "Low-risk only",
    },
  });
  assert.equal(failed.ok, false);
  assert.match(failed.error, /exceeds the user's allowed boundary/);
  assert.deepEqual(session.state.policies, before);
});

test("degrades without WebMCP and reports useful validation errors", async () => {
  globalThis.document = {};
  const statuses = [];
  await registerWeopleSiteTools({ getState: createInitialState, mutate: () => {}, onStatus: (status) => statuses.push(status) });
  assert.equal(statuses.at(-1).available, false);

  const session = await registerWithState();
  const failed = await session.registered.get("get_person_context").execute({ person_id: "not-a-person" });
  assert.equal(failed.ok, false);
  assert.match(failed.error, /Unknown person/);
  assert.match(failed.corrective_action, /IDs/);
});
