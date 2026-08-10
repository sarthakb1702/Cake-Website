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
    let id = "";
    let name = "";
    let note = "";
    let price = "";
    let mainTitle = "";
    let subDescription = "";
    let imageUrl = "";

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      id = (formData.get("id") || "") as string;
      name = (formData.get("name") || "") as string;
      note = (formData.get("note") || "") as string;
      price = (formData.get("price") || "") as string;
      mainTitle = (formData.get("mainTitle") || "") as string;
      subDescription = (formData.get("subDescription") || "") as string;
      imageUrl = (formData.get("existingImage") || "") as string;

      const imageFile = formData.get("image");
      if (imageFile && typeof imageFile !== "string") {
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "shreyas-hero-slides" },
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
      id = body.id || "";
      name = body.name || "";
      note = body.note || "";
      price = body.price || "";
      mainTitle = body.mainTitle || "";
      subDescription = body.subDescription || "";
      imageUrl = body.image || "";
    }

    const updatedSlide = {
      id,
      name,
      note,
      price,
      mainTitle,
      subDescription,
      image: imageUrl,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Hero slide updated successfully",
      slide: updatedSlide,
      imageUrl,
    });
  } catch (error: any) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update hero slide" },
      { status: 500 }
    );
  }
}
