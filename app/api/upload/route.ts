import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    // Extracts public ID from Cloudinary URL format: .../upload/(v12345/)?(folder/name).ext
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: "linda-home-decor/hero",
      resource_type: "image",
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, public_id } = body;

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
      resource_type: "image",
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete image from Cloudinary" },
      { status: 500 }
    );
  }
}
