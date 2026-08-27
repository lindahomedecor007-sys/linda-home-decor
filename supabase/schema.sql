GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Hero Section Table
CREATE TABLE IF NOT EXISTS public.hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subheading TEXT,
  title TEXT,
  image_url TEXT,
  mobile_image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.hero_section TO anon, authenticated, service_role;

ALTER TABLE public.hero_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on hero_section" ON public.hero_section
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on hero_section" ON public.hero_section
  FOR ALL USING (true) WITH CHECK (true);

-- Featured Section Table (Heading + 4 Featured Category / Product Blocks)
CREATE TABLE IF NOT EXISTS public.featured_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT,
  item1_title TEXT,
  item1_image_url TEXT,
  item1_link TEXT,
  item2_title TEXT,
  item2_image_url TEXT,
  item2_link TEXT,
  item3_title TEXT,
  item3_image_url TEXT,
  item3_link TEXT,
  item4_title TEXT,
  item4_image_url TEXT,
  item4_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.featured_section TO anon, authenticated, service_role;

ALTER TABLE public.featured_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on featured_section" ON public.featured_section
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on featured_section" ON public.featured_section
  FOR ALL USING (true) WITH CHECK (true);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  catalog_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on categories" ON public.categories
  FOR ALL USING (true) WITH CHECK (true);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT,
  category_name TEXT,
  description TEXT,
  specifications JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  sub_images JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

-- Brands Section Table (Sub Title, Main Heading, Brand Logos Array)
CREATE TABLE IF NOT EXISTS public.brands_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_title TEXT,
  heading TEXT,
  brands JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.brands_section TO anon, authenticated, service_role;

ALTER TABLE public.brands_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on brands_section" ON public.brands_section
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on brands_section" ON public.brands_section
  FOR ALL USING (true) WITH CHECK (true);

-- Statistics Section Table (Title, Items Array with Value and Label)
CREATE TABLE IF NOT EXISTS public.statistics_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Our Achievements.',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.statistics_section TO anon, authenticated, service_role;

ALTER TABLE public.statistics_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on statistics_section" ON public.statistics_section
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on statistics_section" ON public.statistics_section
  FOR ALL USING (true) WITH CHECK (true);

-- Who We Are Section Table (Image, Subtitle, Heading, Description, Button, Show Stats Toggle, Mini Stats Array)
CREATE TABLE IF NOT EXISTS public.who_we_are_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  subtitle TEXT,
  heading TEXT,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  show_stats BOOLEAN DEFAULT true,
  stats JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.who_we_are_section TO anon, authenticated, service_role;

ALTER TABLE public.who_we_are_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on who_we_are_section" ON public.who_we_are_section
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on who_we_are_section" ON public.who_we_are_section
  FOR ALL USING (true) WITH CHECK (true);

-- Company Settings Table (Company Name, Tagline, Email, Phones, Address, Social Links, Hours, Website)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  tagline TEXT,
  email TEXT,
  phone TEXT,
  alternate_phone TEXT,
  whatsapp_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  google_maps_link TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  opening_hours TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.company_settings TO anon, authenticated, service_role;

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on company_settings" ON public.company_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on company_settings" ON public.company_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Enquiries Table (Customer contact form submissions)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.enquiries TO anon, authenticated, service_role;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all access on enquiries" ON public.enquiries
  FOR ALL USING (true) WITH CHECK (true);

-- About Section Table
CREATE TABLE IF NOT EXISTS public.about_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_image_url TEXT DEFAULT '',
  about_subtitle TEXT DEFAULT '',
  about_heading TEXT DEFAULT '',
  about_paragraph TEXT DEFAULT '',
  vision_heading TEXT DEFAULT '',
  vision_paragraph TEXT DEFAULT '',
  vision_image_url TEXT DEFAULT '',
  mission_heading TEXT DEFAULT '',
  mission_paragraph TEXT DEFAULT '',
  mission_image_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.about_section TO anon, authenticated, service_role;

ALTER TABLE public.about_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on about_section" ON public.about_section
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on about_section" ON public.about_section
  FOR ALL USING (true) WITH CHECK (true);

-- Services Section Table
CREATE TABLE IF NOT EXISTS public.services_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT DEFAULT '',
  banner_image_url TEXT DEFAULT '',
  services JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT ALL ON TABLE public.services_section TO anon, authenticated, service_role;

ALTER TABLE public.services_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on services_section" ON public.services_section
  FOR SELECT USING (true);

CREATE POLICY "Allow all access on services_section" ON public.services_section
  FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- Supabase Storage Bucket for Large Catalogues / PDF Documents
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogs', 'catalogs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access on catalogs bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'catalogs');

CREATE POLICY "Allow public upload on catalogs bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'catalogs');

CREATE POLICY "Allow public update and delete on catalogs bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'catalogs');

