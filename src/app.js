import {
  evidenceRecords,
  loadState,
  resetState,
  saveState,
  snoozeIntervention,
} from "./state.js";
import { registerWeopleSiteTools } from "./webmcp.js";

const app = document.querySelector("#app");
let state = loadState();
const initialView = () => ({ name: "today", personId: "maya-chen", showDiagnostics: false, showEvidenceFor: null, dismissedHint: false });
let view = initialView();
let mcpStatus = { available: typeof document.modelContext?.registerTool === "function", tools: [], lastMutation: null, message: "Checking browser support…" };

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function person(id) {
  return state.people.find((item) => item.id === id);
}

function dateText(value, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat(undefined, options).format(new Date(value));
}

function timeText(value) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function relativeDate(value) {
  const target = new Date(value);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const delta = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta > 1 && delta < 8) return `In ${delta} days`;
  if (delta === -1) return "Yesterday";
  if (delta < 0) return `${Math.abs(delta)} days ago`;
  return dateText(value);
}

function navItem(name, label, icon) {
  return `<button class="nav-item ${view.name === name ? "is-active" : ""}" data-nav="${name}" aria-current="${view.name === name ? "page" : "false"}">
    <span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>
  </button>`;
}

function avatar(target, size = "") {
  return `<span class="avatar ${target.tone} ${size}" aria-hidden="true">${esc(target.initials)}</span>`;
}

function factRow(item) {
  return `<article class="evidence-row fact">
    <div class="evidence-type">Observed fact</div>
    <p>${esc(item.label)}</p>
    <span>${esc(item.source)} · ${dateText(item.observedAt)}</span>
  </article>`;
}

function hypothesisRow(item) {
  return `<article class="evidence-row hypothesis">
    <div class="evidence-type">Inference · ${esc(item.confidence)} confidence</div>
    <p>${esc(item.label)}</p>
    <span>${esc(item.basis)}</span>
  </article>`;
}

function commitmentRow(item) {
  return `<article class="evidence-row commitment">
    <div class="evidence-type">Unresolved commitment</div>
    <p>${esc(item.label)}</p>
    <span>${esc(item.source)} · noted ${dateText(item.madeAt)}</span>
  </article>`;
}

