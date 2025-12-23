import { createSupabaseServerAdminClient } from "@/lib/supabase/admin";
import { MEDIA_UPLOAD_CONSTRAINTS } from "@/lib/app-utils";

async function setupMediaUploadsStorage(): Promise<void> {
  console.log("\n🚀 Setting up media uploads storage...");

  // IMPORTANT: Before running this script, ensure the Supabase project has adequate global file size limit
  // 1. Go to Supabase Dashboard → Project Settings → Storage
  // 2. Set "Global file size limit" to at least 2 GB (2048 MB)
  // 3. Click "Save"
  // Without this, the bucket configuration below will fail or uploads will be rejected

  const supabase = createSupabaseServerAdminClient();

  try {
    // Check if bucket already exists
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketExists = existingBuckets?.some(
      (bucket: { id: string }) =>
        bucket.id === MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME
    );

    if (bucketExists) {
      console.log(
        `✅ Storage bucket '${MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME}' already exists`
      );

      // Update bucket to ensure file size limit is set
      console.log("🔄 Updating bucket configuration...");
      const { error: updateError } = await supabase.storage.updateBucket(
        MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME,
        {
          public: false,
          allowedMimeTypes: [...MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES],
          fileSizeLimit: MEDIA_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE, // 2GB max
        }
      );

      if (updateError) {
        console.error("❌ Error updating storage bucket:", updateError);
        throw updateError;
      }

      console.log(
        `✅ Storage bucket '${MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME}' updated successfully`
      );
    } else {
      // Create the storage bucket - PRIVATE for security
      const { error: bucketError } = await supabase.storage.createBucket(
        MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME,
        {
          public: false, // PRIVATE bucket - files accessed via signed URLs
          allowedMimeTypes: [...MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES],
          fileSizeLimit: MEDIA_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE, // 2GB max
        }
      );

      if (bucketError) {
        console.error("❌ Error creating storage bucket:", bucketError);
        throw bucketError;
      }

      console.log(
        `✅ Storage bucket '${MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME}' created successfully (PRIVATE)`
      );

      console.log(
        `🔒 Note: RLS policies need to be created via database migration`
      );
    }

    console.log("🎉 Media uploads storage setup complete!");
    console.log(`📁 Bucket: ${MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME} (PRIVATE)`);
    console.log("🔐 Access: Signed URLs (1hr upload, 24hr download)");
    console.log("📏 Size limit: 2GB max");
    console.log("🎵 Allowed types: MP3, MP4, WAV, MOV, M4A");
  } catch (error) {
    console.error("❌ Media uploads storage setup failed:", error);
    throw error;
  }
}

async function setupStorageBuckets(): Promise<void> {
  console.log("🔧 Supabase Storage Setup");
  console.log("========================\n");

  // CRITICAL: Display prerequisite warning
  console.log("⚠️  IMPORTANT PREREQUISITE:");
  console.log(
    "Before proceeding, ensure your Supabase project's global file size limit is set to at least 2 GB"
  );
  console.log(
    "📍 Supabase Dashboard → Project Settings → Storage → Global file size limit"
  );
  console.log("💡 Set to: 2 GB (or 2048 MB)");
  console.log(
    "⏸️  Press Ctrl+C to cancel if you need to update this setting first.\n"
  );

  // Verify required environment variables
  if (!process.env.SUPABASE_URL) {
    console.error("❌ Missing environment variable: SUPABASE_URL");
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  try {
    await setupMediaUploadsStorage();
  } catch (error) {
    console.error("\n❌ Storage setup failed:", error);
    process.exit(1);
  }
}

// Run the setup
setupStorageBuckets().then(() => {
  console.log("\n✨ Storage bucket setup completed successfully!");
  process.exit(0);
});
