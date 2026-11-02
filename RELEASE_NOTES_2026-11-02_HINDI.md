# UPS Creator Studio — Enhancement Release Notes

## जो वास्तविक रूप से जोड़ा गया
1. India के लिए 1,000 topic ideas: 20 domains × 50 ideas।
2. USA के लिए 1,000 topic ideas: 20 domains × 50 ideas।
3. Auto-Pilot AUTO topic selection अब India/USA audience के अनुसार regional bank इस्तेमाल करता है।
4. Topic search में regional topic suggestions उपलब्ध हैं।
5. Topic history अब region + category के अनुसार अलग है; browser localStorage पर आधारित है।
6. Topic bank integrity के लिए अलग Node.js test जोड़ा गया।
7. Hindi setup/usage guide और requirements traceability अपडेट की गई।

## Offline QA
- Offline checks: 44/44 PASS (syntax, project structure, registries, topic-bank counts/uniqueness, prompt limits, local assets, accessibility token checks)।
- India topic bank: 20 domains, 1,000 unique ideas।
- USA topic bank: 20 domains, 1,000 unique ideas।

## अभी भी external setup / live testing चाहिए
- Supabase database, Auth, RLS, Storage और multi-user isolation की live verification।
- Secure server-side Admin/Super Admin actions और payment approval।
- Payment gateway credentials/webhooks।
- Gemini/provider API और server-side secret management।
- Image/video/voice generation तथा MP4 rendering provider integration।
- GitHub Pages deployment और browser E2E testing।

इस release में किसी भी बाहरी सेवा पर वास्तविक transaction या deployment नहीं किया गया। Topic ideas planning prompts हैं; वे verified facts या live trend research नहीं हैं।