function interventionCard(intervention, { compact = false } = {}) {
  const focal = person(intervention.personId);
  const relatedNames = intervention.relevantPersonIds.map((id) => person(id)?.name).filter(Boolean).join(" · ");
  const isSnoozed = intervention.status === "snoozed";
  return `<article class="intervention-card ${isSnoozed ? "is-snoozed" : ""}" data-intervention="${intervention.id}">
    <div class="intervention-topline">
      <span class="eyebrow ${isSnoozed ? "snoozed-label" : ""}">${isSnoozed ? `Snoozed until ${dateText(intervention.snoozedUntil, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : esc(intervention.timing)}</span>
      <span class="agent-provenance">${esc(intervention.provenance)}</span>
    </div>
    <div class="intervention-person">${avatar(focal, "small")}<span>${esc(focal.name)}</span></div>
    <h3>${esc(intervention.title)}</h3>
    ${compact ? "" : `<div class="intervention-detail"><span>Why now</span><p>${esc(intervention.whyNow)}</p></div>
    ${intervention.hypothesis ? `<div class="intervention-detail inference"><span>Inference · ${esc(intervention.confidence)}</span><p>${esc(intervention.hypothesis)}</p></div>` : ""}
    ${relatedNames ? `<div class="intervention-detail"><span>Opportunity</span><p>${esc(relatedNames)} has context that may be relevant.</p></div>` : ""}
    <div class="intervention-detail"><span>Suggested action</span><p>${esc(intervention.suggestedAction)}</p></div>`}
    <div class="card-actions">
      <button class="button button-quiet" data-evidence="${intervention.id}">View evidence</button>
      <button class="button button-quiet" data-explore="${intervention.personId}">Open ${esc(focal.name)}</button>
      ${!isSnoozed ? `<button class="button button-quiet" data-snooze="${intervention.id}">Snooze</button>` : ""}
    </div>
  </article>`;
}

function attentionItem({ person: target, label, detail, action, eventName, tone }) {
  return `<article class="attention-item">
    ${avatar(target, "small")}
    <div class="attention-copy"><span class="eyebrow">${esc(tone)}</span><strong>${esc(label)}</strong><p>${esc(detail)}</p></div>
    ${action ? `<button class="text-button" data-${eventName}="${target.id}">${esc(action)}</button>` : ""}
  </article>`;
}

function todayView() {
  const maya = person("maya-chen");
  const elena = person("elena-park");
  const marcus = person("marcus-green");
  const active = state.interventions.filter((item) => item.status === "active");
  const snoozed = state.interventions.filter((item) => item.status === "snoozed");
  const latestActivity = state.activity[0];
  const policyChange = latestActivity?.kind === "policy_updated"
    ? state.policies.global[latestActivity.rule]
    : null;
  return `<section class="view today-view" aria-labelledby="today-heading">
    <div class="page-heading">
      <div><p class="page-kicker">${new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p><h1 id="today-heading">Good morning.</h1><p class="lede">The right human possibility, back in attention at the right time.</p></div>
    </div>
    ${!view.dismissedHint ? `<aside class="chatgpt-hint"><div><span class="hint-mark">✦</span><strong>Notice alongside ChatGPT</strong><p>Ask <button data-dismiss-hint="true" class="inline-prompt">“What am I missing today?”</button> while this page is open.</p></div><button class="close-hint" data-dismiss-hint="true" aria-label="Dismiss hint">×</button></aside>` : ""}
    ${policyChange ? `<aside class="state-change-note" role="status" aria-live="polite"><span>Policy updated</span><strong>${esc(policyChange.label)}</strong><p>${esc(policyChange.value)}</p></aside>` : ""}
    ${active.length ? `<section class="interventions-section" aria-labelledby="noticed-heading" aria-live="polite"><div class="section-heading"><p class="eyebrow">Newly noticed</p><h2 id="noticed-heading">Worth your attention</h2></div><div class="intervention-list">${active.map((item) => interventionCard(item)).join("")}</div></section>` : ""}
    ${snoozed.length ? `<section class="snoozed-section" aria-live="polite"><div class="section-heading"><p class="eyebrow">Held for later</p><h2>Timing corrected</h2></div>${snoozed.map((item) => interventionCard(item, { compact: true })).join("")}</section>` : ""}
    <section class="attention-section" aria-labelledby="day-ahead-heading"><div class="section-heading"><p class="eyebrow">The day ahead</p><h2 id="day-ahead-heading">Context, not a queue</h2></div>
      <div class="attention-list">
        ${attentionItem({ person: maya, label: "Northstar working session", detail: `${relativeDate(maya.upcoming[0].startsAt)} · ${timeText(maya.upcoming[0].startsAt)} · It has been about six weeks since you and Maya last had a meaningful conversation.`, action: "Open context", eventName: "person", tone: relativeDate(maya.upcoming[0].startsAt) })}
        ${attentionItem({ person: maya, label: "A promise still open", detail: "You told Maya you would introduce her to someone with scaling experience.", action: "Review", eventName: "person", tone: "Continuity" })}
        ${attentionItem({ person: elena, label: "Elena’s birthday is approaching", detail: `${relativeDate(elena.upcoming[0].startsAt)} · She begins a new role next week. A small note could carry more than usual.`, action: "Open", eventName: "person", tone: "Personal moment" })}
        ${attentionItem({ person: marcus, label: "Triangle Makers supper", detail: `${relativeDate(marcus.upcoming[0].startsAt)} · A small community gathering.`, action: "Open", eventName: "person", tone: "Upcoming" })}
      </div>
    </section>
  </section>`;
}

function peopleView() {
  return `<section class="view" aria-labelledby="people-heading"><div class="page-heading"><div><p class="page-kicker">Relationship world</p><h1 id="people-heading">People, held with context.</h1><p class="lede">Not a pipeline. A living, personal map of what has mattered and what may matter next.</p></div></div>
  <div class="people-grid">${state.people.map((target) => `<button class="person-card" data-person="${target.id}">
    <div class="person-card-header">${avatar(target)}<span class="person-arrow">↗</span></div>
    <h2>${esc(target.name)}</h2><p class="relationship">${esc(target.relationship)}</p><p class="person-summary">${esc(target.summary)}</p>
    <div class="person-card-footer"><span>${target.upcoming[0] ? `${relativeDate(target.upcoming[0].startsAt)} · ${timeText(target.upcoming[0].startsAt)}` : `Meaningful conversation ${relativeDate(target.lastMeaningfulInteraction)}`}</span></div>
  </button>`).join("")}</div></section>`;
}

function personView(target) {
  const personInterventions = state.interventions.filter((item) => item.personId === target.id);
  return `<section class="view person-view" aria-labelledby="person-heading">
    <button class="back-button" data-nav="people">← People</button>
    <header class="person-hero"><div class="person-identity">${avatar(target, "large")}<div><p class="page-kicker">${esc(target.relationship)}</p><h1 id="person-heading">${esc(target.name)}</h1><p>${esc(target.company)} · ${esc(target.location)}</p></div></div><p class="person-hero-summary">${esc(target.summary)}</p></header>
    <div class="detail-grid">
      <div class="detail-main">
        ${target.upcoming.length ? `<section class="detail-section"><div class="section-heading"><p class="eyebrow">Upcoming</p><h2>In view</h2></div>${target.upcoming.map((item) => `<div class="upcoming-card"><span>${esc(item.kind)}</span><strong>${esc(item.label)}</strong><p>${relativeDate(item.startsAt)} · ${dateText(item.startsAt)} at ${timeText(item.startsAt)}</p></div>`).join("")}</section>` : ""}
        ${target.facts.length ? `<section class="detail-section"><div class="section-heading"><p class="eyebrow">What is known</p><h2>Observed records</h2></div>${target.facts.map(factRow).join("")}</section>` : ""}
        ${target.hypotheses.length ? `<section class="detail-section"><div class="section-heading"><p class="eyebrow">What may be true</p><h2>Inferences, kept separate</h2></div>${target.hypotheses.map(hypothesisRow).join("")}</section>` : ""}
        ${target.commitments.length ? `<section class="detail-section"><div class="section-heading"><p class="eyebrow">Continuity</p><h2>Open threads</h2></div>${target.commitments.map(commitmentRow).join("")}</section>` : ""}
      </div>
      <aside class="detail-aside">
        <section class="aside-card"><p class="eyebrow">Relationship cadence</p><strong>Last meaningful conversation</strong><p>${dateText(target.lastMeaningfulInteraction, { month: "long", day: "numeric" })} · ${relativeDate(target.lastMeaningfulInteraction)}</p></section>
        ${target.relatedPeople.length ? `<section class="aside-card"><p class="eyebrow">Related people</p>${target.relatedPeople.map((id) => { const related = person(id); return `<button class="related-person" data-person="${id}">${avatar(related, "small")}<span><strong>${esc(related.name)}</strong><small>${esc(related.relationship)}</small></span><b>→</b></button>`; }).join("")}</section>` : ""}
        ${personInterventions.length ? `<section class="aside-card"><p class="eyebrow">Agent-surfaced</p>${personInterventions.map((item) => `<div class="intervention-mini"><strong>${esc(item.title)}</strong><span>${item.status === "snoozed" ? "Snoozed" : "In attention"}</span></div>`).join("")}</section>` : ""}
      </aside>
    </div>
  </section>`;
}

function policyView() {
  const entries = Object.entries(state.policies.global);
  const overrides = Object.entries(state.policies.personOverrides);
  const latestActivity = state.activity[0];
  return `<section class="view policy-view" aria-labelledby="policy-heading"><div class="page-heading"><div><p class="page-kicker">Authority & trust</p><h1 id="policy-heading">Your judgment stays in the loop.</h1><p class="lede">Weople can surface context and prepare work. Meaningful human-facing action stays with you.</p></div></div>
  <section class="policy-intro"><span class="policy-shield">♢</span><div><strong>Effective policy</strong><p>These boundaries apply to the synthetic demo. They are inspectable by you and available to an agent only when you direct it to act.</p></div></section>
  <div class="policy-list" aria-live="polite">${entries.map(([key, policy]) => `<article class="policy-card ${latestActivity?.kind === "policy_updated" && latestActivity.rule === key ? "is-updated" : ""}"><div><p class="eyebrow">${esc(policy.authority)}</p><h2>${esc(policy.label)}</h2><p>${esc(policy.value)}</p></div><span class="authority-label">${policy.authority === "Human approval required" ? "Approval required" : "Bounded autonomy"}</span></article>`).join("")}</div>
  ${overrides.length ? `<section class="detail-section"><div class="section-heading"><p class="eyebrow">Person-specific</p><h2>Overrides</h2></div>${overrides.map(([personId, rules]) => `<article class="override-card"><strong>${esc(person(personId).name)}</strong>${Object.values(rules).map((rule) => `<p>${esc(rule.label)}: ${esc(rule.value)}</p>`).join("")}</article>`).join("")}</section>` : ""}
  <p class="policy-updated">Last policy update ${dateText(state.policies.lastUpdated, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.</p></section>`;
}

function evidenceDialog() {
  const intervention = state.interventions.find((item) => item.id === view.showEvidenceFor);
  if (!intervention) return "";
  const records = evidenceRecords(state, intervention);
  return `<div class="modal-backdrop" data-close-evidence="true"><section class="modal evidence-modal" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onclick="event.stopPropagation()"><button class="modal-close" data-close-evidence="true" aria-label="Close evidence">×</button><p class="page-kicker">Evidence & provenance</p><h2 id="evidence-title">${esc(intervention.title)}</h2><p class="modal-lede">The intervention is grounded in these separate records. Weople does not turn an inference into a fact.</p>${records.map((record) => record.kind === "fact" ? factRow(record) : record.kind === "hypothesis" ? hypothesisRow(record) : commitmentRow(record)).join("")}</section></div>`;
}

function diagnosticsDialog() {
  if (!view.showDiagnostics) return "";
  const tools = mcpStatus.tools.length ? mcpStatus.tools.map((tool) => `<li><span class="tool-status ${tool.registered ? "okay" : "failed"}"></span><code>${esc(tool.name)}</code><small>${tool.registered ? (tool.readOnly ? "Read only" : "Writes live state") : esc(tool.error || "Not registered")}</small></li>`).join("") : "<li><small>No tools have registered in this browser.</small></li>";
  return `<div class="modal-backdrop" data-close-diagnostics="true"><section class="modal diagnostics-modal" role="dialog" aria-modal="true" aria-labelledby="diagnostics-title" onclick="event.stopPropagation()"><button class="modal-close" data-close-diagnostics="true" aria-label="Close diagnostics">×</button><p class="page-kicker">Demo diagnostics</p><h2 id="diagnostics-title">WebMCP site tools</h2><div class="diagnostic-summary"><span class="status-dot ${mcpStatus.available ? "okay" : "failed"}"></span><div><strong>${mcpStatus.available ? "Browser interface detected" : "Browser interface unavailable"}</strong><p>${esc(mcpStatus.message)}</p></div></div><ul class="tool-list">${tools}</ul>${mcpStatus.lastMutation ? `<div class="last-mutation"><p class="eyebrow">Last site-tool mutation</p><strong>${esc(mcpStatus.lastMutation)}</strong></div>` : ""}<p class="diagnostic-note">In a supported ChatGPT browser, open the Site tools control in the address bar to inspect registrations and recent calls.</p></section></div>`;
}

function shell() {
  const activeView = view.name === "today" ? todayView() : view.name === "people" ? peopleView() : view.name === "policy" ? policyView() : personView(person(view.personId));
  return `<div class="app-shell"><aside class="sidebar"><a class="wordmark" href="#" data-nav="today" aria-label="Weople home"><span class="wordmark-mark">w</span><span>weople</span></a><nav aria-label="Primary navigation">${navItem("today", "Today", "✦")}${navItem("people", "People", "◌")}${navItem("policy", "Policy", "⌁")}</nav><div class="sidebar-bottom"><span class="demo-badge">Synthetic demo</span><button class="reset-button" data-reset-demo="true">Reset demo</button></div></aside><main class="main-content"><header class="topbar"><span class="mobile-wordmark">weople</span><div class="topbar-actions"><span class="synthetic-label">All data is synthetic</span><button class="diagnostics-button" data-open-diagnostics="true" aria-label="Open WebMCP diagnostics">⌘</button></div></header>${activeView}</main><nav class="mobile-nav" aria-label="Primary navigation">${navItem("today", "Today", "✦")}${navItem("people", "People", "◌")}${navItem("policy", "Policy", "⌁")}</nav></div>${evidenceDialog()}${diagnosticsDialog()}`;
}

function render() {
  app.innerHTML = shell();
  wireEvents();
  if (view.showDiagnostics || view.showEvidenceFor) app.querySelector(".modal-close")?.focus();
}

function updateState(next, mutationName = null) {
  saveState(next);
  state = next;
  if (mutationName) mcpStatus = { ...mcpStatus, lastMutation: mutationName };
  render();
}

function mutate(transform, mutationName) {
  const result = transform(state);
  updateState(result.state, mutationName);
  return result;
}

function snoozeUntilTomorrowMorning(id) {
  mutate((current) => snoozeIntervention(current, id, current.transient.canonicalTomorrowMorning), "snooze_intervention");
}

function wireEvents() {
  document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => { view = { ...view, name: button.dataset.nav }; render(); }));
  document.querySelectorAll("[data-person]").forEach((button) => button.addEventListener("click", () => { view = { ...view, name: "person", personId: button.dataset.person }; render(); }));
  document.querySelectorAll("[data-explore]").forEach((button) => button.addEventListener("click", () => { view = { ...view, name: "person", personId: button.dataset.explore }; render(); }));
  document.querySelectorAll("[data-evidence]").forEach((button) => button.addEventListener("click", () => { view = { ...view, showEvidenceFor: button.dataset.evidence }; render(); }));
  document.querySelectorAll("[data-close-evidence]").forEach((button) => button.addEventListener("click", () => { view = { ...view, showEvidenceFor: null }; render(); }));
  document.querySelectorAll("[data-open-diagnostics]").forEach((button) => button.addEventListener("click", () => { view = { ...view, showDiagnostics: true }; render(); }));
  document.querySelectorAll("[data-close-diagnostics]").forEach((button) => button.addEventListener("click", () => { view = { ...view, showDiagnostics: false }; render(); }));
  document.querySelectorAll("[data-reset-demo]").forEach((button) => button.addEventListener("click", () => { state = resetState(); view = initialView(); mcpStatus = { ...mcpStatus, lastMutation: null }; render(); }));
  document.querySelectorAll("[data-snooze]").forEach((button) => button.addEventListener("click", () => snoozeUntilTomorrowMorning(button.dataset.snooze)));
  document.querySelectorAll("[data-dismiss-hint]").forEach((button) => button.addEventListener("click", () => { view = { ...view, dismissedHint: true }; render(); }));
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || (!view.showDiagnostics && !view.showEvidenceFor)) return;
  view = { ...view, showDiagnostics: false, showEvidenceFor: null };
  render();
});

render();

registerWeopleSiteTools({
  getState: () => state,
  mutate,
  onStatus: (nextStatus) => { mcpStatus = nextStatus; if (view.showDiagnostics) render(); },
});
