# Design — Weople

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
Editorial — warm, human, anti-pipeline. The product's own copy ("not a pipeline,
a living personal map") is the design brief.

## Theme (custom tuned)
- `--color-paper`   oklch(97.5% 0.010 92)   warm cream
- `--color-paper-2` oklch(94.5% 0.014 90)   deeper cream (sidebar, asides)
- `--color-ink`     oklch(26% 0.012 80)     warm near-black
- `--color-ink-2`   oklch(46% 0.014 82)     muted body grey
- `--color-ink-3`   oklch(48% 0.014 82)     tertiary grey — labels/meta (darkened for 4.5:1 small-text contrast)
- `--color-rule`    oklch(86% 0.012 88)     hairline
- `--color-accent`  oklch(56% 0.150 40)     terracotta
- `--color-accent-ink` oklch(42% 0.130 38)  pressed terracotta (hover)
- `--color-fact`    oklch(52% 0.070 145)    sage — observed facts only
- `--color-infer`   oklch(52% 0.110 60)     amber — inferences only (darkened for 4.5:1 contrast)
- `--color-commit`  oklch(52% 0.090 30)     clay — commitments only
- `--color-focus`   oklch(56% 0.110 250)    focus ring

## Typography
- Display: **Fraunces** 72pt optical, weight 500–600, style **normal only** (italic headers banned)
- Body: **Source Sans 3**, weight 400/600
- Mono: system mono stack (diagnostics/code only)
- Display tracking: −0.02em; body measure ≤ 62ch
- Scale anchor: `--text-display: clamp(2.4rem, 5vw, 3.6rem)`

## Spacing
4-point named scale in `tokens.css`. Pages use named tokens only, never raw values.

## Motion
- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- Reveal: one fade+rise on newly noticed interventions only; everything else static
- Reduced-motion: opacity-only, ≤ 150 ms

## Microinteractions stance
- Silent success (copy prompt = inline text confirmation, no toast)
- Hover transitions 160 ms, focus ring instant (never animated)
- Card hover: border darkens + hairline shadow; no lift/translate

## CTA voice
- Primary CTA: solid accent, 2px radius, sentence case ("Open Maya Chen")
- Secondary CTA: quiet — hairline underline text button, no box
- No pill buttons, no gradients, no shadows on text

## Per-page allowances
- App views (Today/People/Person/Policy): no enrichment — typography and rules carry the page
- Diagnostics modal: mono type, status dots only
- No section-number eyebrows unless genuinely ordinal

## What pages MUST share
- The "weople" serif wordmark with terracotta mark
- Accent ≤ 5% per viewport — applied as a **small dot before the section label** (0.5rem square, `::before` on the eyebrow), never as a side-stripe on cards. The only remaining left border is the evidence-row type marker, where colour encodes record kind (fact / inference / commitment).
- Display + body fonts, CTA voice, hairline-rule section rhythm

## What pages MAY differ on
- Section composition within the Workbench family (ledger / index / document / charter)
- Column counts (Today 1-col ledger, Person 2-col document)

## Exports

### tokens.css
```css
:root {
  --color-paper: oklch(97.5% 0.010 92);
  --color-paper-2: oklch(94.5% 0.014 90);
  --color-ink: oklch(26% 0.012 80);
  --color-ink-2: oklch(46% 0.014 82);
  --color-rule: oklch(86% 0.012 88);
  --color-accent: oklch(56% 0.150 40);
  --color-accent-ink: oklch(42% 0.130 38);
  --color-fact: oklch(52% 0.070 145);
  --color-infer: oklch(60% 0.110 60);
  --color-commit: oklch(52% 0.090 30);
  --color-focus: oklch(56% 0.110 250);
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 160ms;
}
```

### Tailwind v4 `@theme`
```css
@theme {
  --color-paper: oklch(97.5% 0.010 92);
  --color-ink: oklch(26% 0.012 80);
  --color-accent: oklch(56% 0.150 40);
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Source Sans 3", system-ui, sans-serif;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`
```json
{
  "color": {
    "paper":  { "$value": "oklch(97.5% 0.010 92)", "$type": "color" },
    "ink":    { "$value": "oklch(26% 0.012 80)", "$type": "color" },
    "accent": { "$value": "oklch(56% 0.150 40)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Fraunces", "$type": "fontFamily" },
    "body":    { "$value": "Source Sans 3", "$type": "fontFamily" }
  }
}
```

### shadcn/ui CSS variables
```css
:root {
  --background: 97.5% 0.010 92;
  --foreground: 26% 0.012 80;
  --primary: 56% 0.150 40;
  --primary-foreground: 98% 0.008 92;
  --muted: 94.5% 0.014 90;
  --muted-foreground: 46% 0.014 82;
  --border: 86% 0.012 88;
  --input: 86% 0.012 88;
  --ring: 56% 0.110 250;
}
```
