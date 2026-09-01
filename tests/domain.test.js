import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialState,
  createIntervention,
  getPersonContext,
  getTodayContext,
  loadState,
  reconcileExpiredSnoozes,
  resetState,
  saveState,
  snoozeIntervention,
  updateRelationshipPolicy,
} from "../src/state.js";

const mayaEvidence = ["maya-expansion-announcement", "maya-scaling-hypothesis", "maya-introduction-promise", "carlos-scaling-experience"];

function interventionInput(overrides = {}) {
  return {
    person_id: "maya-chen",
    type: "introduction_opportunity",
    title: "Before tomorrow's meeting with Maya",
    why_now: "Maya's expansion makes operational scaling timely before your working session.",
    suggested_action: "Offer an introduction to Carlos if the problem is relevant to her.",
    evidence_refs: mayaEvidence,
    relevant_person_ids: ["carlos-rivera"],
    hypothesis_ref: "maya-scaling-hypothesis",
    timing: "Before tomorrow's meeting",
    ...overrides,
  };
}

test("canonical context holds evidence without a Maya/Carlos intervention", () => {
  const state = createInitialState();
  const today = getTodayContext(state);
  const maya = getPersonContext(state, "maya-chen");
  const carlos = getPersonContext(state, "carlos-rivera");
  assert.equal(state.interventions.length, 0);
  assert.equal(today.active_interventions.length, 0);
  assert.ok(today.upcoming_interactions.some((item) => item.person_id === "maya-chen"));
  assert.ok(maya.unresolved_commitments.some((item) => item.id === "maya-introduction-promise"));
  assert.ok(maya.observed_facts.some((item) => item.id === "maya-expansion-announcement"));
  assert.ok(maya.hypotheses.some((item) => item.id === "maya-scaling-hypothesis"));
  assert.ok(carlos.observed_facts.some((item) => item.id === "carlos-scaling-experience"));
});

test("canonical intervention derives its hypothesis from stored evidence", () => {
  const result = createIntervention(createInitialState(), interventionInput());
  assert.equal(result.created, true);
  assert.equal(result.state.interventions.length, 1);
  assert.equal(result.intervention.provenance, "Surfaced by agent");
  assert.equal(result.intervention.hypothesisRef, "maya-scaling-hypothesis");
  assert.equal(result.intervention.hypothesis, "The new facility may create operational scaling and hiring pressure.");
  assert.equal(result.intervention.confidence, "Moderate");
});

test("forged hypothesis text or confidence cannot bypass stored provenance", () => {
  assert.throws(
    () => createIntervention(createInitialState(), interventionInput({
      hypothesis: "Maya is definitely hiring immediately.",
      confidence: "High",
    })),
    /derived from hypothesis_ref/,
  );
});

test("snooze remains a timing correction before expiry", () => {
  const created = createIntervention(createInitialState(), interventionInput());
  const returnAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const snoozed = snoozeIntervention(created.state, created.intervention.id, returnAt);
  const beforeExpiry = reconcileExpiredSnoozes(snoozed.state, Date.now() + 60 * 60 * 1000);
  assert.equal(beforeExpiry.reconciled, false);
  assert.equal(beforeExpiry.state.interventions[0].status, "snoozed");
  assert.equal(beforeExpiry.state.interventions[0].id, created.intervention.id);
  assert.match(snoozed.message, /timing was corrected/);
});

test("expired snooze returns the same intervention to active attention", () => {
  const created = createIntervention(createInitialState(), interventionInput());
  const returnAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const snoozed = snoozeIntervention(created.state, created.intervention.id, returnAt);
  const afterExpiry = reconcileExpiredSnoozes(snoozed.state, Date.parse(returnAt) + 1);
  assert.equal(afterExpiry.reconciled, true);
  assert.equal(afterExpiry.state.interventions.length, 1);
  assert.equal(afterExpiry.state.interventions[0].id, created.intervention.id);
  assert.equal(afterExpiry.state.interventions[0].status, "active");
  assert.equal(afterExpiry.state.interventions[0].snoozedUntil, null);
  assert.equal(getTodayContext(afterExpiry.state).active_interventions[0].id, created.intervention.id);
});

test("state load reconciles and persists expired snoozes", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const created = createIntervention(createInitialState(), interventionInput());
  const expired = structuredClone(created.state);
  expired.interventions[0].status = "snoozed";
  expired.interventions[0].snoozedUntil = new Date(Date.now() - 60_000).toISOString();
  saveState(expired);
  const loaded = loadState();
  assert.equal(loaded.interventions[0].id, created.intervention.id);
  assert.equal(loaded.interventions[0].status, "active");
  assert.equal(JSON.parse(memory.get("weople.demo-state.v1")).interventions[0].status, "active");
});

test("Maya-specific introductions policy override is preserved separately from the global default", () => {
  const updated = updateRelationshipPolicy(createInitialState(), "maya-chen", {
    rule: "introductions",
    label: "Introductions",
    value: "Never prepare or send an introduction for Maya unless I explicitly approve it.",
    authority: "Human approval required",
  });
  assert.equal(updated.effectivePolicy.scope, "person");
  assert.equal(updated.effectivePolicy.person_name, "Maya Chen");
  assert.equal(updated.state.policies.personOverrides["maya-chen"].introductions.value, "Never prepare or send an introduction for Maya unless I explicitly approve it.");
  assert.equal(updated.state.policies.global.introductions.value, "Require approval before any introduction is sent.");
});

test("protected introduction and personalized communication authority cannot be weakened", () => {
  const initial = createInitialState();
  const before = structuredClone(initial.policies);
  assert.throws(
    () => updateRelationshipPolicy(initial, "global", {
      rule: "introductions",
      label: "Introductions",
      value: "Allow introductions automatically.",
      authority: "Low-risk only",
    }),
    /exceeds the user's allowed boundary/,
  );
  assert.throws(
    () => updateRelationshipPolicy(initial, "maya-chen", {
      rule: "personalized_communication",
      label: "Personalized communication",
      value: "Send automatically.",
      authority: "Low-risk only",
    }),
    /exceeds the user's allowed boundary/,
  );
  assert.deepEqual(initial.policies, before);
});

test("workspace actions retain their bounded authority", () => {
  const updated = updateRelationshipPolicy(createInitialState(), "global", {
    rule: "workspace_actions",
    label: "Personal workspace actions",
    value: "Low-risk organizational actions may be performed with more autonomy.",
    authority: "Low-risk only",
  });
  assert.equal(updated.effectivePolicy.authority, "Low-risk only");
});

test("reset removes interventions, activity, and person-specific policy overrides", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const created = createIntervention(createInitialState(), interventionInput());
  const updated = updateRelationshipPolicy(created.state, "maya-chen", {
    rule: "introductions",
    label: "Introductions",
    value: "Never prepare or send an introduction for Maya unless I explicitly approve it.",
    authority: "Human approval required",
  });
  saveState(updated.state);
  const reset = resetState();
  assert.equal(reset.interventions.length, 0);
  assert.equal(reset.activity.length, 0);
  assert.deepEqual(reset.policies.personOverrides, {});
  assert.equal(reset.policies.global.introductions.value, "Require approval before any introduction is sent.");
  assert.equal(loadState().interventions.length, 0);
});

test("snooze rejects a past return time", () => {
  const created = createIntervention(createInitialState(), interventionInput());
  assert.throws(
    () => snoozeIntervention(created.state, created.intervention.id, "2000-01-02T09:00:00.000Z"),
    /must be in the future/,
  );
});
