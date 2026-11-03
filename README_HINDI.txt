UPS CREATOR STUDIO — ULTRA PREMIUM REVIEWED PACKAGE

मुख्य वेबसाइट का वही चार-फाइल ढाँचा सुरक्षित है:
- index.html
- styles.css
- app.js
- config.js

Education integration:
- GYAN APEX Education Hub अब app.js में embedded है और Education Studio के भीतर modal/iframe में खुलता है; deployment entry point केवल index.html है।
- Gyan Public School: 22 categories × 20 ideas = 440 topic ideas.
- Gyan Mahavidyalaya: 13 categories × 20 ideas = 260 topic ideas.
- कुल 700 curated topic ideas; 12 महीने का suggested calendar (dated official calendar नहीं)।
- School, College और Combined campaign selection; अलग branding और fact-verification safeguards.
- Poster, video/reel prompt, YT Create, sequence, caption, notice, activity checklist, calendar और QA outputs.

Architecture Registry (app.js में वास्तविक arrays और append operations):
- 100 Modules = 50 original + 50 additional.
- 25 Workflow Locks = 15 original + 10 additional.
- 12 Production Engines.
- 15 Workflow Stages.
Homepage counters corrected to match these values.

महत्वपूर्ण सीमाएँ:
- Main app prompt planning/orchestration करता है; यह स्वयं live Gemini image/video generate या MP4 render नहीं करता।
- Gyan APEX एक अलग no-password page है; link रखने वाला कोई भी व्यक्ति इसे खोल सकता है। इसमें निजी student data न डालें।
- Topic suggestions या monthly calendar किसी event/date/course की official confirmation नहीं हैं।
- School admission range, current college courses, fees, eligibility, affiliation, dates, contact details और claims publish करने से पहले authorized institution source से verify करें।
- Supabase Auth, RLS, Storage, Admin backend और two-user isolation live test किए बिना production-certified नहीं हैं।

GitHub deployment:
1. पहले पूरी repository का backup लें।
2. ZIP extract करें और अंदर की files repository root में upload करें।
3. Existing GitHub Actions workflow को preserve करें; इस ZIP में नया workflow नहीं जोड़ा गया।
4. Supabase project/database/storage को delete/reset न करें।
5. SQL migration को project owner review और test के बाद ही चलाएँ।
6. service_role key को frontend/config.js में कभी न रखें।

यह static-reviewed package है, live production certification नहीं। QA_REPORT.txt और LIVE_TEST_PLAN_HINDI.txt देखें।

Offline QA runner:
- QA_TESTS/run_qa.py
- Windows: QA_TESTS/RUN_TESTS_WINDOWS.bat
- Mac/Linux: QA_TESTS/RUN_TESTS_MAC_LINUX.sh
- Recorded result: 21 PASS / 0 FAIL (QA_TESTS/QA_RESULTS.txt).
- These checks are local/static only; live backend/provider/browser tests remain separate.


AUTO-PILOT UPDATE:
- Question flow starts with Purpose, then AUTO/MANUAL mode, Output, Activity, Platform, Audience, Language, Category, Subcategory, Topic, Goal, Dialogue, Duration and Ratio.
- AUTO mode provides purpose-based category/subcategory/topic suggestions and defaults.
- MANUAL mode requires answers and allows user control.
- GYAN APEX is embedded inside app.js; only index.html is the HTML entry point.
- Package prompt gate checks profile package entitlement fields. This is only a client-side UX gate until server-side Supabase enforcement is implemented.
See AUTOPILOT_FLOW_AND_PACKAGE_RULES_HINDI.md before deployment.


DETAILED AUTO-PILOT UPDATE:
- MANUAL mode requires a Specific Topic and preserves user-entered values.
- Added a 6,000-character freeform Creative Direction / command prompt step.
- Added separate Visual Style, Identity/Reference Rules, Voice Style, Text Rules and Branding/CTA steps.
- 25 Workflow Locks are reviewed on the Creative Brief; prompt generation is blocked when checks fail.
- Every sequence clip receives its own prompt capped at 900 characters, with individual Copy/Download and Download All.
- Added clipboard fallback, sidebar quick search and responsive premium footer.


FINAL AUTO-PILOT REFINEMENT NOTES:
- MANUAL requires an exact Specific Topic; user-entered values are preserved.
- Added freeform Creative Direction command text (up to 6,000 characters) plus Visual Style, Identity Rules, Voice Style, Text Rules and Branding/CTA steps.
- All 25 defined workflow locks are checked against the brief before prompt generation; lock failures stop generation and are highlighted.
- Production JSON includes the full 100-module manifest, 25 lock results, 12 production engines and 15 workflow stages.
- Sequence creates one prompt per 10-second segment; each clip prompt has a 900-character maximum, individual Copy/Download and Download All.
- Sidebar quick search, responsive premium footer, wizard progress bar and clipboard fallback included.
- Latest offline QA: 34 PASS / 0 FAIL. External live tests remain pending as listed in QA_TESTS/QA_RESULTS.txt.


UNIFIED PREMIUM THEME UPDATE:
- Unified the public website and signed-in workspace around one Midnight Navy + Soft White + Violet + Teal design system.
- Removed the previous light-workspace/dark-sidebar mismatch by overriding the mixed legacy palette consistently.
- Standardized page backgrounds, panels, cards, sidebar, topbar, forms, inputs, selects, textareas, buttons, tags, modals, tables, footer and focus states.
- Improved muted text readability, keyboard focus visibility and reduced-motion support.
- Contrast calculations for selected base pairs: primary text on page background 18.11:1; primary text on panel 16.22:1; muted text on panel 9.35:1; white on primary button 4.93:1. These are token-level calculations, not a full rendered-page WCAG audit.
- Latest offline QA: 38 PASS / 0 FAIL. Browser visual inspection remains pending.


REGIONAL TOPIC BANK UPDATE (02-11-2026)
India: 1,000 topic ideas | USA: 1,000 topic ideas. 20 domains per region. AUTO mode and topic search use the selected India/USA audience. Topic ideas must be fact-checked before publishing. See REGIONAL_TOPIC_BANK_GUIDE_HINDI.md.
