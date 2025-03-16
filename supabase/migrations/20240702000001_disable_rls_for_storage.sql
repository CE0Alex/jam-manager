-- Disable RLS for storage.buckets to allow bucket creation
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Disable RLS for storage.objects to allow file operations
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
