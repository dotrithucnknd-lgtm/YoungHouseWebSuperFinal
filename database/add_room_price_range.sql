-- Add price range columns for buildings with multiple room types
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS min_price NUMERIC;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS max_price NUMERIC;

-- Backfill existing rows
UPDATE public.rooms
SET
  min_price = COALESCE(min_price, price),
  max_price = COALESCE(max_price, price)
WHERE min_price IS NULL OR max_price IS NULL;
