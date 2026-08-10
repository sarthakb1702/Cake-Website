import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const caption = (formData.get("caption") || "") as string;
    const urlInput = (formData.get("urlInput") || "") as string;
    const file = formData.get("imageFile");

    let finalUrl = urlInput;

    if (file && typeof file !== "string") {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "shreyas-gallery" },
            (error, result) => (error ? reject(error) : resolve(result))
          ).end(buffer);
        });

        if (uploadResult?.secure_url) {
          finalUrl = uploadResult.secure_url;
        }
      } else {
        finalUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/gallery");

    return NextResponse.json({
      success: true,
      message: "Gallery image uploaded successfully",
      url: finalUrl,
      caption,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload gallery image" },
      { status: 500 }
    );
  }
}
