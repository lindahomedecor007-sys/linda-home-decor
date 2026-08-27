import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import os from "os";
import path from "path";
import fs from "fs";
import { supabase } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const maxDuration = 60;

function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "linda-home-decor";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type.includes("pdf");

    // =========================================================================
    // 1. PDF DOCUMENTS -> Store directly in Supabase Storage ('catalogs' bucket)
    // =========================================================================
    if (isPdf) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const storagePath = `${cleanName}_${Date.now()}.pdf`;

      // Upload directly to Supabase Storage
      let uploadRes = await supabase.storage
        .from("catalogs")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      // If bucket does not exist, try creating it and retry
      if (uploadRes.error && uploadRes.error.message.toLowerCase().includes("bucket not found")) {
        try {
          await supabase.storage.createBucket("catalogs", { public: true });
          uploadRes = await supabase.storage
            .from("catalogs")
            .upload(storagePath, buffer, {
              contentType: "application/pdf",
              upsert: true,
            });
        } catch (bucketCreateErr) {
          console.warn("Could not auto-create bucket:", bucketCreateErr);
        }
      }

      if (uploadRes.error) {
        console.error("Supabase PDF storage error:", uploadRes.error);
        return NextResponse.json(
          {
            error: `Supabase Storage error: ${uploadRes.error.message}. Please make sure the 'catalogs' public bucket is created in your Supabase project.`,
          },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("catalogs")
        .getPublicUrl(uploadRes.data.path);

      return NextResponse.json({
        url: publicUrlData.publicUrl,
        public_id: uploadRes.data.path,
        format: "pdf",
        resource_type: "raw",
        storage: "supabase",
      });
    }

    // =========================================================================
    // 2. IMAGES -> Store in Cloudinary for optimization
    // =========================================================================
    const mimeType = file.type || "image/jpeg";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "image",
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      resource_type: "image",
      storage: "cloudinary",
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, public_id, resource_type = "image" } = body;

    // Supabase storage deletion
    if (url && (url.includes("supabase.co") || url.includes("/catalogs/"))) {
      const pathParts = url.split("/catalogs/");
      const filePath = pathParts[1] || public_id;
      if (filePath) {
        await supabase.storage.from("catalogs").remove([decodeURIComponent(filePath)]);
      }
      return NextResponse.json({ success: true, storage: "supabase" });
    }

    // Cloudinary deletion
    let targetPublicId = public_id;
    if (!targetPublicId && url) {
      targetPublicId = getPublicIdFromUrl(url);
    }

    if (!targetPublicId) {
      return NextResponse.json(
        { message: "Not a Cloudinary URL or no public_id found" },
        { status: 200 }
      );
    }

    const result = await cloudinary.uploader.destroy(targetPublicId, {
      resource_type,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete file" },
      { status: 500 }
    );
  }
}
