-- Create job-files bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'job-files'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('job-files', 'job-files', true);
        
        -- Set RLS policies for the bucket
        -- Allow public read access
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Public Read Access',
            'bucket_id = ''job-files''::text',
            'job-files'
        );
    END IF;
END
$$;
