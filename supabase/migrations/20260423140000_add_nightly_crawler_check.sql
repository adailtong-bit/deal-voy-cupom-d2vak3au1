-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $do$
BEGIN
  -- 1. Unschedule if it already exists to keep it idempotent
  PERFORM cron.unschedule('check-expired-promotions-nightly');
  
  -- 2. Schedule the nightly check at midnight UTC
  PERFORM cron.schedule(
    'check-expired-promotions-nightly',
    '0 0 * * *',
    $$
    SELECT net.http_post(
        url := 'https://ipuitncmmcvjihqtovzk.supabase.co/functions/v1/check-expired-promotions',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to schedule cron job check-expired-promotions-nightly: %', SQLERRM;
END $do$;
