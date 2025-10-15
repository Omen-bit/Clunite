import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Create Supabase client with service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize supabase only if we have the required configuration
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export async function POST(request: NextRequest) {
  console.log("Upload API called")
  
  try {
    // Check if Supabase is properly initialized
    if (!supabase) {
      console.error("Supabase client not initialized - missing configuration")
      return NextResponse.json({ 
        error: "Server configuration error. Please contact support." 
      }, { status: 500 })
    }

    console.log("Parsing form data...")
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    console.log("File received:", file ? `${file.name} (${file.size} bytes)` : "No file")
    console.log("User ID:", userId)

    if (!file) {
      console.error("No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validImageTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)." 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${timestamp}-${randomString}.${fileExtension}`

    console.log("Generated filename:", filename)

        // Convert File to Buffer for Supabase upload (Node expects Buffer/Blob)
        console.log("Converting file to buffer...")
        const arrayBuf = await file.arrayBuffer()
        // Use Buffer.from for Node environment compatibility
        const fileBuffer = Buffer.from(arrayBuf)
        console.log("Buffer size:", fileBuffer.byteLength)

        // Upload to Supabase Storage using service role (bypasses RLS for now)
        console.log("Uploading to Supabase Storage (root)...")
        const { data, error } = await supabase.storage
          .from("Event Banner")
          .upload(filename, fileBuffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          })

        if (error) {
          console.error("Supabase upload error:", error)
          return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
        }

        if (!data) {
          console.error("No data returned from Supabase upload")
          return NextResponse.json({ error: "No data returned from upload" }, { status: 500 })
        }

        console.log("Upload successful, data:", data)

        // Check if file exists in bucket after upload
        const { data: fileCheck, error: checkError } = await supabase.storage
          .from("Event Banner")
          .list("", { limit: 100 })
        if (checkError) {
          console.error("Error listing files in bucket:", checkError)
        } else {
          console.log("Files in bucket after upload:", fileCheck)
        }

  // Get the public URL
  const publicResult = supabase.storage.from("Event Banner").getPublicUrl(filename)
  const publicUrl = publicResult?.data?.publicUrl || null
        if (!publicUrl) {
          console.error("Failed to retrieve public URL for uploaded image")
        }
        console.log("Generated public URL:", publicUrl)

        return NextResponse.json({
          url: publicUrl,
          path: filename,
          size: file.size,
          type: file.type,
          debug: {
            uploadData: data,
            fileCheck,
            publicResult,
          }
        })
  } catch (error) {
    console.error("Upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ 
      error: "Upload failed. Please try again.",
      details: errorMessage 
    }, { status: 500 })
  }
}