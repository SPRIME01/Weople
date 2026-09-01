import test from "node:test";
import assert from "node:assert/strict";
import {
  createInitialState,
  createIntervention,
  getPersonContext,
  getTodayContext,
  loadState,
  resetState,
  saveState,
  snoozeIntervention,
  updateRelationshipPolicy,
} from "../src/state.js";

const mayaEvidence = ["maya-expansion-announcement", "maya-scaling-hypothesis", "maya-introduction-promise", "carlos-scaling-experience"];

function interventionInput() {
  return {
    person_id: "maya-chen",
    type: "introduction_opportunity",
    title: "Before tomorrow's meeting with Maya",
    why_now: "Maya's expansion makes operational scaling timely before your working session.",
    suggested_action: "Offer an introduction to Carlos if the problem is relevant to her.",
    evidence_refs: mayaEvidence,
    relevant_person_ids: ["carlos-rivera"],
    hypothesis: "The expansion may be creating operational scaling pressure.",
    confidence: "Moderate",
    timing: "Before tomorrow's meeting",
  };
}

test("canonical context holds evidence without precomputing the Maya/Carlos intervention", () => {
  const state = createInitialState();
  const today = getTodayContext(state);
  const maya = getPersonContext(state, "maya-chen");
  const carlos = getPersonContext(state, "carlos-rivera");
  assert.equal(state.interventions.length, 0);
  assert.ok(today.upcoming_interactions.some((item) => item.person_id === "maya-chen"));
  assert.ok(maya.unresolved_commitments.some((item) => item.id === "maya-introduction-promise"));
  assert.ok(maya.observed_facts.some((item) => item.id === "maya-expansion-announcement"));
  assert.ok(maya.hypotheses.some((item) => item.id === "maya-scaling-hypothesis"));
  assert.ok(carlos.observed_facts.some((item) => item.id === "carlos-scaling-experience"));
  assert.ok(today.hypotheses.some((item) => item.id === "maya-scaling-hypothesis"));
  assert.equal(today.snoozed_interventions.length, 0);
});

test("agent intervention has validated evidence and becomes visible state", () => {
  const initial = createInitialState();
  const result = createIntervention(initial, interventionInput());
  assert.equal(result.created, true);
  assert.equal(result.state.interventions.length, 1);
  assert.equal(result.intervention.provenance, "Surfaced by agent");
  assert.equal(result.intervention.status, "active");
});

test("snooze preserves the intervention and corrects only timing", () => {
  const created = createIntervention(createInitialState(), interventionInput());
  const snoozed = snoozeIntervention(created.state, created.intervention.id, "2030-01-02T09:00:00.000Z");
  assert.equal(snoozed.state.interventions.length, 1);
  assert.equal(snoozed.intervention.status, "snoozed");
  assert.equal(snoozed.intervention.snoozedUntil, "2030-01-02T09:00:00.000Z");
});

test("snooze rejects a past return time", () => {
  const created = createIntervention(createInitialState(), interventionInput());
  assert.throws(
    () => snoozeIntervention(created.state, created.intervention.id, "2000-01-02T09:00:00.000Z"),
    /must be in the future/,
  );
});

test("introduction policy keeps approval authority visible", () => {
  const updated = updateRelationshipPolicy(createInitialState(), "global", {
    rule: "introductions",
    value: "Never send introductions without my approval.",
    authority: "Human approval required",
  });
  assert.equal(updated.effectivePolicy.value, "Never send introductions without my approval.");
  assert.equal(updated.effectivePolicy.authority, "Human approval required");
});

test("reset restores the full mutable canonical state", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const created = createIntervention(createInitialState(), interventionInput());
  const updated = updateRelationshipPolicy(created.state, "global", {
    rule: "introductions",
    value: "Never send introductions without my approval.",
    authority: "Human approval required",
  });
  saveState(updated.state);
  const reset = resetState();
  assert.equal(reset.interventions.length, 0);
  assert.equal(reset.activity.length, 0);
  assert.deepEqual(reset.policies.personOverrides, {});
  assert.equal(reset.policies.global.introductions.value, "Require approval before any introduction is sent.");
  assert.equal(reset.demo.resetCount, undefined);
  assert.equal(loadState().interventions.length, 0);
});

test("an untouched stale seed is refreshed while a mutated state is preserved", () => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const stale = createInitialState();
  stale.demo.seedDate = "2000-01-01";
  saveState(stale);
  assert.notEqual(loadState().demo.seedDate, "2000-01-01");

  const mutated = createIntervention(stale, interventionInput()).state;
  saveState(mutated);
  assert.equal(loadState().interventions.length, 1);
});
