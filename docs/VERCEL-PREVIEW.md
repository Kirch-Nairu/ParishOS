# Vercel preview deployment gate — ParishOS NEST R1

**Project:** https://vercel.com/kirjane/parishos

## Why the initial import displayed a 404
The Vercel creation wizard imported GitHub `main`, which currently contains only the NEST benchmark charter README. The runnable static frontend is isolated on `feat/nest-parishos-static-showcase-r1` and is deliberately not merged into main.

## Preview build
- Git branch: `feat/nest-parishos-static-showcase-r1`.
- Framework preset: Other / no framework.
- Install: `npm install --ignore-scripts --no-audit --no-fund`.
- Build: `npm run build`.
- Output: `dist`.
- Static output contains `index.html`, `app.js`, `styles.css`, `robots.txt`.
- This document is a documentation-only commit to trigger the existing GitHub-to-Vercel preview integration for the feature branch. **Do not promote or merge automatically.**

## Acceptance
1. Observe a Vercel Preview deployment sourced from the exact updated feature-branch SHA.
2. Verify deployment READY and live HTTP response containing `ParishOS`.
3. Validate eight views, mobile navigation and demo-only interactions in actual browser.
4. Independently review source at the new SHA; earlier build/review receipts do not transfer automatically.
5. Publish URL and exact provenance to NEST #6 and parent #1.

If Vercel does not create the branch preview, inspect project Git Integration and Deployment Settings in the Vercel dashboard. Do not claim deployment success merely because GitHub CI passed.
