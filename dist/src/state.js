import { createCanonicalSeed } from "./data.js";

export const STORAGE_KEY = "weople.demo-state.v1";
const HUMAN_APPROVAL_REQUIRED = "Human approval required";
const LOW_RISK_ONLY = "Low-risk only";
const PROTECTED_AUTHORITY_RULES = new Set(["personalized_communication", "introductions"]);

let idSequence = 0;

function clone(value) {
  return structuredClone(value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeId(prefix) {
  idSequence += 1;
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${Date.now().toString(36)}-${idSequence.toString(36)}-${random}`;
}

function isStructurallyValid(state) {
  return state?.schemaVersion === 2
    && Array.isArray(state.people)
    && Array.isArray(state.interventions)
    && Array.isArray(state.activity)
    && state.people.some((person) => person.id === "maya-chen")
    && state.people.some((person) => person.id === "carlos-rivera")
    && state.policies?.global?.introductions
    && typeof state.demo?.seedDate === "string";
}

function isUntouchedCanonicalState(state) {
  return state.interventions.length === 0
    && state.activity.length === 0
    && Object.keys(state.policies?.personOverrides || {}).length === 0
    && state.policies.global.introductions.value === "Require approval before any introduction is sent.";
}

function personById(state, personId) {
  const person = state.people.find((candidate) => candidate.id === personId);
  assert(person, `Unknown person: ${personId}`);
  return person;
}

function evidenceFor(state, references = []) {
  const records = [];
  for (const reference of references) {
    for (const person of state.people) {
      const fact = person.facts.find((item) => item.id === reference);
      if (fact) records.push({ person_id: person.id, kind: "fact", ...fact });
      const hypothesis = person.hypotheses.find((item) => item.id === reference);
      if (hypothesis) records.push({ person_id: person.id, kind: "hypothesis", ...hypothesis });
      const commitment = person.commitments.find((item) => item.id === reference);
      if (commitment) records.push({ person_id: person.id, kind: "commitment", ...commitment });
    }
  }
  return records;
}

function makeActivity(kind, label, details = {}) {
  return {
    id: makeId("activity"),
    kind,
    label,
    at: new Date().toISOString(),
    ...details,
  };
}

export function createInitialState() {
  return createCanonicalSeed();
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialState();
    const parsed = JSON.parse(saved);
    if (!isStructurallyValid(parsed)) return createInitialState();
    if (isUntouchedCanonicalState(parsed) && parsed.demo.seedDate !== localDateKey()) return createInitialState();
    const reconciled = reconcileExpiredSnoozes(parsed);
    if (reconciled.reconciled) saveState(reconciled.state);
    return reconciled.state;
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const next = createInitialState();
  saveState(next);
  return next;
}

export function reconcileExpiredSnoozes(state, now = Date.now()) {
  const nowMs = now instanceof Date ? now.getTime() : typeof now === "number" ? now : Date.parse(now);
  assert(!Number.isNaN(nowMs), "A valid reconciliation time is required.");
  const hasExpiredSnooze = state.interventions.some(
    (item) => item.status === "snoozed" && item.snoozedUntil && Date.parse(item.snoozedUntil) <= nowMs,
  );
  if (!hasExpiredSnooze) return { state, reconciled: false };

  const next = clone(state);
  next.interventions.forEach((item) => {
    if (item.status === "snoozed" && item.snoozedUntil && Date.parse(item.snoozedUntil) <= nowMs) {
      item.status = "active";
      item.snoozedUntil = null;
    }
  });
  return { state: next, reconciled: true };
}

export function getTodayContext(state) {
  const current = reconcileExpiredSnoozes(state).state;
  const todayItems = current.people.flatMap((person) =>
    person.upcoming.map((interaction) => ({
      person_id: person.id,
      person_name: person.name,
      relationship: person.relationship,
      ...interaction,
    })),
  );

  return {
    temporal_context: {
      now: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      note: "All people, events, and records in this demo are synthetic.",
    },
    upcoming_interactions: todayItems,
    unresolved_commitments: current.people.flatMap((person) =>
      person.commitments
        .filter((commitment) => commitment.status === "Unresolved")
        .map((commitment) => ({ person_id: person.id, person_name: person.name, ...commitment })),
    ),
    recent_observations: current.people.flatMap((person) =>
      person.facts.map((fact) => ({ person_id: person.id, person_name: person.name, ...fact })),
    ),
    hypotheses: current.people.flatMap((person) =>
      person.hypotheses.map((hypothesis) => ({ person_id: person.id, person_name: person.name, ...hypothesis })),
    ),
    active_interventions: current.interventions
      .filter((item) => item.status === "active")
      .map((item) => interventionContext(current, item)),
    snoozed_interventions: current.interventions
      .filter((item) => item.status === "snoozed")
      .map((item) => interventionContext(current, item)),
    relevant_people: current.people.map(({ id, name, relationship, company }) => ({ id, name, relationship, company })),
  };
}

export function getPersonContext(state, personId) {
  const current = reconcileExpiredSnoozes(state).state;
  const person = personById(current, personId);
  return {
    person: {
      id: person.id,
      name: person.name,
      relationship: person.relationship,
      company: person.company,
      summary: person.summary,
      last_meaningful_interaction: person.lastMeaningfulInteraction,
    },
    upcoming_interactions: person.upcoming,
    observed_facts: person.facts,
    hypotheses: person.hypotheses,
    unresolved_commitments: person.commitments.filter((item) => item.status === "Unresolved"),
    related_people: person.relatedPeople.map((id) => {
      const related = personById(current, id);
      return { id: related.id, name: related.name, relationship: related.relationship, company: related.company };
    }),
    active_interventions: current.interventions
      .filter((item) => item.personId === personId && item.status === "active")
      .map((item) => interventionContext(current, item)),
  };
}

export function getRelationshipContext(state, personId, relatedPersonId) {
  const current = reconcileExpiredSnoozes(state).state;
  const person = personById(current, personId);
  const related = relatedPersonId ? personById(current, relatedPersonId) : null;
  return {
    focal_person: {
      id: person.id,
      name: person.name,
      relationship: person.relationship,
      last_meaningful_interaction: person.lastMeaningfulInteraction,
    },
    related_person: related
      ? { id: related.id, name: related.name, relationship: related.relationship, company: related.company }
      : null,
    relationship_history: {
      unresolved_commitments: person.commitments.filter((item) => item.status === "Unresolved"),
      observed_facts: person.facts,
      hypotheses: person.hypotheses,
      upcoming_interactions: person.upcoming,
      related_context: related
        ? { observed_facts: related.facts, hypotheses: related.hypotheses, relationship: related.relationship }
        : null,
    },
    evidence_note: "Observed facts, hypotheses, and commitments are returned as distinct record types.",
  };
}

export function createIntervention(state, input) {
  assert(input && typeof input === "object", "Intervention input is required.");
  assert(typeof input.person_id === "string", "person_id is required.");
  assert(typeof input.type === "string", "type is required.");
  assert(typeof input.title === "string" && input.title.trim(), "title is required.");
  assert(typeof input.why_now === "string" && input.why_now.trim(), "why_now is required.");
  assert(typeof input.suggested_action === "string" && input.suggested_action.trim(), "suggested_action is required.");
  const person = personById(state, input.person_id);
  const evidenceRefs = Array.isArray(input.evidence_refs) ? input.evidence_refs : [];
  assert(evidenceRefs.length > 0, "At least one evidence reference is required.");
  assert(new Set(evidenceRefs).size === evidenceRefs.length, "evidence_refs must not contain duplicates.");
  const evidence = evidenceFor(state, evidenceRefs);
  assert(evidence.length === evidenceRefs.length, "One or more evidence references are invalid.");
  let hypothesis = null;
  let confidence = null;
  let hypothesisRef = null;
  if (input.hypothesis_ref !== undefined) {
    assert(typeof input.hypothesis_ref === "string" && input.hypothesis_ref.trim(), "hypothesis_ref must be an existing hypothesis ID.");
    assert(evidenceRefs.includes(input.hypothesis_ref), "hypothesis_ref must also appear in evidence_refs.");
    const storedHypothesis = evidence.find((item) => item.id === input.hypothesis_ref && item.kind === "hypothesis");
    assert(storedHypothesis, "hypothesis_ref must reference a stored hypothesis.");
    assert(input.hypothesis === undefined && input.confidence === undefined, "Hypothesis text and confidence are derived from hypothesis_ref and cannot be supplied directly.");
    hypothesisRef = storedHypothesis.id;
    hypothesis = storedHypothesis.label;
    confidence = storedHypothesis.confidence;
  } else {
    assert(input.hypothesis === undefined && input.confidence === undefined, "Use hypothesis_ref for a stored hypothesis; free-text hypothesis and confidence are not accepted.");
  }
  const relevantPersonIds = Array.isArray(input.relevant_person_ids) ? input.relevant_person_ids : [];
  assert(new Set(relevantPersonIds).size === relevantPersonIds.length, "relevant_person_ids must not contain duplicates.");
  relevantPersonIds.forEach((id) => personById(state, id));

  const duplicate = state.interventions.find(
    (item) => item.personId === person.id && item.title.trim().toLowerCase() === input.title.trim().toLowerCase() && item.status !== "dismissed",
  );
  if (duplicate) {
    return { state, intervention: duplicate, created: false, message: "Equivalent intervention already exists." };
  }

  const intervention = {
    id: makeId("intervention"),
    personId: person.id,
    type: input.type,
    title: input.title.trim(),
    whyNow: input.why_now.trim(),
    suggestedAction: input.suggested_action.trim(),
    evidenceRefs,
    relevantPersonIds,
    sensitivity: input.sensitivity || "Standard",
    hypothesisRef,
    hypothesis,
    confidence,
    timing: input.timing || "Timely",
    status: "active",
    snoozedUntil: null,
    provenance: "Surfaced by agent",
    createdAt: new Date().toISOString(),
  };
  const next = clone(state);
  next.interventions.unshift(intervention);
  next.activity.unshift(makeActivity("intervention_created", `Surfaced an intervention for ${person.name}.`, { interventionId: intervention.id }));
  return { state: next, intervention, created: true, message: "Intervention created and visible in Today." };
}

export function snoozeIntervention(state, interventionId, snoozedUntil) {
  assert(typeof interventionId === "string", "intervention_id is required.");
  assert(typeof snoozedUntil === "string" && !Number.isNaN(Date.parse(snoozedUntil)), "snoozed_until must be an ISO date-time.");
  assert(Date.parse(snoozedUntil) > Date.now(), "snoozed_until must be in the future.");
  const next = clone(state);
  const intervention = next.interventions.find((item) => item.id === interventionId);
  assert(intervention, `Unknown intervention: ${interventionId}`);
  intervention.status = "snoozed";
  intervention.snoozedUntil = new Date(snoozedUntil).toISOString();
  next.activity.unshift(makeActivity("intervention_snoozed", `Snoozed “${intervention.title}”.`, { interventionId }));
  return { state: next, intervention, message: "Intervention snoozed; timing was corrected without rejecting its relevance." };
}

export function updateRelationshipPolicy(state, target, policyChange) {
  assert(typeof target === "string" && target.trim(), "target is required.");
  assert(policyChange && typeof policyChange === "object", "policy_change is required.");
  assert(typeof policyChange.rule === "string", "policy_change.rule is required.");
  assert(typeof policyChange.value === "string" && policyChange.value.trim(), "policy_change.value is required.");
  const baseRule = state.policies.global[policyChange.rule];
  assert(baseRule, `Unknown policy rule: ${policyChange.rule}`);
  const authority = policyChange.authority || baseRule.authority;
  assert([HUMAN_APPROVAL_REQUIRED, LOW_RISK_ONLY].includes(authority), "authority must be Human approval required or Low-risk only.");
  if (PROTECTED_AUTHORITY_RULES.has(policyChange.rule)) {
    assert(
      authority === HUMAN_APPROVAL_REQUIRED,
      `The requested authority exceeds the user's allowed boundary: ${policyChange.rule} must remain Human approval required.`,
    );
  }
  const next = clone(state);
  const updatedAt = new Date().toISOString();
  let effectivePolicy;

  if (target === "global") {
    const rule = next.policies.global[policyChange.rule];
    rule.value = policyChange.value.trim();
    rule.authority = authority;
    effectivePolicy = { scope: "global", rule: policyChange.rule, ...rule };
  } else {
    const person = personById(next, target);
    next.policies.personOverrides[target] ??= {};
    next.policies.personOverrides[target][policyChange.rule] = {
      label: policyChange.label || baseRule.label,
      value: policyChange.value.trim(),
      authority,
      updatedAt,
    };
    effectivePolicy = { scope: "person", person_id: person.id, person_name: person.name, rule: policyChange.rule, ...next.policies.personOverrides[target][policyChange.rule] };
  }
  next.policies.lastUpdated = updatedAt;
  next.activity.unshift(makeActivity("policy_updated", `Updated the ${effectivePolicy.label} policy.`, { target, rule: policyChange.rule }));
  return { state: next, effectivePolicy, message: "Policy updated and visible in Settings." };
}

export function evidenceRecords(state, intervention) {
  return evidenceFor(state, intervention.evidenceRefs);
}

export function interventionContext(state, intervention) {
  const focal = personById(state, intervention.personId);
  return {
    id: intervention.id,
    person_id: focal.id,
    person_name: focal.name,
    type: intervention.type,
    title: intervention.title,
    why_now: intervention.whyNow,
    suggested_action: intervention.suggestedAction,
    evidence: evidenceFor(state, intervention.evidenceRefs),
    relevant_people: intervention.relevantPersonIds.map((id) => {
      const related = personById(state, id);
      return { id: related.id, name: related.name, relationship: related.relationship };
    }),
    hypothesis: intervention.hypothesis,
    hypothesis_ref: intervention.hypothesisRef || null,
    confidence: intervention.confidence,
    timing: intervention.timing,
    status: intervention.status,
    snoozed_until: intervention.snoozedUntil,
    provenance: intervention.provenance,
    created_at: intervention.createdAt,
  };
}
