-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own operations" ON public.ccb_operations;

-- Create new policy that allows users to view their own operations OR admins to view all
CREATE POLICY "Users can view operations"
ON public.ccb_operations
FOR SELECT
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

-- Also allow viewing by PA for agency users
CREATE POLICY "Users can view operations by PA"
ON public.ccb_operations
FOR SELECT
USING (
  pa IN (
    SELECT p.pa FROM public.profiles p WHERE p.user_id = auth.uid() AND p.pa IS NOT NULL
  )
);