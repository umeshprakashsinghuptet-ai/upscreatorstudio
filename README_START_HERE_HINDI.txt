UPS CREATOR STUDIO — HYBRID PAYMENT UPGRADE PACK
================================================

यह ZIP पुरानी जरूरी फाइलों को हटाए बिना एक UPGRADE DELTA देती है। इसमें app.js, config.js, index.html, styles.css के updated versions, payment-client.js, SQL migration और Supabase Edge Functions शामिल हैं। Live payment चालू होने से पहले SQL, Edge Functions, Secrets और live tests आवश्यक हैं।

आपके दिए गए Learning Hub plans SQL seed में रखे गए हैं:
- Daily Plan: ₹50 / 1 दिन
- One Subject Access: ₹200 / 30 दिन
- Complete Learning Access: ₹500 / 30 दिन
- Annual Learning Plan: ₹20,000 / 365 दिन

Creative Studios अलग catalogue में रखा गया है, लेकिन price/entitlements अभी disabled हैं। Admin द्वारा वास्तविक सुविधा और कीमत तय किए बिना उन्हें enable न करें।

पहले सुरक्षा
------------
1. Supabase का database backup/export रखें। GitHub ZIP backup अलग से रखें।
2. इस ZIP में कोई service_role key, Razorpay secret या UPI private credential नहीं है।
3. किसी भी secret को config.js, app.js, GitHub या public JSON में न डालें।
4. Merchant/payment account और वास्तविक भुगतान व्यवस्था account holder/authorized adult की सहमति और नियंत्रण में होनी चाहिए।
5. पहले Razorpay TEST MODE में जाँचें; वास्तविक भुगतान बाद में अधिकृत account holder करे।

फाइलें
------
01_DATABASE_MIGRATION.sql
  Supabase SQL Editor में एक बार चलाने के लिए additive schema + RLS + package seeds।

supabase/functions/
  create-razorpay-order/          Authenticated user के लिए order बनाता है।
  verify-razorpay-payment/         Signature + provider payment details verify करता है।
  razorpay-webhook/               Razorpay webhook signature verify करता है।
  submit-manual-payment/           UPI UTR/reference को pending review में भेजता है।
  admin-review-manual-payment/     केवल super_admin manual payment approve/reject कर सकता है।
  configure-package/               केवल super_admin package price/duration बदल सकता है।
  expire-subscriptions/            secret-protected expiry job endpoint।
  _shared/http.ts                  Shared HTTP/HMAC helpers।

frontend/payment-client.js
  Existing Supabase client के साथ frontend adapter; updated app.js इसे import करता है।

PAYMENT_CONFIGURATION.example.json
  Human-readable package/payment configuration reference; इसमें placeholders हैं।

01. SQL चलाना
-------------
1. Supabase Dashboard > सही project > SQL Editor > New Query खोलें।
2. 01_DATABASE_MIGRATION.sql पूरा paste करें।
3. Run करें। Error आए तो आगे न बढ़ें; error text सुरक्षित रखें और पहले जाँचें।
4. SQL के बाद नीचे की read-only verification चलाएँ:

SELECT package_code, display_name, amount_paise, duration_days, enabled
FROM public.subscription_packages
ORDER BY sort_order;

अपेक्षित Learning Hub rows: 4 enabled rows; creative_custom disabled।

02. Edge Functions deploy
-------------------------
इन folders की functions Supabase Edge Functions के रूप में deploy करनी होंगी। केवल GitHub Pages पर upload करने से Edge Functions deploy नहीं होतीं।
Function names:
- create-razorpay-order
- verify-razorpay-payment
- razorpay-webhook
- submit-manual-payment
- admin-review-manual-payment
- configure-package
- expire-subscriptions

Deployment के लिए Supabase Dashboard Edge Functions editor या Supabase CLI/authorized deployment pipeline उपयोग करें। प्रत्येक function folder के index.ts के साथ _shared/http.ts भी रखें।

