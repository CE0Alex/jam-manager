import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
let supabaseInstance = null;
// Create the Supabase client only if URL and key are available
export const supabase = (() => {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase URL or anon key not provided. Some features may not work.");
        // Return a mock client with graceful fallbacks for methods
        const mockClient = {
            storage: {
                listBuckets: () => Promise.resolve({ data: [], error: null }),
                createBucket: () => Promise.resolve({ error: null }),
                from: () => ({
                    upload: () => Promise.resolve({
                        data: null,
                        error: { message: "Mock client used" },
                    }),
                    getPublicUrl: () => ({ data: { publicUrl: "" } }),
                    remove: () => Promise.resolve({ error: null }),
                    createSignedUrl: () => Promise.resolve({ data: { signedUrl: "" }, error: null }),
                }),
            },
        };
        return mockClient;
    }
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
})();
// Initialize storage buckets if they don't exist
export async function initializeStorage() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase credentials not available. Skipping storage initialization.");
        return;
    }
    try {
        // Use a timeout to prevent hanging if the request takes too long
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Storage initialization timed out")), 5000);
        });
        const initPromise = (async () => {
            console.log("Initializing Supabase storage...");
            // Check if the job-files bucket exists, create it if it doesn't
            const { data: buckets, error } = await supabase.storage.listBuckets();
            if (error) {
                console.error("Error checking storage buckets:", error);
                return;
            }
            console.log("Available buckets:", buckets?.map((b) => b.name) || "none");
            const jobFilesBucketExists = buckets?.some((bucket) => bucket.name === "job-files");
            if (!jobFilesBucketExists) {
                console.log("Creating job-files bucket...");
                // Disable RLS check for bucket creation in development environment
                const { error: createError } = await supabase.storage.createBucket("job-files", {
                    public: true, // Files are publicly accessible
                    fileSizeLimit: 10485760, // 10MB limit
                });
                if (createError) {
                    console.error("Error creating job-files bucket:", createError);
                    console.log("Continuing despite bucket creation error - this is expected in some environments");
                }
                else {
                    console.log("Created job-files storage bucket successfully");
                }
            }
            else {
                console.log("job-files bucket already exists");
            }
        })();
        // Race between the initialization and the timeout
        await Promise.race([initPromise, timeoutPromise]);
    }
    catch (error) {
        console.error("Error initializing storage:", error);
        console.log("Continuing despite storage initialization error");
    }
}
