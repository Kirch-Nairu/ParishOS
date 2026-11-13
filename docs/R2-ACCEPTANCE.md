# ParishOS NEST R2 — Rectory operations acceptance contract

**Mission:** PARISHOS-NEST-R2-RECTORY-ADMIN-OFFICE-REDIRECTION-R1  
**Authority:** Engineer Issue #8; based on the earlier Philippine Catholic parish office workflow research.  
**Status:** Demo contract only — no local diocesan authorization, no actual parish record or service.

## Operator-first routing

Primary: Workdesk; Office Inbox; Service Requests; Certificates & Records; Correspondence; Marriage Cases; Scheduling; Document Archive; Finance & Receipts; Activity & Audit.
Secondary: Mass intentions and Priest approvals. Priests are not the default landing persona.

## R2 acceptance / evidence matrix

| Journey | Action | Confirmed UI-only limitation |
| --- | --- | --- |
| Certificate | identity -> volume/page/entry and annotations -> sample draft -> queued approval -> fictional release | SAMPLE INVALID print, no actual sign/seal |
| Correspondence | receive -> classify -> owner+due -> action -> dispatch reference -> archive | all events show actor, timestamp, reference |
| Marriage | missing docs -> follow-up -> per-document checks -> interview -> office review -> booking | ceremony, civil filing and baptismal parish notifications remain incomplete |
| Queue | search, filters, priority, owner, next action and aging | only 3 fictional cases |
| Archive | search references, review action history and source provenance | never changes a canonical register |
| Finance | offerings, donations, restricted project fund, expenses | no payment or accounting backend |
| Priest | secondary assignment/approval preview | no real delegation |
| Access | role-aware action availability | UI simulation; not authentication |

## Release and QA gates

- No real PII, bank data, historical records, seal, official certificate, confession details, network APIs, persistent data, or claimed authorization.
- Runtime resets on reload; every dataset marked fictional and demo-only.
- Node syntax + pure workflow regression tests; source safety tests; static build.
- Browser interaction and overflow at 320,390,768,1024,1440 plus keyboard/print visual QA required for visual acceptance; mark NOT_RUN honestly.
- Independent nonauthor Kirion-Nox review of frozen R2 SHA required; no merge or production promotion.
- Historical R1 scope error is an explicit benchmark failure. No causal skill-improvement claim from single project.
