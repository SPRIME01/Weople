import {
  createIntervention,
  interventionContext,
  getPersonContext,
  getRelationshipContext,
  getTodayContext,
  reconcileExpiredSnoozes,
  snoozeIntervention,
  updateRelationshipPolicy,
} from "./state.js";

const noExtra = { additionalProperties: false };

function success(result) {
  return { ok: true, ...result };
}

function failure(error) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    ok: false,
    error: message,
    error_type: error instanceof Error ? error.name : "Error",
    corrective_action: "Check the supplied IDs, required fields, and current Weople state, then retry with corrected input.",
  };
}

const personIds = ["maya-chen", "carlos-rivera", "elena-park", "jordan-brooks", "priya-nair", "marcus-green", "tasha-owens"];
const policyRules = ["personalized_communication", "introductions", "workspace_actions"];

export async function registerWeopleSiteTools({ getState, mutate, onStatus }) {
  const modelContext = document.modelContext;
  if (typeof modelContext?.registerTool !== "function") {
    onStatus({ available: false, tools: [], lastMutation: null, message: "WebMCP is unavailable in this browser." });
    return;
  }

  function readState() {
    const reconciled = reconcileExpiredSnoozes(getState());
    if (!reconciled.reconciled) return reconciled.state;
    return mutate(() => reconciled).state;
  }

  const tools = [
    {
      name: "get_today_context",
      description: "Read structured relationship reality that may matter today or soon: upcoming interactions, unresolved commitments, observed facts, explicitly labeled hypotheses, people references, and current intervention state. Synthesize opportunities from the evidence; this tool does not prescribe an introduction or precompute an answer.",
      inputSchema: { type: "object", properties: {}, ...noExtra },
      annotations: { readOnlyHint: true },
      execute: async () => success({ context: getTodayContext(readState()) }),
    },
    {
      name: "get_person_context",
      description: "Read one person's relationship context, keeping observed facts, hypotheses, unresolved commitments, interactions, and provenance separate.",
      inputSchema: {
        type: "object",
        properties: { person_id: { type: "string", enum: personIds, description: "The exact Weople person ID." } },
        required: ["person_id"],
        ...noExtra,
      },
      annotations: { readOnlyHint: true },
      execute: async ({ person_id }) => {
        try { return success({ context: getPersonContext(readState(), person_id) }); } catch (error) { return failure(error); }
      },
    },
    {
      name: "get_relationship_context",
      description: "Read relationship history and relevant connected context for one person, optionally comparing it with one related person. Facts, hypotheses, and commitments remain distinct.",
      inputSchema: {
        type: "object",
        properties: {
          person_id: { type: "string", enum: personIds, description: "The exact focal Weople person ID." },
          related_person_id: { type: "string", enum: personIds, description: "Optional exact connected person ID whose relevant context should be included." },
        },
        required: ["person_id"],
        ...noExtra,
      },
      annotations: { readOnlyHint: true },
      execute: async ({ person_id, related_person_id }) => {
        try { return success({ context: getRelationshipContext(readState(), person_id, related_person_id) }); } catch (error) { return failure(error); }
      },
    },
    {
      name: "create_intervention",
      description: "Create a user-facing Weople intervention from a reasoned conclusion. Side effect: it immediately appears in the live Today view, marked as surfaced by an agent. Include only evidence references that already exist in Weople. When an inference is used, provide its stored hypothesis_ref; Weople derives its wording and confidence from that record.",
      inputSchema: {
        type: "object",
        properties: {
          person_id: { type: "string", enum: personIds, description: "Exact ID of the person whose context anchors the intervention." },
          type: { type: "string", enum: ["introduction_opportunity"], description: "The supported intervention category for this vertical slice." },
          title: { type: "string", description: "Concise timing-oriented title shown to the user." },
          why_now: { type: "string", description: "Why this deserves attention now, based on timing and records." },
          suggested_action: { type: "string", description: "A proposed human action; never claim it has been sent or performed." },
          evidence_refs: { type: "array", minItems: 1, uniqueItems: true, items: { type: "string" }, description: "Unique IDs of existing facts, hypotheses, or commitments that support the intervention." },
          relevant_person_ids: { type: "array", uniqueItems: true, items: { type: "string", enum: personIds }, description: "Exact IDs of related people whose context is relevant." },
          sensitivity: { type: "string", enum: ["Standard", "Considerate"], description: "How carefully the opportunity should be framed." },
          hypothesis_ref: { type: "string", description: "Optional existing hypothesis ID. It must also appear in evidence_refs; Weople derives the hypothesis wording and confidence from it." },
          timing: { type: "string", description: "Timing rationale, for example Before tomorrow's meeting." },
        },
        required: ["person_id", "type", "title", "why_now", "suggested_action", "evidence_refs"],
        ...noExtra,
      },
      execute: async (input) => {
        try {
          const result = mutate((state) => createIntervention(state, input), "create_intervention");
          return success({
            intervention: interventionContext(result.state, result.intervention),
            created: result.created,
            persisted: true,
            visible_effect: result.created ? "A new highest-salience intervention is now visible at the top of Today." : "The equivalent intervention was already present in Today.",
            message: result.message,
          });
        } catch (error) { return failure(error); }
      },
    },
    {
      name: "snooze_intervention",
      description: "Snooze an existing intervention until a future ISO date-time. Side effect: the live Today surface immediately moves it from active attention into a visibly snoozed state, and the change persists after reload. Snoozing corrects timing; it is not negative relevance feedback.",
      inputSchema: {
        type: "object",
        properties: {
          intervention_id: { type: "string", description: "The existing Weople intervention ID." },
          snoozed_until: { type: "string", format: "date-time", description: "Future ISO 8601 date-time when the intervention should return to attention." },
        },
        required: ["intervention_id", "snoozed_until"],
        ...noExtra,
      },
      execute: async ({ intervention_id, snoozed_until }) => {
        try {
          const result = mutate((state) => snoozeIntervention(state, intervention_id, snoozed_until), "snooze_intervention");
          return success({ intervention: interventionContext(result.state, result.intervention), persisted: true, visible_effect: "Today now shows the intervention as held for later with its return time.", message: result.message });
        } catch (error) { return failure(error); }
      },
    },
    {
      name: "update_relationship_policy",
      description: "Update a relationship/action policy only after an explicit user instruction. Side effect: the effective policy changes immediately, persists after reload, appears in Policy, and is acknowledged on Today. Personalized communication and introductions cannot be weakened below human approval. For the canonical Maya instruction, use target 'maya-chen', rule 'introductions', label 'Introductions', value 'Never prepare or send an introduction for Maya unless I explicitly approve it.', and authority 'Human approval required'.",
      inputSchema: {
        type: "object",
        properties: {
          target: { type: "string", enum: ["global", ...personIds], description: "Either global or an exact Weople person ID for a person-specific override." },
          policy_change: {
            type: "object",
            properties: {
              rule: { type: "string", enum: policyRules, description: "The exact supported policy key." },
              value: { type: "string", description: "The exact resulting rule text." },
              authority: { type: "string", enum: ["Human approval required", "Low-risk only"], description: "The explicit authority boundary." },
              label: { type: "string", description: "Display label for the policy, for example Introductions." },
            },
            required: ["rule", "label", "value", "authority"],
            additionalProperties: false,
          },
        },
        required: ["target", "policy_change"],
        ...noExtra,
      },
      execute: async ({ target, policy_change }) => {
        try {
          const result = mutate((state) => updateRelationshipPolicy(state, target, policy_change), "update_relationship_policy");
          return success({ effective_policy: result.effectivePolicy, persisted: true, visible_effect: "The effective boundary is now visible in Policy and acknowledged on Today.", message: result.message });
        } catch (error) { return failure(error); }
      },
    },
  ];

  const status = { available: true, tools: [], lastMutation: null, message: "Registering WebMCP tools…" };
  onStatus(status);
  for (const tool of tools) {
    try {
      await modelContext.registerTool(tool);
      status.tools.push({ name: tool.name, registered: true, readOnly: Boolean(tool.annotations?.readOnlyHint) });
    } catch (error) {
      status.tools.push({ name: tool.name, registered: false, error: error instanceof Error ? error.message : String(error) });
    }
    onStatus({ ...status, tools: [...status.tools] });
  }
  status.message = status.tools.every((tool) => tool.registered)
    ? "All Weople site tools are registered."
    : "Some Weople site tools could not be registered.";
  onStatus({ ...status, tools: [...status.tools] });
}
