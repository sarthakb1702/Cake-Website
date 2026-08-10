import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let description = "";
    let price = 0;
    let badgeText = "";
    let catalogProductId = "";
    let highlights: string[] = [];
    let imageUrl = "";

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      title = (formData.get("title") || "") as string;
      description = (formData.get("description") || "") as string;
      price = Number(formData.get("price") || 0);
      badgeText = (formData.get("badgeText") || "BAKE OF THE MONTH") as string;
      catalogProductId = (formData.get("catalogProductId") || "") as string;
      imageUrl = (formData.get("existingImage") || "") as string;
      
      const highlightsRaw = formData.get("highlights") as string;
      if (highlightsRaw) {
        try {
          highlights = JSON.parse(highlightsRaw);
        } catch {
          highlights = highlightsRaw.split(",").map((s) => s.trim());
        }
      }

      const imageFile = formData.get("image");
      if (imageFile && typeof imageFile !== "string") {
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "shreyas-bake-of-month" },
              (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(buffer);
          });

          if (uploadResult && uploadResult.secure_url) {
            imageUrl = uploadResult.secure_url;
          }
        } else {
          imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        }
      }
    } else {
      const body = await request.json();
      title = body.title || "";
      description = body.description || "";
      price = Number(body.price || 0);
      badgeText = body.badgeText || "BAKE OF THE MONTH";
      catalogProductId = body.catalogProductId || "";
      highlights = body.highlights || [];
      imageUrl = body.image || "";
    }

    const updatedBakeOfMonth = {
      title,
      description,
      price,
      badgeText,
      catalogProductId,
      highlights,
      image: imageUrl,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Bake of the Month updated successfully",
      data: updatedBakeOfMonth,
      imageUrl,
    });
  } catch (error: any) {
    console.error("Error updating Bake of the Month:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update Bake of the Month" },
      { status: 500 }
    );
  }
}
