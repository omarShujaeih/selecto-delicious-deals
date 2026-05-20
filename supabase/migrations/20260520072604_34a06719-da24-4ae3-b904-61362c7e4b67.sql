
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS pickup_time text;

DROP POLICY IF EXISTS "user_roles self insert restaurant" ON public.user_roles;
