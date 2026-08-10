import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    let weights: string[] = [];
    let shapes: string[] = [];
    let weightOptions: any[] = [];
    let weightVariants: any[] = [];
    let availableShapes: string[] = [];

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      title = (formData.get("title") || formData.get("name") || "") as string;
      price = Number(formData.get("price") || 0);
      description = (formData.get("description") || "") as string;
      category = (formData.get("category") || "") as string;
      imageUrl = (formData.get("existingImage") || "") as string;

      const weightsRaw = formData.get("weights");
      if (weightsRaw) {
        try { weights = JSON.parse(weightsRaw as string); } catch { weights = (weightsRaw as string).split(","); }
      }

      const shapesRaw = formData.get("shapes");
      if (shapesRaw) {
        try { shapes = JSON.parse(shapesRaw as string); } catch { shapes = (shapesRaw as string).split(","); }
      }

      const weightOptRaw = formData.get("weightOptions");
      if (weightOptRaw) {
        try { weightOptions = JSON.parse(weightOptRaw as string); } catch {}
      }

      const weightVarRaw = formData.get("weightVariants");
      if (weightVarRaw) {
        try { weightVariants = JSON.parse(weightVarRaw as string); } catch {}
      }

      const availShapesRaw = formData.get("availableShapes");
      if (availShapesRaw) {
        try { availableShapes = JSON.parse(availShapesRaw as string); } catch {}
      }

      const imageFile = formData.get("image");

      if (imageFile && typeof imageFile !== "string") {
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "shreyas-bakery-products" },
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
          // Fallback base64 string
          imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        }
      }
    } else {
      const body = await request.json();
      title = body.title || body.name || "";
      price = Number(body.price || 0);
      description = body.description || "";
      category = body.category || "";
      imageUrl = body.image || "";
      weights = body.weights || [];
      shapes = body.shapes || [];
      weightOptions = body.weightOptions || [];
      weightVariants = body.weightVariants || [];
      availableShapes = body.availableShapes || [];
    }

    const finalWeightVariants = weightVariants.length > 0
      ? weightVariants
      : (weightOptions.length > 0 ? weightOptions : weights.map(w => ({ weight: w, price })));

    const updatedProduct = {
      id,
      name: title,
      title,
      price: finalWeightVariants[0]?.price || price,
      description,
      category,
      image: imageUrl,
      weights,
      shapes,
      weightOptions: finalWeightVariants,
      weightVariants: finalWeightVariants,
      availableShapes: availableShapes.length > 0 ? availableShapes : shapes,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Product updated successfully with Cloudinary URL",
      product: updatedProduct,
      imageUrl: imageUrl,
    });
  } catch (error: any) {
    console.error("Error updating product with Cloudinary:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product with Cloudinary" },
      { status: 500 }
    );
  }
}
