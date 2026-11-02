# UPS CREATOR STUDIO — MASTER REQUIREMENTS & HANDOFF

**Brand:** UPS CREATOR STUDIO  
**Subtitle:** ALL-IN-ONE AI CREATIVE PRODUCTION SOFTWARE  
**Identity:** GSN — UNLIMITED PREMIUM / ULTIMATE AUTO-PILOT FILMMAKER PRO MAX INFINITY  
**Credit:** Created & Developed by UMESH PRAKASH SINGH  
**Tagline:** IMAGINE. CREATE. INNOVATE.

यह दस्तावेज़ उपलब्ध बातचीत-सार, उपयोगकर्ता द्वारा दी गई source files और इस ZIP के वास्तविक कोड के आधार पर बनाया गया है। जहाँ पुरानी बातचीत में अलग-अलग विकल्प/मूल्य/संख्याएँ मिलीं या पूरा मूल डेटा उपलब्ध नहीं था, वहाँ अनुमान लगाकर उसे final तथ्य नहीं बनाया गया है।

## 1. Source और सुरक्षित बदलाव
- इस पैकेज का आधार उपयोगकर्ता द्वारा चल रहा बताया गया `upscreatorstudio-main` चार-file प्रोजेक्ट है।
- मुख्य files: `index.html`, `styles.css`, `app.js`, `config.js`.
- Education Hub: GYAN APEX source को app.js में embed किया गया है; deployment में केवल index.html HTML entry point है। iframe अलग execution context है, backend data/auth integration स्वतः प्रमाणित नहीं है।
- Supabase database, Storage bucket या GitHub repository को delete/reset करने वाला कोई कदम इस पैकेज में नहीं है।
- Existing GitHub Actions workflow को repository में अलग से सुरक्षित रखें; इस ZIP में नया workflow जोड़ना आवश्यक नहीं समझा गया।

## 2. Core architecture registry
- 100 Core Modules: 50 original + 50 additional.
- 25 Workflow Locks: 15 original + 10 additional.
- 12 Production Engines.
- 15 Workflow Stages.
- Podcast Studio के लिए अलग 16 specialized planning engines इस update में `UPS_PODCAST_ENGINES` registry के रूप में जोड़े गए हैं।
- Registry count का अर्थ यह नहीं कि हर engine कोई external AI model या renderer चला रहा है। ये मुख्यतः planning, orchestration और validation definitions हैं।

## 3. Studios / outputs
मुख्य app में उपलब्ध studio choices: Video, Image, Poster, Dance, Film Maker, Podcast और Education. उपयोग: short/reel/video prompts, image/poster prompts, dance/choreography planning, film/story/scene planning, podcast conversations/scripts और education/GK/MCQ/lesson explainers.

## 4. Auto-pilot और guided workflow
- उपलब्ध app में wizard आधारित step-by-step flow, AUTO और MANUAL modes, progress indicator, back/next/skip (जहाँ प्रश्न optional हो) और conditional questions मौजूद हैं।
- निर्णय क्रम की अपेक्षित नीति: Country → Audience → Language → Platform → Profile/Brand → Category → Activity/Format → Subject → Specific Topic → Purpose → Dialogue/Narration → केवल आवश्यक production details.
- AUTO mode सुरक्षित defaults और suggestions दे; MANUAL mode user control रखे। एक बार में एक सवाल, पहले से मिली जानकारी दोबारा न पूछे।
- User command convention (master assistant workflow): `बन` = नया topic चुनकर prompt बनाना; numeric command = उसी क्रमांक का topic; `CATEGORY: <name>` = चुनी category में नया topic. ये command conventions app के हर UI में स्वतः उपलब्ध हैं, ऐसा दावा नहीं किया जा रहा।
- प्रत्येक generation में fresh topic और repeat-avoidance तभी सुनिश्चित होगा जब selected topic bank और used-topic history वास्तव में उपलब्ध हों।

## 5. Video / filmmaker production brief
- Default target: 10.000 seconds, vertical 9:16; जरूरत पर 16:9.
- Hook → clear progression/main message → polished close; multi-clip sequence और clip boundaries का planning.
- तीन reference photos identity/face consistency के लिए; कपड़े, रंग, accessories या background को reference से copy न करें जब तक स्पष्ट निर्देश न हो। Topic/scene के अनुसार नया wardrobe और background.
- Audio/dialogue first planning, lip-sync, expression, gesture, camera, light, scene continuity, transitions, music/SFX, Hindi captions और spelling QA.
- Hindi captions/overlays/logo/watermark/title/header/poster defaults OFF रहें जब तक user स्पष्ट रूप से enable न करे।
- YouTube Create prompt limit: अधिकतम 900 characters; output देने से पहले exact character count check करना अपेक्षित है।
- Prompt sequence output को अलग clips में विभाजित करने और edit handoff के लिए उपयोग किया जा सकता है।

## 6. Podcast Studio — 16 specialized engines
1. Podcast Content Intelligence
2. Identity Consistency
3. Voice Direction
4. Word-Level Audio Sync
5. Lip-Sync Planning
6. Expression Direction
7. Body Language Direction
8. Animated Text Direction
9. Language Accuracy
10. Cinematic Visual Direction
11. Audio & Music Direction
12. Transition & Continuity
13. Podcast Quality Assurance
14. Speaker & Turn Management
15. Audio Alignment & Timecode
16. Render & Export Handoff