03. Edge Function Secrets
-------------------------
Dashboard > Project Settings / Edge Functions Secrets में authorized account holder के जरिए ये secrets set करें:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY   (केवल server secret; किसी chat/GitHub/frontend में साझा न करें)
- RAZORPAY_KEY_ID             (test key से शुरुआत)
- RAZORPAY_KEY_SECRET         (server secret)
- RAZORPAY_WEBHOOK_SECRET     (server secret)
- EXPIRY_CRON_SECRET          (लंबा random server secret)

RAZORPAY_KEY_ID/SECRET न होने पर Automatic Gateway functions 503 देंगे। यह अपेक्षित सुरक्षित व्यवहार है।

04. Razorpay webhook
--------------------
Razorpay Dashboard में webhook URL इस प्रकार होगा:
https://<PROJECT-REF>.supabase.co/functions/v1/razorpay-webhook
Webhook secret को RAZORPAY_WEBHOOK_SECRET में रखें और payment.captured event enable करें। Supabase function config में webhook के लिए JWT verification बंद होना चाहिए; webhook अपनी HMAC signature जाँचता है। बाकी functions में JWT verification चालू रखें।

05. Manual UPI
-------------
Manual UPI अभी केवल UTR/reference submission और Admin approval API देता है। आपके दिए SBI UPI QR को assets/payment/sbi-upi-qr.png में जोड़ा गया है। QR payload decode करके पुष्टि की गई: pa=9971158047-5@ybl और pn=Umesh Prakash Singh। config.js में Manual UPI enabled है। User QR से भुगतान करके UTR/reference submit कर सकता है; Super Admin को बैंक/UPI statement में वास्तविक क्रेडिट देखकर ही Approve करना होगा। Static QR में User को सही package amount स्वयं दर्ज करना होगा; dynamic amount QR नहीं है। Barcode flow शामिल नहीं है क्योंकि उपलब्ध QR UPI QR है, barcode payment specification नहीं।
Barcode कोई generic UPI विकल्प नहीं है; provider का supported barcode rail उपलब्ध होने पर ही इसे जोड़ा जा सकता है।

06. अभी क्या अधूरा है — इसे ध्यान से पढ़ें
-----------------------------------------
यह ZIP सुरक्षित database/backend foundation है, पूर्ण integrated production release नहीं। निम्न काम बाकी हैं:
- Existing app.js में pricing cards / package modal integrate करना।
- Generate gate को नई user_subscriptions table से जोड़ना।
- Super Admin Dashboard में package editor और pending manual payment review panel जोड़ना।
- Checkout button में Razorpay Checkout adapter wire करना।
- UPI QR display/UTR form जोड़ना।
- Creative Studios के अलग package codes, prices, features और limits Admin से तय करवाना।
- Expiry function को trusted scheduler/cron से नियमित चलाना।
- End-to-end browser test और Razorpay test-mode webhook test।

जब तक ये integration और tests पूरे न हों, मौजूदा paid access gate को इस नई table पर निर्भर न करें और वास्तविक ग्राहकों से भुगतान न लें।

07. सुरक्षा/rollback
--------------------
- पुरानी profiles/creator_projects/auth users को यह migration delete नहीं करती।
- profiles role protection triggers को यह migration नहीं बदलती।
- Payment/subscription tables पर client-side direct INSERT/UPDATE/DELETE बंद है; server functions service role से लिखते हैं।
- Rollback की जरूरत हो तो स्वयं tables drop न करें; पहले data export और dependency review कराएँ।

08. महत्वपूर्ण
-------------
इस ZIP में app.js, index.html, styles.css और config.js के updated versions हैं। इन्हें अपने backup के बाद repository root में replace करें और frontend/payment-client.js को उसी path पर रखें। बाकी पुरानी files (जैसे regional-topic-bank.js और अन्य SQL/docs) को न हटाएँ।
