# AI Tool Radar Agent Instructions

This repo is a dependency-light static app. Keep changes small, evidence-aware, and easy to review.

## Commands

- Validate data: `npm run validate`
- Run tests: `npm test`
- Build static output: `npm run build`
- Serve locally: `npm run dev`

If `npm` is unavailable in the local environment but Node.js is available, run the scripts directly:

- `node scripts/validate-data.mjs`
- `node --test`
- `node scripts/build.mjs`

## Data Rules

- Add new launches in `src/data/tools.json`.
- Use official launch posts, docs, changelogs, or repos whenever possible.
- Keep `lastVerified` current and use `YYYY-MM-DD`.
- Use `High` confidence for primary sources, `Medium` for credible but incomplete evidence, and `Low` for single-source or uncertain claims.
- Do not add rumor-only products unless the status and confidence make the uncertainty obvious.

## UI Rules

- Preserve the static-site architecture unless there is a clear reason to add a framework.
- Keep the dashboard responsive at mobile and desktop widths.
- Avoid marketing copy that makes unsupported claims.
- Make every new launch card include a practical builder use case, not only a product summary.

