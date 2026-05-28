# AI Tool Radar

A small, publishable dashboard for tracking AI product launches and translating each update into a practical builder use case.

The project is intentionally dependency-light: it runs as a static site, validates its own launch data, and can be deployed to GitHub Pages from the generated `dist/` folder.

## What It Does

- Tracks current AI tools, launch status, categories, sources, and adoption notes.
- Generates a practical "builder use case" for each tool.
- Filters by category, status, and readiness.
- Provides source links and confidence labels so the dashboard stays evidence-aware.
- Includes a small validation/test suite to keep the data shape clean.

## Quick Start

```bash
npm run dev
```

Then open the local URL printed in the terminal.

## Scripts

```bash
npm run dev        # Serve src/ locally
npm run validate   # Validate data/tools.json
npm test           # Run Node test suite
npm run build      # Validate and copy src/ to dist/
npm run preview    # Serve the production build
```

## Data Model

Launches live in [`src/data/tools.json`](src/data/tools.json). Each record includes:

- `name`
- `company`
- `category`
- `status`
- `readiness`
- `summary`
- `builderUseCase`
- `sourceUrl`
- `sourceType`
- `confidence`
- `lastVerified`

Run `npm run validate` before publishing changes.

## Deploy To GitHub Pages

1. Run `npm run build`.
2. Commit the repository.
3. Enable GitHub Pages with GitHub Actions as the source.
4. Push to `main`; the included workflow validates, tests, builds, and deploys `dist/`.

The app uses relative asset paths, so it works under a project URL such as `https://username.github.io/ai-tool-radar/`.

## Agent-Friendly Workflow

This repo includes [`AGENTS.md`](AGENTS.md) so tools like Codex, Copilot coding agent, Claude Code, Jules, or Grok Build have clear project instructions. The intended loop is:

1. Open an issue using the "Add AI Tool" template.
2. Assign a coding agent or ask your local agent to update `src/data/tools.json`.
3. Require `npm run validate`, `npm test`, and `npm run build` before merging.
