import {
  evidenceRecords,
  loadState,
  reconcileExpiredSnoozes,
  resetState,
  saveState,
  snoozeIntervention,
} from "./state.js";
import { registerWeopleSiteTools } from "./webmcp.js";

const app = document.querySelector("#app");
let state = loadState();
const CHATGPT_PROMPT = "What am I missing today?";
let copyConfirmationTimer = null;
const initialView = () => ({ name: "today", personId: "maya-chen", showDiagnostics: false, showEvidenceFor: null, dismissedHint: false, promptStatus: null });
let view = initialView();
let mcpStatus = { available: typeof document.modelContext?.registerTool === "function", tools: [], lastMutation: null, message: "Checking if ChatGPT can connect…" };
let lastActiveElement = null;

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
    ${relatedNames ? `<div class="intervention-detail"><span>Relevant person</span><p>${esc(relatedNames)} has context that may help.</p></div>` : ""}
    <div class="intervention-detail"><span>Next step</span><p>${esc(intervention.suggestedAction)}</p></div>`}
    <div class="card-actions">
      <button class="button button-primary" data-explore="${intervention.personId}">Open ${esc(focal.name)}</button>
      <button class="button button-quiet" data-evidence="${intervention.id}">View evidence</button>
      ${!isSnoozed ? `<button class="button button-quiet" data-snooze="${intervention.id}" aria-label="Snooze until tomorrow morning">Snooze until tomorrow</button>` : ""}
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
    ? latestActivity.target === "global"
      ? state.policies.global[latestActivity.rule]
      : state.policies.personOverrides[latestActivity.target]?.[latestActivity.rule]
    : null;
  const emptyToday = active.length === 0 && snoozed.length === 0;
  return `<section class="view today-view" aria-labelledby="today-heading">
    <div class="page-heading">
      <div><p class="page-kicker">${new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p><h1 id="today-heading">Good morning.</h1><p class="lede">The right human possibility, back in attention at the right time.</p></div>
    </div>
    ${!view.dismissedHint ? `<aside class="chatgpt-hint"><div><span class="hint-mark">✦</span><strong>Try this with ChatGPT</strong><p>With this page open, ask ChatGPT <span class="prompt-text">“${CHATGPT_PROMPT}”</span> to surface a connection. <button type="button" class="copy-prompt" data-copy-prompt="true">Copy prompt</button><span class="copy-confirmation" role="status">${view.promptStatus || ""}</span></p></div><button class="close-hint" data-dismiss-hint="true" aria-label="Dismiss hint">×</button></aside>` : ""}
    ${policyChange ? `<aside class="state-change-note" role="status" aria-live="polite"><span>Policy updated</span><strong>${esc(policyChange.label)}</strong><p>${esc(policyChange.value)}</p></aside>` : ""}
    ${active.length ? `<section class="interventions-section" aria-labelledby="noticed-heading" aria-live="polite"><div class="section-heading"><h2 id="noticed-heading">Worth your attention</h2><span class="section-count" aria-label="${active.length} intervention${active.length === 1 ? "" : "s"}">${active.length}</span></div><div class="intervention-list">${active.map((item) => interventionCard(item)).join("")}</div></section>` : ""}
    ${snoozed.length ? `<section class="snoozed-section" aria-live="polite"><div class="section-heading"><h2>Timing corrected</h2></div>${snoozed.map((item) => interventionCard(item, { compact: true })).join("")}</section>` : ""}
    ${emptyToday ? `<section class="empty-state" aria-live="polite"><div class="empty-state-copy"><h2>No interventions yet</h2><p>When ChatGPT notices a connection across your people, promises, and timing, it will appear here. Try asking <span class="prompt-text">“${CHATGPT_PROMPT}”</span> while this page is open.</p></div></section>` : ""}
    <section class="attention-section" aria-labelledby="day-ahead-heading"><div class="section-heading"><h2 id="day-ahead-heading">Context, not a queue</h2></div>
      <div class="attention-list">
        ${attentionItem({ person: maya, label: "Northstar working session", detail: `${relativeDate(maya.upcoming[0].startsAt)} · ${timeText(maya.upcoming[0].startsAt)} · It has been about six weeks since you and Maya last had a meaningful conversation.`, action: "Open Maya Chen", eventName: "person", tone: relativeDate(maya.upcoming[0].startsAt) })}
        ${attentionItem({ person: maya, label: "A promise still open", detail: "You told Maya you would introduce her to someone with scaling experience. That promise has not been marked complete.", action: "View Maya Chen", eventName: "person", tone: "Unresolved promise" })}
        ${attentionItem({ person: elena, label: "Elena’s birthday is approaching", detail: `${relativeDate(elena.upcoming[0].startsAt)} · She begins a new role next week. A small note could carry more than usual.`, action: "Open Elena Park", eventName: "person", tone: "Personal moment" })}
        ${attentionItem({ person: marcus, label: "Triangle Makers supper", detail: `${relativeDate(marcus.upcoming[0].startsAt)} · A small community gathering.`, action: "Open Marcus Green", eventName: "person", tone: "Upcoming" })}
      </div>
    </section>
  </section>`;
}

function peopleView() {
  return `<section class="view" aria-labelledby="people-heading"><div class="page-heading"><div><p class="page-kicker">Relationship world</p><h1 id="people-heading">People, held with context.</h1><p class="lede">Not a pipeline. A living, personal map of what has mattered and what may matter next.</p></div></div>
  <div class="people-grid">${state.people.map((target) => `<button class="person-card" data-person="${target.id}" aria-label="Open ${esc(target.name)}, ${esc(target.relationship)}">
    <div class="person-card-header">${avatar(target)}<span class="person-arrow" aria-hidden="true">↗</span></div>
    <span class="card-title">${esc(target.name)}</span><p class="relationship">${esc(target.relationship)}</p><p class="person-summary">${esc(target.summary)}</p>
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
        ${target.upcoming.length ? `<section class="detail-section"><div class="section-heading"><h2>In view</h2></div>${target.upcoming.map((item) => `<div class="upcoming-card"><span>${esc(item.kind)}</span><strong>${esc(item.label)}</strong><p>${relativeDate(item.startsAt)} · ${dateText(item.startsAt)} at ${timeText(item.startsAt)}</p></div>`).join("")}</section>` : ""}
        ${target.facts.length ? `<section class="detail-section"><div class="section-heading"><p class="eyebrow">What is known</p><h2>Observed records</h2></div><ul class="evidence-list" role="list">${target.facts.map((item) => `<li>${factRow(item)}</li>`).join("")}</ul></section>` : ""}
        ${target.hypotheses.length ? `<section class="detail-section"><div class="section-heading"><p class="eyebrow">What may be true</p><h2>Inferences, kept separate</h2></div><ul class="evidence-list" role="list">${target.hypotheses.map((item) => `<li>${hypothesisRow(item)}</li>`).join("")}</ul></section>` : ""}
        ${target.commitments.length ? `<section class="detail-section"><div class="section-heading"><h2>Open threads</h2></div><ul class="evidence-list" role="list">${target.commitments.map((item) => `<li>${commitmentRow(item)}</li>`).join("")}</ul></section>` : ""}
      </div>
      <aside class="detail-aside">
        <section class="aside-card"><p class="eyebrow">When you last connected</p><strong>Last meaningful conversation</strong><p>${dateText(target.lastMeaningfulInteraction, { month: "long", day: "numeric" })} · ${relativeDate(target.lastMeaningfulInteraction)}</p></section>
        ${target.relatedPeople.length ? `<section class="aside-card"><p class="eyebrow">People connected to ${esc(target.name.split(" ")[0])}</p>${target.relatedPeople.map((id) => { const related = person(id); return `<button class="related-person" data-person="${id}">${avatar(related, "small")}<span><strong>${esc(related.name)}</strong><small>${esc(related.relationship)}</small></span><b aria-hidden="true">→</b></button>`; }).join("")}</section>` : ""}
        ${personInterventions.length ? `<section class="aside-card"><p class="eyebrow">Suggested by ChatGPT</p>${personInterventions.map((item) => `<div class="intervention-mini"><strong>${esc(item.title)}</strong><span>${item.status === "snoozed" ? "Snoozed until tomorrow" : "Awaiting your review"}</span></div>`).join("")}</section>` : ""}
      </aside>
    </div>
  </section>`;
}

function policyView() {
  const entries = Object.entries(state.policies.global);
  const overrides = Object.entries(state.policies.personOverrides);
  const latestActivity = state.activity[0];
  return `<section class="view policy-view" aria-labelledby="policy-heading"><div class="page-heading"><div><p class="page-kicker">Authority & trust</p><h1 id="policy-heading">Your judgment stays in the loop.</h1><p class="lede">Weople can surface context and prepare work. Any message to another person needs your approval.</p></div></div>
  <section class="policy-intro"><span class="policy-shield" aria-hidden="true">♢</span><div><strong>What is allowed</strong><p>These rules are visible to you and to ChatGPT. ChatGPT may only act within them, and only when you tell it to.</p></div></section>
  <div class="policy-list" aria-live="polite">${entries.map(([key, policy]) => `<article class="policy-card ${latestActivity?.kind === "policy_updated" && latestActivity.rule === key ? "is-updated" : ""}"><div><p class="eyebrow">${esc(policy.authority)}</p><h2>${esc(policy.label)}</h2><p>${esc(policy.value)}</p></div><span class="authority-label">${policy.authority === "Human approval required" ? "Approval required" : "Bounded autonomy"}</span></article>`).join("")}</div>
  ${overrides.length ? `<section class="detail-section"><div class="section-heading"><h2>Overrides</h2></div>${overrides.map(([personId, rules]) => `<article class="override-card"><strong>${esc(person(personId).name)}</strong>${Object.values(rules).map((rule) => `<p><b>${esc(rule.label)}</b>: ${esc(rule.value)} <span>${esc(rule.authority)}</span></p>`).join("")}</article>`).join("")}</section>` : ""}
  <p class="policy-updated">Last policy update ${dateText(state.policies.lastUpdated, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.</p></section>`;
}

function evidenceDialog() {
  const intervention = state.interventions.find((item) => item.id === view.showEvidenceFor);
  if (!intervention) return "";
  const records = evidenceRecords(state, intervention);
  return `<div class="modal-backdrop" data-close-evidence="true"><section class="modal evidence-modal" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onclick="event.stopPropagation()"><button class="modal-close" data-close-evidence="true" aria-label="Close evidence">×</button><p class="page-kicker">Why this was suggested</p><h2 id="evidence-title">${esc(intervention.title)}</h2><p class="modal-lede">Evidence stays separate. Facts are what was observed. Inferences are hypotheses, even when used to suggest this. Check each record below.</p><ul class="evidence-list" role="list">${records.map((record) => `<li>${record.kind === "fact" ? factRow(record) : record.kind === "hypothesis" ? hypothesisRow(record) : commitmentRow(record)}</li>`).join("")}</ul></section></div>`;
}

function diagnosticsDialog() {
  if (!view.showDiagnostics) return "";
  const tools = mcpStatus.tools.length ? mcpStatus.tools.map((tool) => `<li><span class="tool-status ${tool.registered ? "okay" : "failed"}"></span><code>${esc(tool.name)}</code><small>${tool.registered ? (tool.readOnly ? "Read only" : "Writes live state") : esc(tool.error || "Not registered")}</small></li>`).join("") : "<li><small>No tools have registered in this browser.</small></li>";
  return `<div class="modal-backdrop" data-close-diagnostics="true"><section class="modal diagnostics-modal" role="dialog" aria-modal="true" aria-labelledby="diagnostics-title" onclick="event.stopPropagation()"><button class="modal-close" data-close-diagnostics="true" aria-label="Close diagnostics">×</button><p class="page-kicker">How this demo works</p><h2 id="diagnostics-title">ChatGPT connection</h2><div class="diagnostic-summary"><span class="status-dot ${mcpStatus.available ? "okay" : "failed"}"></span><div><strong>${mcpStatus.available ? "ChatGPT can read this page" : "ChatGPT cannot read this page here"}</strong><p>${esc(mcpStatus.message)}</p></div></div><ul class="tool-list">${tools}</ul>${mcpStatus.lastMutation ? `<div class="last-mutation"><p class="eyebrow">Last change made by ChatGPT</p><strong>${esc(mcpStatus.lastMutation)}</strong></div>` : ""}<p class="diagnostic-note">In ChatGPT, use the Site tools control in the address bar to see what ChatGPT can read and what it last changed.</p></section></div>`;
}

function shell() {
  const activeView = view.name === "today" ? todayView() : view.name === "people" ? peopleView() : view.name === "policy" ? policyView() : personView(person(view.personId));
  return `<a class="skip-link" href="#main">Skip to content</a><div class="app-shell"><aside class="sidebar"><a class="wordmark" href="#" data-nav="today" aria-label="Weople home"><span class="wordmark-mark" aria-hidden="true">w</span><span>weople</span></a><nav aria-label="Primary navigation">${navItem("today", "Today", "✦")}${navItem("people", "People", "◌")}${navItem("policy", "Policy", "⌁")}</nav><div class="sidebar-bottom"><span class="demo-badge">Synthetic demo</span><button class="reset-button" data-reset-demo="true">Reset demo</button></div></aside><main id="main" class="main-content" tabindex="-1"><header class="topbar"><span class="mobile-wordmark" aria-hidden="true">weople</span><div class="topbar-actions"><span class="synthetic-label">All data is synthetic</span><button class="diagnostics-button" data-open-diagnostics="true" aria-label="Open WebMCP diagnostics">⌘</button></div></header>${activeView}</main><nav class="mobile-nav" aria-label="Primary navigation (mobile)">${navItem("today", "Today", "✦")}${navItem("people", "People", "◌")}${navItem("policy", "Policy", "⌁")}</nav></div>${evidenceDialog()}${diagnosticsDialog()}`;
}

function trapFocus(event) {
  if (!view.showDiagnostics && !view.showEvidenceFor) return;
  if (event.key !== "Tab") return;
  const modal = document.querySelector(".modal");
  if (!modal) return;
  const focusable = [...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function render() {
  const reconciled = reconcileExpiredSnoozes(state);
  if (reconciled.reconciled) {
    state = reconciled.state;
    saveState(state);
  }
  const wasModalOpen = !!(view.showDiagnostics || view.showEvidenceFor);
  // capture trigger before re-render
  if (!wasModalOpen) lastActiveElement = document.activeElement;
  app.innerHTML = shell();
  const main = document.getElementById("main");
  const shellEl = document.querySelector(".app-shell");
  const isModalOpen = !!(view.showDiagnostics || view.showEvidenceFor);
  if (shellEl) {
    if (isModalOpen) {
      shellEl.setAttribute("inert", "");
      shellEl.setAttribute("aria-hidden", "true");
    } else {
      shellEl.removeAttribute("inert");
      shellEl.removeAttribute("aria-hidden");
    }
  }
  if (isModalOpen) {
    document.body.style.overflow = "hidden";
    app.querySelector(".modal-close")?.focus();
  } else {
    document.body.style.overflow = "";
    if (lastActiveElement instanceof HTMLElement && document.contains(lastActiveElement)) {
      // restore only if we closed a modal this render (heuristic: wasModalOpen was false before but now false -> no restore)
    }
  }
  // move focus to main on navigation (skip-link target helper)
  if (!isModalOpen && main && view.name) {
    // keep main focusable but don't steal focus on every render; only after nav via click (handled in delegate)
  }
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

async function copyPrompt() {
  let copied = false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(CHATGPT_PROMPT);
      copied = true;
    } catch {
      copied = false;
    }
  }
  if (!copied) {
    const temporaryField = document.createElement("textarea");
    temporaryField.value = CHATGPT_PROMPT;
    temporaryField.setAttribute("readonly", "");
    temporaryField.style.position = "fixed";
    temporaryField.style.opacity = "0";
    document.body.append(temporaryField);
    temporaryField.select();
    copied = document.execCommand("copy");
    temporaryField.remove();
  }
  if (!copied) return;
  view = { ...view, promptStatus: "Copied" };
  render();
  clearTimeout(copyConfirmationTimer);
  copyConfirmationTimer = setTimeout(() => {
    view = { ...view, promptStatus: null };
    render();
  }, 1600);
}

// Single delegated listener — replaces 12 querySelectorAll loops per render
function handleAppClick(event) {
  const target = event.target.closest("[data-nav], [data-person], [data-explore], [data-evidence], [data-close-evidence], [data-open-diagnostics], [data-close-diagnostics], [data-reset-demo], [data-snooze], [data-copy-prompt], [data-dismiss-hint]");
  if (!target) {
    // backdrop click already handled via data-close-* on backdrop itself; but clicks on backdrop without inner target still need close
    if (event.target.hasAttribute("data-close-evidence")) {
      view = { ...view, showEvidenceFor: null };
      if (lastActiveElement instanceof HTMLElement) lastActiveElement.focus();
      render();
    } else if (event.target.hasAttribute("data-close-diagnostics")) {
      view = { ...view, showDiagnostics: false };
      if (lastActiveElement instanceof HTMLElement) lastActiveElement.focus();
      render();
    }
    return;
  }
  if (target.hasAttribute("data-nav")) {
    view = { ...view, name: target.dataset.nav };
    render();
    document.getElementById("main")?.focus({ preventScroll: true });
    return;
  }
  if (target.hasAttribute("data-person")) {
    view = { ...view, name: "person", personId: target.dataset.person };
    render();
    document.getElementById("main")?.focus({ preventScroll: true });
    return;
  }
  if (target.hasAttribute("data-explore")) {
    view = { ...view, name: "person", personId: target.dataset.explore };
    render();
    document.getElementById("main")?.focus({ preventScroll: true });
    return;
  }
  if (target.hasAttribute("data-evidence")) {
    lastActiveElement = document.activeElement;
    view = { ...view, showEvidenceFor: target.dataset.evidence };
    render();
    return;
  }
  if (target.hasAttribute("data-close-evidence")) {
    view = { ...view, showEvidenceFor: null };
    render();
    if (lastActiveElement instanceof HTMLElement) lastActiveElement.focus();
    return;
  }
  if (target.hasAttribute("data-open-diagnostics")) {
    lastActiveElement = document.activeElement;
    view = { ...view, showDiagnostics: true };
    render();
    return;
  }
  if (target.hasAttribute("data-close-diagnostics")) {
    view = { ...view, showDiagnostics: false };
    render();
    if (lastActiveElement instanceof HTMLElement) lastActiveElement.focus();
    return;
  }
  if (target.hasAttribute("data-reset-demo")) {
    state = resetState();
    view = initialView();
    mcpStatus = { ...mcpStatus, lastMutation: null };
    render();
    return;
  }
  if (target.hasAttribute("data-snooze")) {
    snoozeUntilTomorrowMorning(target.dataset.snooze);
    return;
  }
  if (target.hasAttribute("data-copy-prompt")) {
    copyPrompt();
    return;
  }
  if (target.hasAttribute("data-dismiss-hint")) {
    view = { ...view, dismissedHint: true };
    render();
  }
}

app.addEventListener("click", handleAppClick);

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") trapFocus(event);
  if (event.key !== "Escape" || (!view.showDiagnostics && !view.showEvidenceFor)) return;
  view = { ...view, showDiagnostics: false, showEvidenceFor: null };
  render();
  if (lastActiveElement instanceof HTMLElement) lastActiveElement.focus();
});

render();

registerWeopleSiteTools({
  getState: () => state,
  mutate,
  onStatus: (nextStatus) => { mcpStatus = nextStatus; if (view.showDiagnostics) render(); },
});
