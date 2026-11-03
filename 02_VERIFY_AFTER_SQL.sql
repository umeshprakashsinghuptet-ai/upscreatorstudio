-- Read-only verification after 01_DATABASE_MIGRATION.sql
SELECT package_code, audience, display_name, amount_paise, duration_days, enabled
FROM public.subscription_packages
ORDER BY sort_order;

SELECT
  has_table_privilege('authenticated','public.subscription_packages','SELECT') AS packages_select,
  has_table_privilege('authenticated','public.user_subscriptions','SELECT') AS subscriptions_select,
  has_table_privilege('authenticated','public.payment_transactions','SELECT') AS payments_select;

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('subscription_packages','user_subscriptions','payment_transactions','admin_audit_logs')
ORDER BY tablename;
