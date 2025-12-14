-- =====================================================
-- ADMIN APPROVAL SYSTEM FOR MOSQUE ADMIN
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add admin columns if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_by UUID;

-- Create super_admins table for managing approvals
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    permissions JSONB DEFAULT '{"approve_mosques": true, "suspend_mosques": true, "manage_users": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to approve a mosque
CREATE OR REPLACE FUNCTION public.approve_mosque(mosque_id_input UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.mosques 
    SET status = 'approved', 
        updated_at = NOW()
    WHERE id = mosque_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a mosque
CREATE OR REPLACE FUNCTION public.reject_mosque(mosque_id_input UUID, reason TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.mosques 
    SET status = 'rejected', 
        rejection_reason = reason,
        updated_at = NOW()
    WHERE id = mosque_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend a mosque
CREATE OR REPLACE FUNCTION public.suspend_mosque(mosque_id_input UUID, reason TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.mosques 
    SET status = 'suspended', 
        suspension_reason = reason,
        updated_at = NOW()
    WHERE id = mosque_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin dashboard
CREATE OR REPLACE VIEW public.pending_mosques AS
SELECT 
    m.id,
    m.name,
    m.address,
    m.phone,
    m.latitude,
    m.longitude,
    m.status,
    m.created_at,
    u.email as admin_email,
    u.first_name || ' ' || u.last_name as admin_name
FROM public.mosques m
LEFT JOIN public.users u ON m.admin_id = u.id
WHERE m.status = 'pending'
ORDER BY m.created_at ASC;

-- Grant access to view
GRANT SELECT ON public.pending_mosques TO authenticated;

-- =====================================================
-- Quick Admin Commands (Run these manually as needed)
-- =====================================================

-- To approve a mosque:
-- SELECT public.approve_mosque('mosque-uuid-here');

-- To reject a mosque:
-- SELECT public.reject_mosque('mosque-uuid-here', 'Reason for rejection');

-- To suspend a mosque:
-- SELECT public.suspend_mosque('mosque-uuid-here', 'Reason for suspension');

-- To view all pending mosques:
-- SELECT * FROM public.pending_mosques;

-- To make a user a super admin:
-- INSERT INTO public.super_admins (user_id) 
-- SELECT id FROM public.users WHERE email = 'admin@example.com';
