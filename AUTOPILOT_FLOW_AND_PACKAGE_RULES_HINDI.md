UPS CREATOR STUDIO — AUTO-PILOT FLOW & PACKAGE ACCESS
=====================================================

1. Recommended navigation structure
------------------------------------
One HTML entry point: index.html.
Keep maintainable assets separate: styles.css, app.js, config.js.
Do not create one HTML page per studio. Studio pages should be views/modules within the same application shell.
Education Studio opens the embedded GYAN APEX hub in an isolated iframe, so its internal CSS/JS does not collide with the main app.

2. User journey (one question at a time)
----------------------------------------
1. Purpose — user ka goal kya hai?
2. Mode — AUTO ya MANUAL?
3. Output format — Video / Image / Poster / Reel / Short Film / Podcast / Educational Content / Carousel.
4. Activity — Explainer / Story / Interview / Competition / Event / Promotion / Dance / Vlog / Quiz / Announcement.
5. Platform — YouTube / Facebook / Instagram / WhatsApp / Website / Multi-platform.
6. Audience — India / USA / Global / Students / Parents / Teachers / Customers / General.
7. Language — Hindi / English / Hindi + English.
8. Category — searchable main content category.
9. Subcategory — category-dependent options.
10. Topic — searchable topic list filtered by selected category and subcategory, or user-entered topic; MANUAL mode requires a specific topic; AUTO suggestion uses local repeat history.
11. Creative Direction — freeform command prompt / detailed instructions (up to 6,000 characters).
12. Visual Style — scene, camera, lighting and visual direction.
13. Identity Rules — reference photo, clothing, logo, uniform and continuity requirements.
14. Voice Style — voice tone, speaker and delivery.
15. Text Rules — captions, on-screen text and spelling rules.
16. Branding / CTA — logo, watermark, end card and call to action.
17. Desired result — what should viewer understand/do?
18. Dialogue/Narration — voice-over / on-camera / two-person / text-only.
19. Duration — only for time-based output.
20. Aspect ratio — platform-oriented setting.
11. Desired result — what should viewer understand/do?
12. Dialogue/Narration — voice-over / on-camera / two-person / text-only.
13. Duration — only for time-based output.
14. Aspect ratio — platform-oriented setting.


AUTO mode: fills sensible defaults, maps purpose to category, selects a subcategory/topic, chooses dialogue defaults and aspect ratio.
MANUAL mode: requires the user to supply non-optional answers; the user can edit every answer before generating.
Both modes use the same final brief, prompt variants, JSON package and sequence planner. Before prompt generation, all defined workflow locks are evaluated; failed checks are shown and generation is blocked until the brief is corrected.

3. Category / Subcategory / Topic
---------------------------------
The initial taxonomy is a starter taxonomy and can be extended by Admin. It is not a verified 1,000 + 1,000 USA/India master topic bank.
Topic history is stored in local browser storage and is per-browser, not cross-device or account-wide.

4. Package gate
---------------
The UI now checks profile entitlement fields:
- package_status / subscription_status / plan_status
- package_active / is_paid
Super Admin role bypass is recognized in the UI.
If entitlement is missing, expired or not active, prompt generation is stopped and a package approval popup is shown.

SECURITY LIMITATION:
This is a client-side user-experience gate only. A technically skilled user can bypass browser-side JavaScript. Real enforcement MUST be added to Supabase RLS / Edge Function or another trusted server before launch. Do not treat this UI gate as payment verification or secure authorization.
The current project source does not define a final approved pricing table or package-to-feature matrix. Do not hard-code tariffs or claim a payment has been verified. Admin must approve a package server-side.

5. Prompt/output capabilities
------------------------------
The existing prompt package provides prompt variants, YT Create short format, sequence/clip planning, copy/download and JSON export controls where present in the app.
This remains a prompt planning/orchestration system. Actual image generation, Gemini calls, voice generation, lip-sync and MP4 rendering require connected providers and server-side credentials.

6. Admin / Super Admin
----------------------
Admin should manage package assignment, expiry, approval, feature entitlements and user status from trusted server-side controls. Do not grant Super Admin from client-side profile editing. Verify role in Supabase policies/Edge Functions.

7. Verification status
----------------------
Static checks can verify syntax, IDs, local references and ZIP integrity.
They cannot prove real Supabase login, role enforcement, payments, AI provider calls, browser rendering, mobile layout, or real user acceptance. Complete the LIVE_TEST_PLAN before public production launch.


7. Clip prompt generation
-------------------------
The sequence planner creates one clip for each 10-second segment (last segment may be shorter). Each clip has its own scene/action/camera/dialogue/text/transition prompt, with a maximum of 900 characters, individual Copy and Download controls, and Download All Clip Prompts. This is a character-limit cap, not a guarantee of exactly 900 characters per clip.
