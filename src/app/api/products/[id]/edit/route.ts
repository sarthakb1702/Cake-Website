import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    let title = "";
    let price = 0;
    let description = "";
    let category = "";
    let imageUrl = "";

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      title = (formData.get("title") || formData.get("name") || "") as string;
      price = Number(formData.get("price") || 0);
      description = (formData.get("description") || "") as string;
      category = (formData.get("category") || "") as string;
      imageUrl = (formData.get("existingImage") || "") as string;

      const imageFile = formData.get("image");
      if (imageFile && typeof imageFile !== "string") {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        imageUrl = base64Image;
      }
    } else {
      const body = await request.json();
      title = body.title || body.name || "";
      price = Number(body.price || 0);
      description = body.description || "";
      category = body.category || "";
      imageUrl = body.image || body.imageUrl || body.photoUrl || body.bannerUrl || "";
    }

    const updatedProduct = {
      id,
      name: title,
      title,
      price,
      description,
      category,
      image: imageUrl,
      imageUrl,
      photoUrl: imageUrl,
      bannerUrl: imageUrl,
      updatedAt: new Date().toISOString(),
    };

    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
      imageUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
