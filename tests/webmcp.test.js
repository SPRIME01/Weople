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
    hypothesis: "The expansion may be creating operational scaling or hiring pressure.",
    confidence: "Moderate",
    timing: "Before tomorrow’s meeting",
  };
}

test("registers the exact six top-level tools with read-only annotations", async () => {
  const registered = [];
  globalThis.document = { modelContext: { registerTool: async (tool) => registered.push(tool) } };
  const statuses = [];
  await registerWeopleSiteTools({ getState: createInitialState, mutate: () => assert.fail("read test must not mutate"), onStatus: (status) => statuses.push(status) });
  assert.deepEqual(registered.map((tool) => tool.name), expectedTools);
  assert.equal(registered.filter((tool) => tool.annotations?.readOnlyHint).length, 3);
  assert.match(statuses.at(-1).message, /All Weople site tools are registered/);
});

test("canonical WebMCP writes mutate one shared live state and return verifiable effects", async () => {
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

  const created = await registered.get("create_intervention").execute(canonicalIntervention());
  assert.equal(created.ok, true);
  assert.equal(created.persisted, true);
  assert.equal(state.interventions[0].status, "active");

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const snoozed = await registered.get("snooze_intervention").execute({ intervention_id: created.intervention.id, snoozed_until: tomorrow });
  assert.equal(snoozed.ok, true);
  assert.equal(state.interventions[0].status, "snoozed");

  const policy = await registered.get("update_relationship_policy").execute({
    target: "global",
    policy_change: { rule: "introductions", value: "Never send introductions without my approval.", authority: "Human approval required" },
  });
  assert.equal(policy.ok, true);
  assert.equal(state.policies.global.introductions.value, "Never send introductions without my approval.");

  const today = await registered.get("get_today_context").execute({});
  assert.equal(today.context.active_interventions.length, 0);
  assert.equal(today.context.snoozed_interventions.length, 1);
});

test("degrades without WebMCP and reports useful validation errors", async () => {
  globalThis.document = {};
  const statuses = [];
  await registerWeopleSiteTools({ getState: createInitialState, mutate: () => {}, onStatus: (status) => statuses.push(status) });
  assert.equal(statuses.at(-1).available, false);

  const registered = new Map();
  globalThis.document = { modelContext: { registerTool: async (tool) => registered.set(tool.name, tool) } };
  await registerWeopleSiteTools({ getState: createInitialState, mutate: (transform) => transform(createInitialState()), onStatus: () => {} });
  const failed = await registered.get("get_person_context").execute({ person_id: "not-a-person" });
  assert.equal(failed.ok, false);
  assert.match(failed.error, /Unknown person/);
  assert.match(failed.corrective_action, /IDs/);
});