Word-level timestamps केवल वास्तविक generated audio से लेने हैं; अनुमानित timestamps नहीं। Lip-sync और MP4 rendering compatible external tools/provider के बिना केवल planning stage हैं।

## 7. Education Hub — Gyan APEX
- Source: `GYAN_APEX_NO_PASSWORD_COMPLETE.html`.
- School: 22 categories × 20 topic ideas = 440.
- College: 13 categories × 20 topic ideas = 260.
- Total: 35 categories / 700 topic ideas.
- 12-month suggested calendar; इसे official dated calendar न मानें।
- School / College / Combined selection और separate identity/branding.
- Output types include poster, video/reel prompt, YT Create prompt, sequence, caption, notice, activity checklist, calendar and QA.
- Public no-password page: link पाने वाला व्यक्ति खोल सकता है। इसमें बच्चों/छात्रों का निजी data, phone, marks या sensitive records न डालें।
- Admission class range, course list, fees, eligibility, affiliation, dates, contact and claims publish करने से पहले institution authority से verify करें।

## 8. Topic banks — source completeness
- USA topic bank का desired structure: 20 categories × 50 titles = 1,000 topics; categories include USA facts/places, GK, motivation, psychology, science, AI/future tech, space, nature, American history, life lessons, business, financial education, health/wellness education, career/productivity, mysteries, travel, inventions, education, entertainment/culture and digital/cyber awareness.
- India topic bank का target: 20 categories × 50 = 1,000 topics, separate from USA bank.
- इस handoff के उपलब्ध source files में दोनों banks की complete 2,000 title lists मौजूद नहीं मिलीं। इसलिए इस ZIP में उनके पूरे titles होने का दावा नहीं है; सूची उपलब्ध होने पर exact titles import और duplicate checks किए जाने चाहिए।

## 9. Authentication / roles / security
- Current code uses Supabase Auth email/password methods. Mobile OTP was explicitly postponed; इसे enabled/working न बताएं।
- Registration/profile field requirements discussed: First Name, Last Name, Email, City, Password; phone optional profile field only if implemented, OTP नहीं। Current live form/backend field parity का end-to-end test बाकी है।
- Roles discussed: `super_admin`, `office_editor`, `tester`. Super Admin assignment केवल trusted server-side/SQL process से; client-side role check security boundary नहीं है।
- Super Admin email supplied in prior project context must not automatically grant privileges based on email text alone; verify Auth UUID and assign securely.
- Supabase public publishable key frontend में acceptable; `service_role` key कभी frontend या public repo में नहीं।
- `owner-private-profile` bucket private रहे, profile file limit 5 MB; user UUID path ownership and signed URL policy verify करें।
- Two-user isolation, RLS, storage permissions, role escalation prevention and logout cleanup live tests आवश्यक हैं।

## 10. AI, rendering and provider boundaries
- Current config has `AI_GENERATION: false`.
- Main app is a prompt planning/orchestration tool; it does not by itself generate live Gemini images/videos or render MP4.
- Real generation requires secure provider integration, server-side secrets, quotas/error handling and user consent.
- MP4 export requires an actual rendering provider/worker. Do not label prompts as rendered video.

## 11. Payment / subscriptions
- Prior conversations contain different pricing proposals at different times; no single final tariff is certified in the current source. Do not hard-code or advertise pricing until the owner confirms the active plan table.
- Latest supplied UPI reference/QR belongs to a separate user attachment. Keep payment flow manual-pending until Admin verifies payment; never auto-activate from a screenshot or user-entered UTR alone. Provider webhook can be added later.
- Payment approval and paid-feature authorization must be enforced server-side, not only hidden/disabled in the browser.

## 12. Responsive design and usability
- Android Chrome/mobile-first and desktop responsive are required.
- Premium, clean, accessible interface; clear Hindi/English language behavior; large touch targets; readable Devanagari; no confusing multi-question form.
- Provide clear validation, progress, back/next, safe defaults, reset/undo where relevant, copy-ready output and helpful error messages.

## 13. Release safety checklist
- Keep backup of current GitHub repository before upload.
- Upload ZIP contents to repository root, not an extra nested folder.
- Preserve GitHub Actions workflows and repository settings.
- Never delete/reset Supabase tables, auth users or storage.
- Review SQL migration and run only after owner backup and test project review.
- Test in Android Chrome and desktop, with two separate test users.
- Confirm auth, profile, private upload, project CRUD, RLS, admin approval, browser console, refresh and mobile layout.
- Record PASS / FAIL / NOT TESTED; no false 100% production certification.

## 14. Known unresolved / external verification
1. Live Supabase Auth, profiles, project CRUD, Storage and RLS.
2. Secure server-side admin approval/role authorization.
3. Gemini/provider generation and actual MP4 rendering.
4. Real audio timestamps and lip-sync output.
5. Actual GitHub Pages deployment and Actions run.
6. Complete USA 1,000 and India 1,000 exact topic title banks.
7. Final approved pricing and payment webhook/verification.
8. Browser interaction and visual regression on Android Chrome + desktop.

**Honest status:** Static package checks can pass, but these external/live items remain NOT TESTED or require provider integration. This ZIP is a reviewed handoff, not a guarantee of 100% production readiness or user satisfaction.
