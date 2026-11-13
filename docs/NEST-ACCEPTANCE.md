# ParishOS — NEST R1 acceptance contract

## Source and interpretation
Grounded in the user-supplied *Philippine Catholic Parish Rectory / Convent Operations* research, November 2026. Research-derived design categories are illustrative, not authenticated policies of a particular diocese.

## Demo scope (approved showcase, NOT live parish software)
- Eight workspace views: Overview, Service requests, Sacramental records, Parish calendar, Mass intentions, Certificates & files, Finance overview, Ministries & BECs.
- Usable mobile drawer, desktop navigation, service search/filter and demo-only request workflow.
- Sample state transitions on request cards, status-driven intention view.
- Document preview with explicit watermark, **no signature or seal**.
- Source register traceability instead of editable fabricated registers; no simulated privileged diocesan approval.
- Donation and restricted-fund descriptions distinct from Mass-intention fulfillment.
- No backend, no credential capture, no real records, no persistence, no payment, no production or diocesan claim.

## Source-of-truth caveats
Canonical registers must remain authoritative. Corrections may require diocesan authorization. Wedding cases retain post-ceremony obligations; Mass intentions are not equivalent to donations or payments. Privacy and confession are high-risk boundaries; no confessional content is collected.

## NEST gates
G0: immutable research and rubric frozen in README.
G1: 8-view IA and domain contract.
G2: exact-SHA isolated writer PR, no merge.
G3: Node built-in static checks and browser QA; independent reviewer separate.
G4: Vercel preview of exact SHA and score; not production parish release.

## Frozen evaluation rubric (100)
1. Greenfield source/authority custody 15
2. Philippine parish workflow fidelity 20
3. Responsive and visual UI quality 25
4. Functional interactions/accessibility 20
5. Reproducible evidence and QA 10
6. Verified Vercel preview deployment 10

Minimum negative cases: empty search, no matching filter, missing request label, escaped custom requester text, repeated advance, demo-only document validity, mobile navigation and keyboard focus.
Record original browser screenshots, console warnings and interaction observations independently; Node source checks alone cannot certify UI correctness.

## Reviewer separation
The code writer may use internal Kirion-inspired critique but cannot claim formal Kirion-Nox independent GitHub approval. No production domain promotion or main merge without a separate Engineer decision. A single skill-enabled project proves operability, not causal skill uplift.
