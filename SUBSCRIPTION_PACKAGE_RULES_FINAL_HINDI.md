# UPS CREATOR STUDIO — FINAL SUBSCRIPTION PACKAGE RULES

## Approved package-selection behaviour

User स्वयं इन तीनों में से एक package चुनेगा:
1. Daily
2. Single Study
3. Full Study

## Mandatory business rules

- चयन से पहले package का नाम, price, duration और included permissions स्पष्ट दिखें।
- Single Study में user को एक study चुननी होगी; केवल वही study entitlement मिले।
- Daily और Full Study की permissions उनके Admin-configured entitlement map के अनुसार मिलें।
- Payment request बनने पर status `pending` रहे।
- Admin की verified approval के बाद ही subscription `active` हो।
- Rejected payment पर subscription activate न हो।
- Expiry पर subscription access स्वतः समाप्त हो।
- Admin package बदल सकता है; बदलाव का audit log रखा जाए।
- प्रत्येक user का subscription, payment और entitlement record अलग हो।
- एक package की permissions दूसरे package में स्वतः inherit न हों।
- Super Admin/Admin role केवल trusted server-side authorization से तय हो; frontend से role assign न हो।
- Client-side status को सुरक्षा का आधार न मानें। हर protected API/DB operation पर server-side/RLS entitlement check हो।

## Price and duration configuration

तीनों package codes config में मौजूद हैं:
- `daily`
- `single_study`
- `full_study`

इस build में `price` और `duration` जानबूझकर `null` रखे गए हैं। अंतिम रकम और अवधि उपयोगकर्ता ने अभी स्पष्ट रूप से अनुमोदित नहीं की है। जब तक Admin final price/duration configure न करे, checkout/payment request चालू नहीं किया जाना चाहिए। UI में खाली/अनिश्चित कीमत को छिपाकर कोई अनुमानित कीमत न दिखाएँ।

## Required database model (implementation specification)

Recommended entities:
- `packages`: package code, display name, price, currency, duration, active flag.
- `package_features`: package code, feature key, enabled flag, limits.
- `subscriptions`: user_id, package_code, selected_study, status, starts_at, expires_at, approved_by, approved_at.
- `payment_requests`: user_id, subscription_id, amount, currency, payment reference, proof storage path, status, reviewed_by, reviewed_at, rejection_reason.
- `admin_audit_logs`: actor, action, target user, before/after metadata, timestamp.

## Required state transitions

`draft -> pending -> approved -> active -> expired`

Alternative:
`pending -> rejected`

Never allow `pending` or `rejected` to grant access.

## Security requirements

- Supabase RLS must restrict users to their own subscription and payment records.
- Users must not update their own `status`, `approved_by`, `approved_at`, `expires_at`, `role`, or entitlement fields.
- Only authorized server-side Admin actions may approve/reject or change packages.
- Payment proof must be stored in a private bucket and accessed via signed URLs.
- Validate amount, package code, currency, user identity and payment reference server-side.
- Record every approval, rejection, package change and manual entitlement adjustment in an audit log.
- Do not place Supabase `service_role` credentials in browser JavaScript.

## Current implementation status

This document and `config.js` define the approved package-selection policy and configurable package catalogue. They do NOT constitute a live payment gateway, verified payment approval service, secure Admin backend, or deployed Supabase RLS implementation. Those require backend/database migrations, server-side functions, credentials, and live tests.
