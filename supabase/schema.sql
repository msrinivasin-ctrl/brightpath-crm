-- ==============================================================================
-- BrightPath CRM Database Schema & Row Level Security (RLS) Policies
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/vpcypgbaudduzoxrcuri/sql
-- ==============================================================================

-- 1. Create leads table (if not exists)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    parent_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    grade_level TEXT,
    course_interest TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'website',
    status TEXT NOT NULL DEFAULT 'new',
    counselor_assigned TEXT NOT NULL DEFAULT 'Sarah Jenkins',
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create lead activity logs table
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'call', 'email', 'demo', 'note', 'status_change'
    summary TEXT NOT NULL,
    details TEXT,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive development policies for anon / authenticated roles
-- (Allows the frontend app using publishable anon key to read, insert, and update)
DROP POLICY IF EXISTS "Allow anon read leads" ON public.leads;
CREATE POLICY "Allow anon read leads" ON public.leads
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert leads" ON public.leads;
CREATE POLICY "Allow anon insert leads" ON public.leads
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update leads" ON public.leads;
CREATE POLICY "Allow anon update leads" ON public.leads
    FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon delete leads" ON public.leads;
CREATE POLICY "Allow anon delete leads" ON public.leads
    FOR DELETE TO anon, authenticated USING (true);

-- Lead Activities policies
DROP POLICY IF EXISTS "Allow anon read activities" ON public.lead_activities;
CREATE POLICY "Allow anon read activities" ON public.lead_activities
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert activities" ON public.lead_activities;
CREATE POLICY "Allow anon insert activities" ON public.lead_activities
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. Grant permissions to anon and authenticated roles
GRANT ALL ON TABLE public.leads TO anon, authenticated;
GRANT ALL ON TABLE public.lead_activities TO anon, authenticated;
