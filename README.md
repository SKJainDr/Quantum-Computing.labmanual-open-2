# Quantum Computing Laboratory Manual — II (Online Reader)

A self-contained GitHub Pages site for **Quantum Computing Laboratory Manual — II: Advanced Quantum Algorithms & Hardware** by Dr. S. K. Jain — the advanced lab companion to the Quantum Computers series, covering Experiments 16–30 (IBM Quantum hardware required for most).

This is the **plain** variant: no watermark, no copy-protection deterrents — clean reading experience.

## What's inside

- `index.html` — the reader shell (sidebar TOC, topbar controls, reading pane, on-page TOC)
- `assets/css/style.css` — dark/light theme (CSS variables, toggle persists via `localStorage`)
- `assets/js/app.js` — chapter loading & routing, on-page TOC generation, read-aloud, clean reading experience (no watermark/copy-protection)
- `assets/icons/` — the same pen-logo icon set used across the series (favicon, apple-touch-icon, PWA icons)
- `content/*.md` — the manual itself: front matter, lab setup, all 15 experiments (16–30), assessment guide, and index — one file per chapter, converted from your `.docx` source
- `content/manifest.json` — the chapter list that drives the sidebar (edit titles/order here)
- `content/images/` — all figures extracted from the source document

## Features

Identical engine to your Lab Manual I / Quantum Computers / Quantum Algorithms sites, plus one upgrade:

- **Dark / light theme** toggle, remembers your choice
- **Read aloud** (Web Speech API) with sentence highlighting and auto-advance to the next chapter
- **NEW: read aloud from any point** — click any paragraph, heading, list item, or box text in the reading pane and narration starts (or jumps) from exactly there, instead of always restarting at the top of the chapter. Hover shows a subtle accent-colored left border so it's discoverable; text selection for copying still works normally and isn't hijacked. See "What changed" below to backport this to your other sites.
- **Clickable, deep-linkable navigation** — every chapter, every on-page subsection, Prev/Next buttons
- **Filter box** in the sidebar to jump to a chapter/experiment quickly
- **Visitor counter** and **like button**, backed by [Abacus](https://abacus.jasoncameron.dev) (namespace `qc-lab-manual-2-skjain` — unique to this site, won't collide with your other books' counters, including Lab Manual I's)
- **"More in this series"** links in the sidebar — Volume I, II, III (textbooks) and Lab Manual I
- Responsive, collapsible sidebar on mobile

## How the manual content is structured

Each experiment chapter follows the manual's own structure: Background Theory → gate/protocol/formula tables → Qiskit Code (First Program, then Full Program) → Expected Output & Console Results → Observation and Results tables (incl. the mandatory IBM Hardware Execution Record) → Discussion Questions → Lab Record Requirements → Viva Voce Q&A — converted straight from the source Word document:

- **Code blocks** — every Qiskit/Python program (First Program and Full Program) is rendered as a syntax-styled `<pre><code>` block, detected from the source document's shaded/monospace table cells.
- **Console/circuit output** — expected-output blocks that contain box-drawing characters or aligned matrices/tables are kept as monospace `<pre>` blocks so the alignment reads correctly; plainer callouts (checklists, formula boxes) render as normal paragraphs inside the same styled box.
- **Figures** — small inline circuit/diagram images that sit inside a formula or output box are placed right where the source document put them.
- **Data tables** — gate/observation tables, the EXP/AIM/Course header, the grading rubric, and the Viva Voce Q&A all render as real HTML tables, matching Lab Manual I's conventions.
- The "Table of Contents" section from the original document was intentionally dropped — the sidebar chapter nav (and each chapter's own on-page TOC) already serves that purpose.

This was built with a custom Python + python-docx converter (same spirit as the pandoc-based one used for Lab Manual I), not by hand-transcribing the manual — worth a skim rather than treated as pixel-perfect. Flag anything that looks off in a specific experiment and its `content/NN-experiment-NN.md` file can be fixed directly.

## Publishing to GitHub Pages

1. Create a new GitHub repository — e.g. `quantum-computing-lab-manual-2-site-plain` (this is the URL already assumed by this site's own sibling link, and by the reciprocal link added to Lab Manual I — see "Cross-linking" below).
2. Copy everything in this folder into the repo root and push:
   ```bash
   git init
   git add .
   git commit -m "Quantum Computing Laboratory Manual II — online reader"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. **Settings → Pages → Source → Deploy from a branch → `main` / `(root)`** → Save.
4. Live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

### Testing locally before you push

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
(Opening `index.html` directly by double-clicking will **not** work — the browser blocks local `fetch()`.)

## Cross-linking

`assets/js/app.js` → `SERIES_LINKS` points at:
- Volume I — Quantum Computers: `https://skjaindr.github.io/Quantum-Computing.book-open-1/`
- Volume II — Quantum Algorithms & Complexity: `https://skjaindr.github.io/Quantum-Computing.book-open-2/`
- Volume III — Quantum Hardware, Error Correction & Applications: `https://skjaindr.github.io/Quantum-Computing.book-open-3`
- Lab Manual I — Foundational Quantum Experiments: `https://skjaindr.github.io/quantum-computing-lab-manual-1-site-plain/`

**Verify that last URL** — it's my best guess at Lab Manual I's real deployed address based on the zip filename you gave me. If it's actually hosted somewhere else, update that one line in `assets/js/app.js`.

The reciprocal link has already been added — Lab Manual I's own `app.js` now links back here — in the updated copy described in the chat reply. If your Volume I/II/III textbook sites should also link to this Lab Manual, add an entry to their `SERIES_LINKS` arrays too.

## What changed vs. Lab Manual I's engine (for backporting to your other sites)

See the "What needs to change in your other sites" section of the chat reply for the exact patch — three small, self-contained edits to `app.js` (plus one CSS append) with no other side effects on existing functionality.
