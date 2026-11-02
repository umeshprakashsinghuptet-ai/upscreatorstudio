# MASTER REQUIREMENTS — TRACEABILITY & DELIVERY STATUS

Legend: PRESENT = found in current static package; PARTIAL = UI/rules only or incomplete; PENDING = requires implementation/integration/live credentials.

| Area | Requirement | Status |
|---|---|---|
| Core | 100 module registry | PRESENT — registry count tested, not proof every module is a live service |
| Core | 25 workflow locks | PRESENT — validation framework; functional depth needs per-lock tests |
| Core | 12 production engines | PRESENT — registry |
| Core | 15 workflow stages | PRESENT — registry |
| Podcast | 16 specialized engines | PRESENT — registry |
| Auto-Pilot | AUTO/MANUAL and wizard | PRESENT/PARTIAL — existing flow differs from earlier requested order |
| Auto-Pilot | Original country-first sequence | PENDING |
| Topics | GYAN APEX 700 topic starter bank | PRESENT |
| Topics | USA 1,000 full topic bank | PENDING |
| Topics | India 1,000 full topic bank | PENDING |
| Topics | Fresh topic history / robust deduplication | PENDING |
| Prompts | Per-clip 900-character cap and actions | PRESENT — automated QA |
| UI | Premium theme and responsive CSS rules | PRESENT — actual browser visual testing pending |
| User | Full registration/profile lifecycle | PARTIAL — live Supabase verification pending |
| Projects | Complete secure cloud CRUD / ownership | PENDING live verification and possible code work |
| Admin | Secure server-side admin controls | PENDING |
| Subscription | Daily / Single Study / Full Study catalogue | PRESENT as configurable policy |
| Subscription | User selects one package | POLICY DEFINED; live checkout UI/backend pending |
| Subscription | Price and duration shown | PENDING final approved values and UI binding |
| Subscription | Payment admin verification | POLICY DEFINED; secure backend pending |
| Subscription | Activate only after approval | POLICY DEFINED; server enforcement pending |
| Subscription | Expiry enforcement | POLICY DEFINED; server enforcement pending |
| Subscription | Admin package changes and audit log | POLICY DEFINED; backend pending |
| Subscription | Per-user isolated payment/entitlement | POLICY DEFINED; RLS/backend pending |
| AI | Gemini provider calls | PENDING |
| AI | Actual image/video generation | PENDING |
| AI | Voice/lip-sync/MP4 rendering | PENDING |
| Deployment | GitHub Pages build/deploy | Previously reported successful workflow; current live URL and assets must be rechecked |
| QA | Offline QA suite | PRESENT — last baseline 38/38; rerun after any later changes |
| QA | Desktop/mobile E2E | PENDING |

## Critical honesty note
A passing static QA suite validates only the checks it runs. It does not prove secure backend behavior, payment processing, external AI generation, or visual quality in a real browser. Do not label pending items as complete.


## 2026-11-02 Enhancement
- India regional topic ideas: 1,000 (20 domains × 50 ideas).
- USA regional topic ideas: 1,000 (20 domains × 50 ideas).
- Auto-Pilot topic search and AUTO rotation are wired to the selected India/USA audience.
- No-repeat history is scoped by region and category and stored locally in the browser; clearing browser storage resets this history.
- These are editorial ideas, not verified facts or live trend research.
