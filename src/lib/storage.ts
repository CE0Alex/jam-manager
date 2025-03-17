import { supabase } from "./supabase";

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @returns The URL of the uploaded file, or null if the upload failed
 */
export async function uploadFile(file: File): Promise<string | null> {
  try {
    // First check if Supabase is available
    if (!isSupabaseAvailable()) {
      // Create and return a blob URL as fallback
      return createAndTrackBlobUrl(file);
    }

    // First, create a filename that avoids collisions
    const fileExtension = file.name.split('.').pop() || '';
    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('job-files')
      .upload(safeFileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error("Error uploading file to Supabase:", error);
      // Fallback to local blob URL if Supabase upload fails
      return createAndTrackBlobUrl(file);
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('job-files')
      .getPublicUrl(data?.path || safeFileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadFile:", error);
    // Fallback to local blob URL
    try {
      return createAndTrackBlobUrl(file);
    } catch (blobError) {
      console.error("Failed to create blob URL:", blobError);
      return null;
    }
  }
}

/**
 * Create a blob URL for a file and track it for later cleanup
 * @param file The file to create a blob URL for
 * @returns The blob URL
 */
function createAndTrackBlobUrl(file: File): string {
  const blobUrl = URL.createObjectURL(file);
  
  // Store this URL so we can revoke it later if needed
  const existingUrls = JSON.parse(localStorage.getItem('blobUrls') || '[]');
  existingUrls.push({
    url: blobUrl,
    created: new Date().toISOString(),
    filename: file.name
  });
  localStorage.setItem('blobUrls', JSON.stringify(existingUrls));
  
  return blobUrl;
}

/**
 * Check if Supabase is available for storage operations
 */
function isSupabaseAvailable(): boolean {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase configuration missing, using local storage fallback");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking Supabase availability:", error);
    return false;
  }
}

/**
 * Delete a file from Supabase storage
 * @param fileUrl The public URL of the file to delete
 * @param bucket The storage bucket name (default: 'job-files')
 * @returns true if deletion was successful, false otherwise
 */
export async function deleteFile(
  fileUrl: string,
  bucket: string = "job-files",
): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/");
    const filePath = pathParts[pathParts.length - 1];

    // Delete the file from Supabase storage
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteFile:", error);
    return false;
  }
}

/**
 * Get a temporary URL for a file that requires authentication
 * @param filePath The path to the file in the bucket
 * @param bucket The storage bucket name (default: 'job-files')
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns Temporary URL or null if failed
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = "job-files",
  expiresIn: number = 3600,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in getSignedUrl:", error);
    return null;
  }
}
