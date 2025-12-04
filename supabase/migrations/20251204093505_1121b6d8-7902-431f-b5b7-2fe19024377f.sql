-- Policy for admin to update all operations
CREATE POLICY "Admin can update all operations"
ON public.ccb_operations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy for admin to delete all operations
CREATE POLICY "Admin can delete all operations"
ON public.ccb_operations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));