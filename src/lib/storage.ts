import { supabase } from "./supabase";

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'job-files')
 * @param path Optional path within the bucket
 * @returns URL of the uploaded file or null if upload failed
 */
export async function uploadFile(
  file: File,
  bucket: string = "job-files",
  path?: string,
): Promise<string | null> {
  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    console.log(`Uploading file to ${bucket}/${filePath}`);

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file to Supabase:", error);

      // Always use blob URL as fallback in case of any error
      console.log("Upload failed, using blob URL as fallback");
      try {
        return URL.createObjectURL(file);
      } catch (blobError) {
        console.error("Failed to create blob URL:", blobError);
        return null;
      }
    }

    // Get the public URL for the file
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    console.log("File uploaded successfully, public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadFile:", error);
    // Create a blob URL as fallback if Supabase upload fails
    try {
      return URL.createObjectURL(file);
    } catch (blobError) {
      console.error("Failed to create blob URL:", blobError);
      return null;
    }
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
