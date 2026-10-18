-- ==============================================================================
-- BrightPath CRM Complete Database Schema & Row Level Security (RLS) Policies
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/vpcypgbaudduzoxrcuri/sql
-- ==============================================================================

-- 1. Leads & Activities
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

CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'call', 'email', 'demo', 'note', 'status_change'
    summary TEXT NOT NULL,
    details TEXT,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'test_prep', 'academic_k12', 'language', 'computer_science'
    description TEXT NOT NULL,
    duration_weeks INT NOT NULL DEFAULT 12,
    total_fee NUMERIC NOT NULL DEFAULT 1000,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Batches
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    schedule_time TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 25,
    enrolled_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    enrolled_course_id UUID REFERENCES public.courses(id),
    enrolled_batch_id UUID REFERENCES public.batches(id),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'graduated', 'dropped'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Fee Records
CREATE TABLE IF NOT EXISTS public.fee_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    balance_amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'partially_paid', 'paid'
    last_payment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- Permissive Development Policies
DROP POLICY IF EXISTS "Allow anon all leads" ON public.leads;
CREATE POLICY "Allow anon all leads" ON public.leads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all activities" ON public.lead_activities;
CREATE POLICY "Allow anon all activities" ON public.lead_activities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all courses" ON public.courses;
CREATE POLICY "Allow anon all courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all batches" ON public.batches;
CREATE POLICY "Allow anon all batches" ON public.batches FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all students" ON public.students;
CREATE POLICY "Allow anon all students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all fee_records" ON public.fee_records;
CREATE POLICY "Allow anon all fee_records" ON public.fee_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Grant privileges
GRANT ALL ON TABLE public.leads TO anon, authenticated;
GRANT ALL ON TABLE public.lead_activities TO anon, authenticated;
GRANT ALL ON TABLE public.courses TO anon, authenticated;
GRANT ALL ON TABLE public.batches TO anon, authenticated;
GRANT ALL ON TABLE public.students TO anon, authenticated;
GRANT ALL ON TABLE public.fee_records TO anon, authenticated;
