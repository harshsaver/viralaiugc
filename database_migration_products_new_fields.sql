-- Add new fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS value_proposition TEXT,
ADD COLUMN IF NOT EXISTS social_strategy TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.products.value_proposition IS 'Current value proposition of the app';
COMMENT ON COLUMN public.products.social_strategy IS 'Social strategy brain dump - testing ideas, market targeting, etc.'; 