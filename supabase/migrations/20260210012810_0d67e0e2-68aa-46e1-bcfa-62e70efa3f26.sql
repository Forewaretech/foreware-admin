
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Shorthand for current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  category TEXT DEFAULT '',
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'page' CHECK (type IN ('page', 'landing')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Tracking codes table
CREATE TABLE public.tracking_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT DEFAULT '',
  placement TEXT NOT NULL DEFAULT 'header' CHECK (placement IN ('header', 'body', 'tag_manager')),
  type TEXT NOT NULL DEFAULT 'page' CHECK (type IN ('conversion', 'page', 'event')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  snippet TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tracking_codes ENABLE ROW LEVEL SECURITY;

-- Forms table
CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  thank_you_message TEXT DEFAULT 'Thank you for your submission!',
  target_emails TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  trigger_type TEXT NOT NULL DEFAULT 'embed' CHECK (trigger_type IN ('embed', 'popup_load', 'popup_scroll', 'popup_time')),
  trigger_config JSONB DEFAULT '{}'::jsonb,
  assigned_pages TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Form submissions table
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin());

-- RLS policies for blog_posts (admin only)
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS policies for pages (admin only)
CREATE POLICY "Admins can manage pages" ON public.pages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS policies for tracking_codes (admin only)
CREATE POLICY "Admins can manage tracking codes" ON public.tracking_codes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS policies for forms (admin only)
CREATE POLICY "Admins can manage forms" ON public.forms
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS policies for form_submissions
CREATE POLICY "Admins can manage submissions" ON public.form_submissions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Allow anonymous form submissions to active forms
CREATE POLICY "Anyone can submit to active forms" ON public.form_submissions
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_id AND forms.status = 'active'
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tracking_codes_updated_at BEFORE UPDATE ON public.tracking_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for CMS images
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-images', 'cms-images', true);

-- Storage policies
CREATE POLICY "Anyone can view CMS images" ON storage.objects FOR SELECT USING (bucket_id = 'cms-images');
CREATE POLICY "Authenticated users can upload CMS images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cms-images');
CREATE POLICY "Authenticated users can update CMS images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cms-images');
CREATE POLICY "Authenticated users can delete CMS images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cms-images');
