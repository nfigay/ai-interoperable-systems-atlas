# AI & Interoperable Systems Atlas

A source-controlled, evidence-based, multi-perspective atlas. Adapted from the initial documentation starter.

## Local Mac development (Node/npm only)

```sh
npm install
npm run dev
npm test -- --run
npm run build
```

- **Vite** is for local development and generating a static `dist/` build.
- **GitHub Pages** serves the static build. No Node, Vite, Python or Perl runtime is needed on GitHub Pages.
- The maintained knowledge source is `docs/**/*.md`. Edit those files, not generated HTML.
- Repository name can differ: GitHub Actions passes `ATLAS_BASE=/<repo>/` at build time.
- GitHub Pages: configure **Settings → Pages → Build and deployment → GitHub Actions**.

## Protocol continuity with BPMNSM

Use the **DEPP/EDED** principles: inspect actual source before change; declare Claim, Context, Evidence, Limit; prefer minimal changes; run targeted proof and regression; record Git commit and version; do not mistake green CI for stakeholder validation.

Reference: https://github.com/nfigay/Semantic-Process-Mediator/blob/main/public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md

**Scope:** The atlas uses this method as an adapted working protocol; this does not claim to be a verbatim copy of every BPMNSM local rule. See `ATLAS_PROTOCOL.md`.

**Initial handoff limitation:** Dependency installation, Vitest and Vite build could not be run in the preparation environment. After the first successful local `npm install`, commit the generated `package-lock.json` and switch CI back to `npm ci` for reproducible installations.
