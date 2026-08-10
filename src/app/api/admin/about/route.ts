import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
    let storyLine1 = "";
    let storyLine2 = "";
    let foundedYear = "";
    let cakesServed = "";
    let photo1 = "";
    let photo2 = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = (formData.get("title") || "") as string;
      storyLine1 = (formData.get("storyLine1") || "") as string;
      storyLine2 = (formData.get("storyLine2") || "") as string;
      foundedYear = (formData.get("foundedYear") || "") as string;
      cakesServed = (formData.get("cakesServed") || "") as string;
      photo1 = (formData.get("existingPhoto1") || "") as string;
      photo2 = (formData.get("existingPhoto2") || "") as string;

      const file1 = formData.get("photo1File");
      if (file1 && typeof file1 !== "string") {
        const buffer = Buffer.from(await file1.arrayBuffer());
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const res = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: "shreyas-about" },
              (err, result) => (err ? reject(err) : resolve(result))
            ).end(buffer);
          });
          if (res?.secure_url) photo1 = res.secure_url;
        } else {
          photo1 = `data:${file1.type};base64,${buffer.toString("base64")}`;
        }
      }

      const file2 = formData.get("photo2File");
      if (file2 && typeof file2 !== "string") {
        const buffer = Buffer.from(await file2.arrayBuffer());
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const res = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: "shreyas-about" },
              (err, result) => (err ? reject(err) : resolve(result))
            ).end(buffer);
          });
          if (res?.secure_url) photo2 = res.secure_url;
        } else {
          photo2 = `data:${file2.type};base64,${buffer.toString("base64")}`;
        }
      }
    } else {
      const body = await request.json();
      title = body.title || "";
      storyLine1 = body.storyLine1 || "";
      storyLine2 = body.storyLine2 || "";
      foundedYear = body.foundedYear || "";
      cakesServed = body.cakesServed || "";
      photo1 = body.photo1 || "";
      photo2 = body.photo2 || "";
    }

    const updatedData = {
      title,
      storyLine1,
      storyLine2,
      foundedYear,
      cakesServed,
      photo1,
      photo2,
      updatedAt: new Date().toISOString(),
    };

    revalidatePath("/");
    revalidatePath("/admin/about");

    return NextResponse.json({
      success: true,
      message: "About section updated successfully",
      data: updatedData,
    });
  } catch (error: any) {
    console.error("Error updating About section:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update About section" },
      { status: 500 }
    );
  }
}
